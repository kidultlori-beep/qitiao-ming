/** 七条命 — 关卡 JSON Schema 类型定义 */

export type LedgerKind = '人' | '事' | '物' | '数';

export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  title: string;
  detail: string;
  /** 死亡回流后仍保留已确认条目 */
  confirmed: boolean;
}

export interface SpeakerLine {
  speaker: string;
  text: string;
}

export interface ChoiceRequirement {
  flags?: string[];
  /** 需要已拥有的账本条目 id */
  ledger?: string[];
  /** NPC id → 最低好感 */
  bonds?: Record<string, number>;
  /** 最低公开度 */
  minPublicity?: number;
  /** 最高公开度 */
  maxPublicity?: number;
}

export interface ChoiceEffect {
  setFlags?: string[];
  clearFlags?: string[];
  addLedger?: Omit<LedgerEntry, 'confirmed'>[];
  confirmLedger?: string[];
  deltaBonds?: Record<string, number>;
  deltaPublicity?: number;
  /** 跳转到场景节点 id */
  goto?: string;
  /** 触发死亡回流 */
  death?: boolean;
  /** 设置检查点（记录当前节点） */
  checkpoint?: boolean;
  /** 结局 id；有则进入结局屏 */
  ending?: string;
}

export interface Choice {
  id: string;
  text: string;
  require?: ChoiceRequirement;
  /** 不满足 require 时是否仍显示但禁用 */
  showLocked?: boolean;
  lockedHint?: string;
  effects: ChoiceEffect;
}

export interface SceneNode {
  id: string;
  title?: string;
  narration?: string;
  speakers?: SpeakerLine[];
  choices?: Choice[];
  /** 无选项时的自动跳转（旁白页点继续） */
  autoGoto?: string;
  /** 进入节点时立即生效 */
  onEnter?: ChoiceEffect;
}

export interface EndingDef {
  id: string;
  title: string;
  summary: string;
  kind: 'clear' | 'death' | 'bad';
}

export interface ChapterPack {
  id: string;
  title: string;
  description: string;
  startNode: string;
  nodes: SceneNode[];
  endings?: EndingDef[];
  npcs?: { id: string; name: string; intro?: string }[];
}

export interface GameState {
  packId: string;
  nodeId: string;
  lives: number;
  maxLives: number;
  ledger: LedgerEntry[];
  bonds: Record<string, number>;
  publicity: number;
  flags: string[];
  checkpointNodeId: string;
  /** 检查点快照：死亡回流时恢复 flags/bonds/publicity/ledger(未确认丢弃) */
  checkpointSnapshot: CheckpointSnapshot | null;
  endingId: string | null;
  deathCount: number;
  startedAt: string;
  updatedAt: string;
}

export interface CheckpointSnapshot {
  nodeId: string;
  flags: string[];
  bonds: Record<string, number>;
  publicity: number;
  ledger: LedgerEntry[];
}

export const SAVE_KEY = 'qitiao-ming-save-v1';
export const INITIAL_LIVES = 7;
