import { useMemo, useState } from 'react';
import type { ChapterPack, Choice, GameState } from '../types/schema';
import {
  chooseOption,
  continueNarration,
  getEnding,
  getNode,
  getVisibleChoices,
  meetsRequirement,
} from '../engine/gameEngine';
import { Hud } from './Hud';
import { LedgerPanel } from './LedgerPanel';
import { BondsPanel } from './BondsPanel';
import { EndingScreen } from './EndingScreen';

type Tab = 'none' | 'ledger' | 'bonds';

type Props = {
  pack: ChapterPack;
  state: GameState;
  setState: (s: GameState) => void;
  onTitle: () => void;
  onNew: () => void;
};

export function GameView({ pack, state, setState, onTitle, onNew }: Props) {
  const [tab, setTab] = useState<Tab>('none');
  const [deathFlash, setDeathFlash] = useState<string | null>(null);

  const node = getNode(pack, state.nodeId);
  const ending = state.endingId ? getEnding(pack, state.endingId) : undefined;

  const choices = useMemo(() => {
    if (!node) return [] as Choice[];
    return getVisibleChoices(state, node);
  }, [node, state]);

  if (state.endingId) {
    const resolved = ending ?? {
      id: state.endingId,
      title: state.endingId === 'game_over' ? '命尽' : '结局',
      summary:
        state.endingId === 'game_over'
          ? '七条命皆尽。账本合上，灯熄。'
          : '（未在关卡包中找到该结局文案。）',
      kind: (state.endingId === 'game_over' ? 'death' : 'clear') as 'clear' | 'death' | 'bad',
    };
    return (
      <div className="app-shell">
        <Hud state={state} tab="none" onTab={() => undefined} />
        <EndingScreen ending={resolved} state={state} onTitle={onTitle} onNew={onNew} />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="app-shell">
        <p>场景缺失：{state.nodeId}</p>
        <button type="button" className="btn" onClick={onTitle}>
          返回
        </button>
      </div>
    );
  }

  const onChoose = (choice: Choice) => {
    if (!meetsRequirement(state, choice.require)) return;
    const result = chooseOption(state, pack, choice);
    setState(result.state);
    if (result.died) {
      const left = result.livesLeft ?? result.state.lives;
      if (left <= 0) {
        setDeathFlash('命数耗尽。');
      } else {
        setDeathFlash(`你死了一次。还剩 ${left} 次。已回流至最近检查点（已确认账本保留）。`);
      }
      window.setTimeout(() => setDeathFlash(null), 3200);
    }
  };

  const onContinue = () => {
    setState(continueNarration(state, pack));
  };

  return (
    <div className="app-shell">
      <Hud state={state} tab={tab} onTab={setTab} />
      {tab === 'ledger' && <LedgerPanel state={state} />}
      {tab === 'bonds' && <BondsPanel state={state} pack={pack} />}
      {deathFlash && <div className="death-banner">{deathFlash}</div>}

      <section className="scene-card">
        {node.title && <h2 className="scene-title">{node.title}</h2>}
        {node.narration && <div className="narration">{node.narration}</div>}
        {node.speakers && node.speakers.length > 0 && (
          <div className="speakers">
            {node.speakers.map((line, i) => (
              <div key={`${line.speaker}-${i}`} className="line">
                <div className="who">{line.speaker}</div>
                <div className="say">{line.text}</div>
              </div>
            ))}
          </div>
        )}

        {choices.length > 0 ? (
          <div className="choices">
            {choices.map((c) => {
              const ok = meetsRequirement(state, c.require);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="choice-btn"
                  disabled={!ok}
                  onClick={() => onChoose(c)}
                >
                  {c.text}
                  {!ok && c.lockedHint && <span className="lock">{c.lockedHint}</span>}
                </button>
              );
            })}
          </div>
        ) : node.autoGoto ? (
          <button type="button" className="btn primary" onClick={onContinue}>
            继续
          </button>
        ) : null}
      </section>

      <div className="footer-link">
        <button type="button" className="btn ghost" onClick={onTitle}>
          标题画面
        </button>
      </div>
    </div>
  );
}
