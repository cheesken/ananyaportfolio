import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import stickerImg from '../asset/me/stickerpainting copy.png';
import circleImg from '../asset/me/mecir.png';

interface Heart {
  id: number;
  x: number;
  y: number;
  drift: number;
  spread: number;
  wave: number;
  bobDur: number;
  rot: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}

function spawnHearts(originX: number, originY: number): Heart[] {
  const driftRoom = window.innerWidth - originX + 150;
  return Array.from({ length: 28 }, (_, i) => {
    const size = 5 + Math.random() * 12;
    return {
      id: Date.now() + i,
      x: originX + (Math.random() - 0.5) * 30,
      y: originY + (Math.random() - 0.5) * 80,
      drift: driftRoom + Math.random() * 200,
      spread: (Math.random() - 0.5) * 500,
      wave: 12 + Math.random() * 30,
      bobDur: 600 + Math.random() * 700,
      rot: 20 + Math.random() * 80,
      size,
      opacity: 0.2 + ((size - 5) / 12) * 0.7,
      dur: 2400 + Math.random() * 2200,
      delay: Math.random() * 400,
    };
  });
}

export default function HomePanel() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [drifting, setDrifting] = useState(false);
  const [peeled, setPeeled] = useState(false);
  const [hasBeenPeeled, setHasBeenPeeled] = useState(false);
  const lastTapRef = useRef(0);
  const heartRef = useRef<HTMLSpanElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const startPress = useCallback(() => {
    if (peeled) return;
    pressTimer.current = setTimeout(() => {
      setHasBeenPeeled(true);
      setPeeled(true);
    }, 600);
  }, [peeled]);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleImgClick = useCallback(() => {
    if (peeled) setPeeled(false);
  }, [peeled]);

  const triggerBurst = useCallback(() => {
    if (!heartRef.current) return;
    const rect = heartRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDrifting(true);
    setHearts(spawnHearts(cx, cy));
    setTimeout(() => {
      setHearts([]);
      setDrifting(false);
    }, 3000);
  }, []);

  const handleClick = useCallback(() => {
    if (drifting) return;
    const isSmall = window.innerWidth < 640;
    if (!isSmall) {
      triggerBurst();
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      triggerBurst();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [triggerBurst, drifting]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] md:min-h-full">
      <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-6 md:gap-4">
        {/* ── Mobile: circular image on top ── */}
        <div className="md:hidden flex-shrink-0 animate-fade-in-up" style={{ '--i': 0 } as React.CSSProperties}>
          <div className="relative">
            {peeled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p
                  className="peel-message text-[#800f18] text-center text-xl font-bold px-2"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Tech is only one<br />part of me :3
                </p>
              </div>
            )}
            <img
              src={circleImg}
              alt="Ananya"
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover relative ${peeled ? 'sticker-peel cursor-pointer' : hasBeenPeeled ? 'sticker-unpeel' : ''}`}
              onClick={handleImgClick}
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        </div>

        {/* ── Desktop: sticker on left ── */}
        <div className="hidden md:flex flex-shrink-0 self-stretch items-center animate-fade-in-up" style={{ '--i': 0 } as React.CSSProperties}>
          <div className="relative h-full">
            {peeled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p
                  className="peel-message text-[#800f18] text-xl font-bold text-center"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Tech is only one<br />part of me :3
                </p>
              </div>
            )}
            <img
              src={stickerImg}
              alt="Ananya"
              className={`h-full w-auto max-w-52 lg:max-w-64 xl:max-w-80 object-contain drop-shadow-lg relative ${peeled ? 'sticker-peel cursor-pointer' : hasBeenPeeled ? 'sticker-unpeel' : ''}`}
              onClick={handleImgClick}
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        </div>

        {/* ── Text block on right ── */}
        <div className="flex flex-col items-center md:items-start animate-fade-in-up" style={{ '--i': 1 } as React.CSSProperties}>
          <div
            className="inline-block text-left mb-3"
            style={{
              fontFamily: "'Caveat', cursive",
              transform: 'rotate(-1deg)',
            }}
          >
            <h1 className="text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.1] text-[#2E2A22] font-bold handwrite">
              Hello! I'm Ananya.
            </h1>
          </div>
          <p
            className="text-[clamp(0.95rem,2.2vw,1.1rem)] text-[#5B5340] leading-relaxed text-center md:text-left"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              maxWidth: 'min(40ch, 100%)',
              fontWeight: 500,
            }}
          >
            I'm a software engineer with 3+ years of experience building robust systems at scale. I'm endlessly curious and love learning new things, so this is a collection of some of what I've picked up along the way. Feel free to explore, and reach out if you have a question, want to chat, or just want to say hi!{' '}
            <span
              ref={heartRef}
              className={`select-none cursor-default ${drifting ? 'heart-liftoff' : 'transition-opacity duration-500'}`}
              onClick={handleClick}
            >
              ❤︎
            </span>
          </p>
        </div>
      </div>

      {hearts.length > 0 && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {hearts.map((h) => (
            <span
              key={h.id}
              className="heart-drift"
              style={{
                '--drift': `${h.drift}px`,
                '--spread': `${h.spread}px`,
                '--rot': `${h.rot}deg`,
                '--opacity': h.opacity,
                '--dur': `${h.dur}ms`,
                '--delay': `${h.delay}ms`,
                left: h.x,
                top: h.y,
              } as React.CSSProperties}
            >
              <span
                className="heart-bob"
                style={{
                  '--wave': `${h.wave}px`,
                  '--size': `${h.size}px`,
                  '--bob-dur': `${h.bobDur}ms`,
                } as React.CSSProperties}
              >
                ❤︎
              </span>
            </span>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
