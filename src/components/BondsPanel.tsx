import type { ChapterPack, GameState } from '../types/schema';

export function BondsPanel({ state, pack }: { state: GameState; pack: ChapterPack }) {
  const entries = Object.entries(state.bonds);
  if (entries.length === 0) {
    return (
      <aside className="side-panel">
        <h3>人情</h3>
        <p className="empty-hint">与 NPC 的好感尚未变化。</p>
      </aside>
    );
  }
  const nameOf = (id: string) => pack.npcs?.find((n) => n.id === id)?.name ?? id;
  return (
    <aside className="side-panel">
      <h3>人情</h3>
      {entries.map(([id, v]) => (
        <div key={id} className="bond-item">
          <strong>{nameOf(id)}</strong>
          <span style={{ float: 'right', color: v >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
            {v >= 0 ? `+${v}` : v}
          </span>
        </div>
      ))}
    </aside>
  );
}
