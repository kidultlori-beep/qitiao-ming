import type { GameState } from '../types/schema';

type Tab = 'none' | 'ledger' | 'bonds';

type Props = {
  state: GameState;
  tab: Tab;
  onTab: (t: Tab) => void;
};

export function Hud({ state, tab, onTab }: Props) {
  const lives = Array.from({ length: state.maxLives }, (_, i) => i < state.lives);

  return (
    <header className="hud">
      <div className="hud-lives" title={`还剩 ${state.lives} 次`}>
        <span>命</span>
        {lives.map((on, i) => (
          <span key={i} className={`life-pip${on ? '' : ' off'}`} />
        ))}
        <strong style={{ marginLeft: 4 }}>{state.lives}</strong>
      </div>
      <div className="hud-meta">
        <span>
          公开度 <strong>{state.publicity}</strong>
        </span>
        <span>
          账本 <strong>{state.ledger.length}</strong>
        </span>
        {state.deathCount > 0 && (
          <span>
            回流 <strong>{state.deathCount}</strong>
          </span>
        )}
      </div>
      <div className="hud-tabs">
        <button
          type="button"
          className={`tab-btn${tab === 'ledger' ? ' active' : ''}`}
          onClick={() => onTab(tab === 'ledger' ? 'none' : 'ledger')}
        >
          账本
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'bonds' ? ' active' : ''}`}
          onClick={() => onTab(tab === 'bonds' ? 'none' : 'bonds')}
        >
          人情
        </button>
      </div>
    </header>
  );
}
