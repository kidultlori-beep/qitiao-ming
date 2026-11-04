import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import type { ChapterPack, GameState } from './types/schema';
import { defaultPack } from './content';
import { createNewGame } from './engine/gameEngine';
import { clearSave, hasSave, loadSave, writeSave } from './engine/save';
import { TitleScreen } from './components/TitleScreen';
import { GameView } from './components/GameView';
import { SiteFooter } from './components/SiteFooter';
import { Studio, STUDIO_PACK_KEY } from './pages/Studio';
import { Legal } from './pages/Legal';
import { Complaint } from './pages/Complaint';
import './styles/game.css';

type Mode = 'title' | 'play';

function useGameSession(pack: ChapterPack | null, saveEnabled: boolean) {
  const [mode, setMode] = useState<Mode>('title');
  const [state, setStateRaw] = useState<GameState | null>(() =>
    saveEnabled ? loadSave() : null,
  );

  const saveExists = saveEnabled && (state != null || hasSave());

  const setState = useCallback(
    (s: GameState) => {
      setStateRaw(s);
      if (saveEnabled) writeSave(s);
    },
    [saveEnabled],
  );

  const startNew = useCallback(() => {
    if (!pack) return;
    if (saveEnabled) clearSave();
    const fresh = createNewGame(pack);
    setState(fresh);
    setMode('play');
  }, [pack, saveEnabled, setState]);

  const continueGame = useCallback(() => {
    if (!saveEnabled) return;
    const saved = loadSave();
    if (!saved) return;
    setStateRaw(saved);
    setMode('play');
  }, [saveEnabled]);

  return { mode, setMode, state, setState, saveExists, startNew, continueGame };
}

function GameApp() {
  const navigate = useNavigate();
  const pack = defaultPack;
  const session = useGameSession(pack, true);

  if (session.mode === 'play' && session.state) {
    return (
      <GameView
        pack={pack}
        state={session.state}
        setState={session.setState}
        onTitle={() => session.setMode('title')}
        onNew={session.startNew}
      />
    );
  }

  return (
    <div className="app-shell">
      <TitleScreen
        hasSave={session.saveExists}
        onNew={session.startNew}
        onContinue={session.continueGame}
        onStudio={() => navigate('/studio')}
      />
    </div>
  );
}

function loadStudioPack(): ChapterPack | null {
  try {
    const raw = localStorage.getItem(STUDIO_PACK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChapterPack;
  } catch {
    return null;
  }
}

function StudioPlayApp() {
  const navigate = useNavigate();
  const pack = useMemo(() => loadStudioPack(), []);
  const { mode, state, startNew, setState } = useGameSession(pack, false);

  useEffect(() => {
    if (pack && mode === 'title' && !state) startNew();
  }, [pack, mode, state, startNew]);

  if (!pack) {
    return (
      <div className="app-shell">
        <p>没有可试玩的工坊包。请先在创作工坊生成。</p>
        <button type="button" className="btn primary" onClick={() => navigate('/studio')}>
          返回工坊
        </button>
        <SiteFooter />
      </div>
    );
  }

  if (mode === 'play' && state) {
    return (
      <GameView
        pack={pack}
        state={state}
        setState={setState}
        onTitle={() => navigate('/studio')}
        onNew={startNew}
      />
    );
  }

  return (
    <div className="app-shell">
      <p>正在载入试玩……</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GameApp />} />
      <Route path="/studio" element={<Studio />} />
      <Route path="/play-studio" element={<StudioPlayApp />} />
      <Route path="/privacy" element={<Legal kind="privacy" />} />
      <Route path="/terms" element={<Legal kind="terms" />} />
      <Route path="/complaint" element={<Complaint />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
