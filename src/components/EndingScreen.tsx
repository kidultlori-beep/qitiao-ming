import type { EndingDef, GameState } from '../types/schema';

type Props = {
  ending: EndingDef;
  state: GameState;
  onTitle: () => void;
  onNew: () => void;
};

export function EndingScreen({ ending, state, onTitle, onNew }: Props) {
  return (
    <div className="ending-screen">
      <h2>{ending.title}</h2>
      <p>{ending.summary}</p>
      <p style={{ textAlign: 'center', color: 'var(--accent)' }}>
        剩余命数 {state.lives} · 账本 {state.ledger.filter((e) => e.confirmed).length} 条已确认
        {state.deathCount > 0 ? ` · 曾回流 ${state.deathCount} 次` : ''}
      </p>
      <div className="title-actions" style={{ margin: '12px auto 0' }}>
        <button type="button" className="btn primary" onClick={onNew}>
          再开一局
        </button>
        <button type="button" className="btn" onClick={onTitle}>
          返回标题
        </button>
      </div>
    </div>
  );
}
