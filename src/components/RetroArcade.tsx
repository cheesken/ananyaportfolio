import { useState, useRef, lazy, Suspense } from 'react';

const games = [
  { id: 'snake', name: 'Snake', icon: '~>', keys: 'Arrow keys' },
  { id: 'pong', name: 'Pong', icon: '|o', keys: 'Up / Down' },
  { id: 'breakout', name: 'Breakout', icon: '##', keys: 'Left / Right' },
  { id: 'flappy', name: 'Flappy', icon: '>>', keys: 'Space / Click' },
] as const;

const SnakeGame = lazy(() => import('./games/SnakeGame'));
const PongGame = lazy(() => import('./games/PongGame'));
const BreakoutGame = lazy(() => import('./games/BreakoutGame'));
const FlappyBirdGame = lazy(() => import('./games/FlappyBirdGame'));

const gameComponents: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  snake: SnakeGame,
  pong: PongGame,
  breakout: BreakoutGame,
  flappy: FlappyBirdGame,
};

interface Props {
  onClose: () => void;
}

export default function RetroArcade({ onClose }: Props) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [closedSize, setClosedSize] = useState<{ w: number; h: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const GameComponent = activeGame ? gameComponents[activeGame] : null;

  const handleClose = () => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setClosedSize({ w: rect.width, h: rect.height });
    }
    setActiveGame(null);
    setClosing(true);
    setTimeout(onClose, 1800);
  };

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
          {activeGame ? (
            <button
              onClick={() => setActiveGame(null)}
              className="text-[#00ff41] text-xs font-['Space_Mono'] tracking-wider uppercase cursor-pointer bg-transparent border-none hover:opacity-70"
            >
              &lt; BACK
            </button>
          ) : (
            <h2
              className="text-[#00ff41] text-sm tracking-[0.2em] uppercase m-0"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              SECRET ARCADE
            </h2>
          )}
          <button
            onClick={handleClose}
            className="text-[rgba(255,255,255,0.4)] hover:text-white text-lg cursor-pointer bg-transparent border-none leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!activeGame ? (
            <div className="grid grid-cols-2 gap-3">
              {games.map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveGame(g.id)}
                  className="flex flex-col items-center gap-2 py-5 px-3 rounded-lg cursor-pointer border border-[rgba(0,255,65,0.15)] bg-[rgba(0,255,65,0.03)] hover:bg-[rgba(0,255,65,0.08)] transition-colors duration-150"
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
                  <span
                    className="text-[rgba(0,255,65,0.4)] text-[10px]"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {g.keys}
                  </span>
                </button>
              ))}
            </div>
          ) : (
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
                {GameComponent && <GameComponent />}
              </Suspense>
              <p
                className="text-[rgba(0,255,65,0.35)] text-[10px] m-0"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Press R to restart
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
