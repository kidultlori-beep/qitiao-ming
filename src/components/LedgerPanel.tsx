import type { GameState } from '../types/schema';

export function LedgerPanel({ state }: { state: GameState }) {
  if (state.ledger.length === 0) {
    return (
      <aside className="side-panel">
        <h3>账本</h3>
        <p className="empty-hint">尚无条目。选择中的证物与线索会写入此处。</p>
      </aside>
    );
  }
  return (
    <aside className="side-panel">
      <h3>账本</h3>
      {state.ledger.map((e) => (
        <div key={e.id} className="ledger-item">
          <div>
            <span className="kind-tag">{e.kind}</span>
            <strong>{e.title}</strong>
            {e.confirmed && <span className="confirmed">已确认</span>}
          </div>
          <div style={{ color: 'var(--ink-dim)', marginTop: 4, fontSize: '0.85rem' }}>
            {e.detail}
          </div>
        </div>
      ))}
    </aside>
  );
}
