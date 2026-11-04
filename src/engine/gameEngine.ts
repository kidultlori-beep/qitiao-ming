import type {
  ChapterPack,
  Choice,
  ChoiceEffect,
  ChoiceRequirement,
  CheckpointSnapshot,
  GameState,
  LedgerEntry,
  SceneNode,
} from '../types/schema';
import { INITIAL_LIVES } from '../types/schema';
import { writeSave } from './save';

export function createNewGame(pack: ChapterPack): GameState {
  const now = new Date().toISOString();
  const state: GameState = {
    packId: pack.id,
    nodeId: pack.startNode,
    lives: INITIAL_LIVES,
    maxLives: INITIAL_LIVES,
    ledger: [],
    bonds: {},
    publicity: 0,
    flags: [],
    checkpointNodeId: pack.startNode,
    checkpointSnapshot: null,
    endingId: null,
    deathCount: 0,
    startedAt: now,
    updatedAt: now,
  };
  // 首节点设为检查点
  return applyOnEnter(takeCheckpoint(state), pack);
}

function cloneLedger(list: LedgerEntry[]): LedgerEntry[] {
  return list.map((e) => ({ ...e }));
}

function takeCheckpoint(state: GameState): GameState {
  const snap: CheckpointSnapshot = {
    nodeId: state.nodeId,
    flags: [...state.flags],
    bonds: { ...state.bonds },
    publicity: state.publicity,
    ledger: cloneLedger(state.ledger),
  };
  return {
    ...state,
    checkpointNodeId: state.nodeId,
    checkpointSnapshot: snap,
  };
}

function applyEffect(state: GameState, effect: ChoiceEffect | undefined): GameState {
  if (!effect) return state;
  let next = { ...state };

  if (effect.setFlags?.length) {
    const set = new Set(next.flags);
    effect.setFlags.forEach((f) => set.add(f));
    next.flags = [...set];
  }
  if (effect.clearFlags?.length) {
    const kill = new Set(effect.clearFlags);
    next.flags = next.flags.filter((f) => !kill.has(f));
  }
  if (effect.addLedger?.length) {
    const exist = new Set(next.ledger.map((e) => e.id));
    const added = effect.addLedger
      .filter((e) => !exist.has(e.id))
      .map((e) => ({ ...e, confirmed: false } as LedgerEntry));
    next.ledger = [...next.ledger, ...added];
  }
  if (effect.confirmLedger?.length) {
    const ids = new Set(effect.confirmLedger);
    next.ledger = next.ledger.map((e) =>
      ids.has(e.id) ? { ...e, confirmed: true } : e,
    );
  }
  if (effect.deltaBonds) {
    const bonds = { ...next.bonds };
    for (const [k, v] of Object.entries(effect.deltaBonds)) {
      bonds[k] = (bonds[k] ?? 0) + v;
    }
    next.bonds = bonds;
  }
  if (typeof effect.deltaPublicity === 'number') {
    next.publicity = Math.max(0, Math.min(100, next.publicity + effect.deltaPublicity));
  }
  if (effect.checkpoint) {
    next = takeCheckpoint({ ...next, nodeId: effect.goto ?? next.nodeId });
  }
  if (effect.goto) {
    next.nodeId = effect.goto;
  }
  if (effect.ending) {
    next.endingId = effect.ending;
  }
  return next;
}

function applyOnEnter(state: GameState, pack: ChapterPack): GameState {
  const node = pack.nodes.find((n) => n.id === state.nodeId);
  if (!node?.onEnter) return state;
  let next = applyEffect(state, node.onEnter);
  // onEnter 的 checkpoint 应基于进入后的节点
  if (node.onEnter.checkpoint) {
    next = takeCheckpoint({ ...next, nodeId: next.nodeId });
  }
  return next;
}

