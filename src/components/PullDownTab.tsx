import { useState, useMemo, useCallback } from 'react';
import data from '../data/currently.json';
import ropeEnd from '../asset/rope end.png';

// Random pick, uniformly distributed — always pick from least-shown quotes
const COUNTS_KEY = 'quote-counts';
function getNextQuote(): string {
  let counts: Record<string, number> = {};
  try { counts = JSON.parse(sessionStorage.getItem(COUNTS_KEY) || '{}'); } catch { /* ignore */ }
  const min = Math.min(...data.quotes.map(q => counts[q] || 0));
  const pool = data.quotes.filter(q => (counts[q] || 0) === min);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  counts[pick] = (counts[pick] || 0) + 1;
  sessionStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  return pick;
}

export default function PullDownTab() {
  const [open, setOpen] = useState(false);
  const randomQuote = useMemo(() => getNextQuote(), []);
  const toggle = useCallback(() => setOpen(prev => !prev), []);

  return (
    <div className="fixed top-0 right-5 z-50 hidden md:flex flex-col items-end">
      {/* Single sliding unit: panel + rod move together */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // When closed, slide up so only the rod handle peeks out
          transform: open ? 'translateY(0)' : 'translateY(calc(-100% + 99px))',
          transition: 'transform 0.5s cubic-bezier(0.22, 0.6, 0.36, 1)',
        }}
      >
        {/* Panel */}
        <div
          onClick={toggle}
          className="cursor-pointer"
          style={{
            backgroundColor: '#F4F0E1',
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(0,0,0,0.01) 0px,
                rgba(0,0,0,0.01) 1px,
                transparent 1px,
                transparent 3px
              ),
              radial-gradient(circle at 20% 15%, rgba(255,255,255,0.12), transparent 50%),
              radial-gradient(circle at 80% 85%, rgba(0,0,0,0.03), transparent 50%)
            `,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            borderRadius: '0 0 10px 10px',
            padding: '16px 22px 14px',
            width: 240,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.reading && (
              <div>
                <p
                  className="m-0 mb-0.5"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#9e8e6a',
                  }}
                >
                  currently reading
                </p>
                <p
                  className="m-0"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 16,
                    lineHeight: 1.3,
                    color: '#2E2A22',
                  }}
                >
                  {Array.isArray(data.reading)
                    ? data.reading.map((item, i) => (
                        <span key={i} style={{ display: 'block' }}>{item}</span>
                      ))
                    : data.reading}
                </p>
              </div>
            )}

            {data.listening && (
              <div>
                <p
                  className="m-0 mb-0.5"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#9e8e6a',
                  }}
                >
                  currently listening
                </p>
                <p
                  className="m-0"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 16,
                    lineHeight: 1.3,
                    color: '#2E2A22',
                  }}
                >
                  {data.listening}
                </p>
              </div>
            )}

            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent 0%, #c4b07a 20%, #c4b07a 80%, transparent 100%)',
                opacity: 0.25,
              }}
            />

            <p
              className="m-0"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 14,
                lineHeight: 1.35,
                color: '#5B5340',
                fontStyle: 'italic',
              }}
            >
              "{randomQuote}"
            </p>
          </div>
        </div>

        {/* Rod handle — attached to bottom of panel, moves with it */}
        <button
          onClick={toggle}
          className="cursor-pointer border-none bg-transparent p-0"
          style={{ outline: 'none', marginTop: 0 }}
          aria-label={open ? 'Close currently panel' : 'Open currently panel'}
        >
          <div
            style={{
              width: 48,
              height: 5,
              borderRadius: '0 0 3px 3px',
              background: 'linear-gradient(180deg, #A08968 0%, #8B7355 40%, #6B5740 100%)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: -2,
                top: 0,
                width: 6,
                height: 6,
                borderRadius: '0 0 50% 50%',
                background: 'radial-gradient(circle at 35% 35%, #B8A080, #7A6348)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -2,
                top: 0,
                width: 6,
                height: 6,
                borderRadius: '0 0 50% 50%',
                background: 'radial-gradient(circle at 35% 35%, #B8A080, #7A6348)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            />
          </div>
          {/* Rope */}
          <div className="flex justify-center">
            <img
              src={ropeEnd}
              alt=""
              style={{
                width: 34,
                height: 'auto',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
              }}
              draggable={false}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
