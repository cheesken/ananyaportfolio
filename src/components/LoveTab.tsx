import { useState, useRef, useEffect } from 'react';
import lovesData from '../data/loves.json';
import type { LoveItem } from '../types';

const items = lovesData as LoveItem[];

// Dynamically import all images from asset/loves/
const imageModules = import.meta.glob('../asset/loves/*.{png,jpg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function getImage(filename: string): string | undefined {
  const key = `../asset/loves/${filename}`;
  return imageModules[key];
}

export default function LoveTab() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    if (cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, [items.length]);

  // Re-measure on resize
  useEffect(() => {
    const onResize = () => {
      if (cardRef.current) {
        setCardHeight(cardRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed top-0 right-2 sm:right-4 z-30 hidden md:flex flex-col items-center"
      style={{
        transform: open ? 'translateY(0)' : `translateY(-${cardHeight || 9999}px)`,
        transition: cardHeight ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
      }}
    >
      {/* Card */}
      <div
        ref={cardRef}
        className="rounded-b-xl p-8 pt-8"
        style={{
          backgroundColor: '#F7F2E7',
          border: '1.5px solid rgba(46,42,34,0.12)',
          borderTop: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <p
          className="text-xs text-[#55705A] tracking-[0.15em] uppercase text-center mb-6"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Things I Like
        </p>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {items.map((item, i) => {
            const src = getImage(item.image);
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                {src && (
                  <img
                    src={src}
                    alt={item.label}
                    className="w-20 h-20 object-contain"
                  />
                )}
                <span
                  className="text-lg text-[#5B5340]"
                  style={{ fontFamily: "'Comforter Brush', cursive" }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab handle — tall pennant with heart at bottom */}
      <div
        onClick={() => setOpen(prev => !prev)}
        className="cursor-pointer flex flex-col items-center justify-end select-none"
        style={{
          backgroundColor: '#336e1a',
          padding: '10px 10px 0',
          height: '95px',
          boxShadow: '0 4px 12px rgba(51,110,26,0.3)',
          borderLeft: '1.5px solid rgba(255,255,255,0.2)',
          borderRight: '1.5px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Heart icon */}
        <svg viewBox="0 0 24 24" fill="#F7F2E7" className="w-5 h-5 opacity-80 mb-2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>

        {/* Pointed end — two-point pennant */}
        <svg viewBox="0 0 36 12" className="w-full h-3.5 block" preserveAspectRatio="none">
          <path d="M0,0 L18,12 L36,0 Z" fill="#336e1a" />
        </svg>
      </div>
    </div>
  );
}