export function meetsRequirement(
  state: GameState,
  req?: ChoiceRequirement,
): boolean {
  if (!req) return true;
  if (req.flags) {
    for (const f of req.flags) {
      if (!state.flags.includes(f)) return false;
    }
  }
  if (req.ledger) {
    const ids = new Set(state.ledger.map((e) => e.id));
    for (const id of req.ledger) {
      if (!ids.has(id)) return false;
    }
  }
  if (req.bonds) {
    for (const [npc, min] of Object.entries(req.bonds)) {
      if ((state.bonds[npc] ?? 0) < min) return false;
    }
  }
  if (typeof req.minPublicity === 'number' && state.publicity < req.minPublicity) {
    return false;
  }
  if (typeof req.maxPublicity === 'number' && state.publicity > req.maxPublicity) {
    return false;
  }
  return true;
}

export function getVisibleChoices(state: GameState, node: SceneNode): Choice[] {
  const list = node.choices ?? [];
  return list.filter((c) => {
    if (meetsRequirement(state, c.require)) return true;
    return !!c.showLocked;
  });
}

export function handleDeath(state: GameState, pack: ChapterPack): GameState {
  const lives = state.lives - 1;
  const deathCount = state.deathCount + 1;
  if (lives <= 0) {
    return {
      ...state,
      lives: 0,
      deathCount,
      endingId: 'game_over',
      updatedAt: new Date().toISOString(),
    };
  }

  const snap = state.checkpointSnapshot;
  if (!snap) {
    // 无检查点：回到开局节点，只保留已确认账本
    const confirmed = state.ledger.filter((e) => e.confirmed);
    let next: GameState = {
      ...state,
      lives,
      deathCount,
      nodeId: pack.startNode,
      flags: [],
      bonds: {},
      publicity: 0,
      ledger: confirmed,
      endingId: null,
      updatedAt: new Date().toISOString(),
    };
    next = applyOnEnter(next, pack);
    return next;
  }

  // 回流检查点：保留已确认账本；检查点快照中的未确认也恢复
  const confirmedNow = state.ledger.filter((e) => e.confirmed);
  const confirmedIds = new Set(confirmedNow.map((e) => e.id));
  const fromSnap = snap.ledger.filter((e) => !confirmedIds.has(e.id));
  const merged = [...confirmedNow, ...fromSnap.map((e) => ({ ...e }))];

  let next: GameState = {
    ...state,
    lives,
    deathCount,
    nodeId: snap.nodeId,
    flags: [...snap.flags],
    bonds: { ...snap.bonds },
    publicity: snap.publicity,
    ledger: merged,
    endingId: null,
    updatedAt: new Date().toISOString(),
  };
  next = applyOnEnter(next, pack);
  return next;
}

export type StepResult = {
  state: GameState;
  died: boolean;
  livesLeft?: number;
};

export function chooseOption(
  state: GameState,
  pack: ChapterPack,
  choice: Choice,
): StepResult {
  if (!meetsRequirement(state, choice.require)) {
    return { state, died: false };
  }

  const effect = choice.effects;

  if (effect.death) {
    // 先应用非死亡副作用（如加账本提示），再死亡
    let next = applyEffect(state, { ...effect, death: undefined, goto: undefined, ending: undefined });
    next = handleDeath(next, pack);
    writeSave(next);
    return { state: next, died: true, livesLeft: next.lives };
  }

  let next = applyEffect(state, effect);

  // 若 goto 到新节点，处理 onEnter
  if (effect.goto && effect.goto !== state.nodeId) {
    next = applyOnEnter(next, pack);
  }

  // checkpoint 标记且未显式 goto：以当前节点为检查点
  if (effect.checkpoint && !effect.goto) {
    next = takeCheckpoint(next);
  }

  writeSave(next);
  return { state: next, died: false };
}

export function continueNarration(state: GameState, pack: ChapterPack): GameState {
  const node = getNode(pack, state.nodeId);
  if (!node?.autoGoto) return state;
  let next = { ...state, nodeId: node.autoGoto };
  next = applyOnEnter(next, pack);
  writeSave(next);
  return next;
}

export function getNode(pack: ChapterPack, id: string): SceneNode | undefined {
  return pack.nodes.find((n) => n.id === id);
}

export function getEnding(pack: ChapterPack, id: string) {
  return pack.endings?.find((e) => e.id === id);
}
