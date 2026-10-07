import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import type { GameId, GameOverPayload, LeaderboardEntry } from '../arcade-types';

const games: { id: GameId; name: string; icon: string }[] = [
  { id: 'snake', name: 'Snake', icon: '~>' },
  { id: 'bricks', name: 'Bricks', icon: '▦' },
  { id: 'dino', name: 'Dino', icon: 'T>' },
  { id: 'bounce', name: 'Bounce', icon: '●~' },
];

const SnakeGame = lazy(() => import('./games/SnakeGame'));
const BrickBreakerGame = lazy(() => import('./games/BrickBreakerGame'));
const DinoGame = lazy(() => import('./games/DinoGame'));
const BounceGame = lazy(() => import('./games/BounceGame'));

type GameComponent = React.LazyExoticComponent<
  (props: { onGameOver?: (p: GameOverPayload) => void }) => React.ReactElement
>;

const gameComponents: Record<GameId, GameComponent> = {
  snake: SnakeGame as GameComponent,
  bricks: BrickBreakerGame as GameComponent,
  dino: DinoGame as GameComponent,
  bounce: BounceGame as GameComponent,
};

const MEDAL_COLORS = ['#ffd43b', '#c0c0c0', '#cd7f32'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type ArcadeView = 'select' | 'playing' | 'name-entry' | 'leaderboard';

interface Props {
  onClose: () => void;
}

export default function RetroArcade({ onClose }: Props) {
  const [view, setView] = useState<ArcadeView>('select');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [closing, setClosing] = useState(false);
  const [closedSize, setClosedSize] = useState<{ w: number; h: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Leaderboard state
  const [lastResult, setLastResult] = useState<GameOverPayload | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nameChars, setNameChars] = useState(['A', 'A', 'A']);
  const [nameCursor, setNameCursor] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const GameComp = activeGame ? gameComponents[activeGame] : null;

  const handleClose = () => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setClosedSize({ w: rect.width, h: rect.height });
    }
    setActiveGame(null);
    setClosing(true);
    setTimeout(onClose, 1800);
  };

  const goToSelect = () => {
    setActiveGame(null);
    setLastResult(null);
    setSubmittedName(null);
    setView('select');
  };

  const playGame = (id: GameId) => {
    setActiveGame(id);
    setView('playing');
    setLastResult(null);
    setSubmittedName(null);
  };

  const viewScores = async (id: GameId) => {
    setActiveGame(id);
    setLastResult(null);
    setSubmittedName(null);
    try {
      const res = await fetch(`/api/leaderboard?game=${id}`);
      const data = await res.json();
      setLeaderboard(data.entries ?? []);
    } catch {
      setLeaderboard([]);
    }
    setView('leaderboard');
  };

  const playAgain = () => {
    if (activeGame) {
      setView('playing');
      setLastResult(null);
      setSubmittedName(null);
    }
  };

  const handleGameOver = useCallback(async (payload: GameOverPayload) => {
    setLastResult(payload);

    let qualifies = false;
    try {
      const res = await fetch(`/api/leaderboard?game=${payload.game}`);
      const data = await res.json();
      const entries: LeaderboardEntry[] = data.entries ?? [];
      setLeaderboard(entries);
      qualifies = payload.score > 0 && (
        entries.length < 10 ||
        payload.score > entries[entries.length - 1].score
      );
    } catch {
      setLeaderboard([]);
    }

    // Let the canvas game-over screen show for 1.5s before transitioning
    await new Promise(r => setTimeout(r, 1500));
    setNameChars(['A', 'A', 'A']);
    setNameCursor(0);
    setView(qualifies ? 'name-entry' : 'leaderboard');
  }, []);

  const submitScore = async () => {
    if (submitting || !lastResult) return;
    setSubmitting(true);
    const name = nameChars.join('');
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: lastResult.game, name, score: lastResult.score }),
      });
      const res = await fetch(`/api/leaderboard?game=${lastResult.game}`);
      const data = await res.json();
      setLeaderboard(data.entries ?? []);
      setSubmittedName(name);
    } catch { /* score won't appear but that's ok */ }
    setSubmitting(false);
    setView('leaderboard');
  };

  // Name entry keyboard handler
  useEffect(() => {
    if (view !== 'name-entry') return;
    function onKey(e: KeyboardEvent) {
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        setNameChars(prev => {
          const next = [...prev];
          const i = LETTERS.indexOf(next[nameCursor]);
          next[nameCursor] = LETTERS[(i + 1) % 26];
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        setNameChars(prev => {
          const next = [...prev];
          const i = LETTERS.indexOf(next[nameCursor]);
          next[nameCursor] = LETTERS[(i - 1 + 26) % 26];
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        setNameCursor(c => Math.min(2, c + 1));
      } else if (e.key === 'ArrowLeft') {
        setNameCursor(c => Math.max(0, c - 1));
      } else if (e.key === 'Enter') {
        submitScore();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, nameCursor, submitScore]);

  // Leaderboard keyboard handler
  useEffect(() => {
    if (view !== 'leaderboard') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'r' || e.key === 'R') playAgain();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, activeGame]);

  if (closing) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center crt-backdrop-fade"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="crt-shutdown relative rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            backgroundColor: '#111',
            border: '1px solid rgba(0,255,65,0.2)',
            boxShadow: '0 0 40px rgba(0,255,65,0.08), 0 0 80px rgba(0,0,0,0.5)',
            width: closedSize?.w ?? '90vw',
            height: closedSize?.h ?? 200,
          }}
        >
          <div className="crt-lines absolute inset-0 pointer-events-none z-10" />
          <p
            className="text-[#00ff41] text-lg tracking-[0.3em] uppercase m-0 crt-farewell"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            SEE YOU AGAIN
          </p>
        </div>
      </div>
    );
  }

  const gameName = activeGame ? games.find(g => g.id === activeGame)?.name?.toUpperCase() : '';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={boxRef}
        className="arcade-enter relative w-[90vw] max-w-[520px] rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(0,255,65,0.2)',
          boxShadow: '0 0 40px rgba(0,255,65,0.08), 0 0 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* CRT scanlines overlay */}
        <div className="crt-lines absolute inset-0 pointer-events-none z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,255,65,0.15)]">
          {view === 'select' ? (
            <h2
              className="text-[#00ff41] text-sm tracking-[0.2em] uppercase m-0"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ARCADE
            </h2>
          ) : (
            <button
              onClick={goToSelect}
              className="text-[#00ff41] text-xs font-['Space_Mono'] tracking-wider uppercase cursor-pointer bg-transparent border-none hover:opacity-70"
            >
              &lt; BACK
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-[rgba(0,255,65,0.4)] hover:text-[#00ff41] text-lg cursor-pointer bg-transparent border-none leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Game Select */}
          {view === 'select' && (
            <div className="grid grid-cols-2 gap-3">
              {games.map(g => (
                <div
                  key={g.id}
                  className="flex flex-col rounded-lg border border-[rgba(0,255,65,0.15)] bg-[rgba(0,255,65,0.03)] overflow-hidden"
                >
                  <button
                    onClick={() => playGame(g.id)}
                    className="flex flex-col items-center gap-2 py-5 px-3 cursor-pointer bg-transparent border-none hover:bg-[rgba(0,255,65,0.08)] transition-colors duration-150"
                  >
                    <span
                      className="text-[#00ff41] text-2xl"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {g.icon}
                    </span>
                    <span
                      className="text-[#00ff41] text-xs tracking-[0.15em] uppercase"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {g.name}
                    </span>
                  </button>
                  <button
                    onClick={() => viewScores(g.id)}
                    className="text-[rgba(0,255,65,0.35)] text-[10px] tracking-wider uppercase cursor-pointer bg-transparent border-t border-[rgba(0,255,65,0.1)] py-1.5 hover:text-[#00ff41] hover:bg-[rgba(0,255,65,0.05)] transition-colors duration-150"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    SCORES
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Playing */}
          {view === 'playing' && GameComp && (
            <div className="flex flex-col items-center gap-3">
              <Suspense
                fallback={
                  <div
                    className="text-[#00ff41] text-sm py-10"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    Loading...
                  </div>
                }
              >
                <GameComp onGameOver={handleGameOver} />
              </Suspense>
              <p
                className="text-[rgba(0,255,65,0.35)] text-[10px] m-0"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Press R to restart
              </p>
            </div>
          )}

          {/* Name Entry */}
          {view === 'name-entry' && lastResult && (
            <div
              className="flex flex-col items-center gap-5 py-8"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <p className="text-[#ffd43b] text-lg tracking-[0.15em] m-0">NEW HIGH SCORE!</p>
              <p className="text-[#00ff41] text-2xl m-0">{lastResult.score}</p>

              <div className="flex gap-3">
                {nameChars.map((ch, i) => (
                  <div
                    key={i}
                    className={`w-10 h-12 flex items-center justify-center text-[#00ff41] text-2xl border-b-2 ${
                      i === nameCursor ? 'arcade-blink' : 'border-transparent'
                    }`}
                  >
                    {ch}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-1 text-[rgba(0,255,65,0.4)] text-[10px]">
                <span>UP / DOWN — change letter</span>
                <span>LEFT / RIGHT — move cursor</span>
                <span>ENTER — confirm</span>
              </div>

              <button
                onClick={submitScore}
                disabled={submitting}
                className="text-[#00ff41] text-xs tracking-wider uppercase cursor-pointer bg-transparent border border-[rgba(0,255,65,0.3)] px-6 py-2 rounded hover:bg-[rgba(0,255,65,0.1)] transition-colors disabled:opacity-40"
              >
                {submitting ? 'SAVING...' : 'SUBMIT'}
              </button>
            </div>
          )}

          {/* Leaderboard */}
          {view === 'leaderboard' && (
            <div
              className="flex flex-col items-center gap-4 py-4"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <p className="text-[#00ff41] text-sm tracking-[0.2em] uppercase m-0">
                {gameName} — TOP SCORES
              </p>

              {leaderboard.length === 0 ? (
                <p className="text-[rgba(0,255,65,0.4)] text-xs m-0">No scores yet</p>
              ) : (
                <div className="w-full max-w-[320px]">
                  {leaderboard.map((entry, i) => {
                    const isMe = submittedName && entry.name === submittedName &&
                      entry.score === lastResult?.score;
                    const color = i < 3 ? MEDAL_COLORS[i] : '#00ff41';
                    return (
                      <div
                        key={`${entry.name}-${entry.ts}`}
                        className="flex items-center justify-between py-1.5 px-2 text-xs"
                        style={{
                          color,
                          opacity: isMe ? 1 : (i < 3 ? 0.9 : 0.6),
                          backgroundColor: isMe ? 'rgba(0,255,65,0.06)' : 'transparent',
                          borderRadius: isMe ? 4 : 0,
                        }}
                      >
                        <span className="w-6">{i + 1}.</span>
                        <span className="flex-1">{entry.name}</span>
                        <span>{entry.score}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {lastResult && lastResult.score > 0 && !submittedName && (
                <p className="text-[rgba(0,255,65,0.4)] text-[10px] m-0">
                  Your score: {lastResult.score}
                </p>
              )}

              <div className="flex gap-4 mt-2">
                {activeGame && (
                  <button
                    onClick={lastResult ? playAgain : () => playGame(activeGame)}
                    className="text-[#00ff41] text-xs tracking-wider uppercase cursor-pointer bg-transparent border border-[rgba(0,255,65,0.3)] px-5 py-2 rounded hover:bg-[rgba(0,255,65,0.1)] transition-colors"
                  >
                    {lastResult ? 'PLAY AGAIN' : 'PLAY'}
                  </button>
                )}
                <button
                  onClick={goToSelect}
                  className="text-[rgba(0,255,65,0.5)] text-xs tracking-wider uppercase cursor-pointer bg-transparent border border-[rgba(0,255,65,0.15)] px-5 py-2 rounded hover:bg-[rgba(0,255,65,0.06)] transition-colors"
                >
                  GAMES
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
