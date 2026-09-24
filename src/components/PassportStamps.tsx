import type { TabConfig } from '../types';

const ABBREVS: Record<string, string> = {
  home: 'HOME',
  projects: 'PROJ',
  experience: 'EXP',
  education: 'EDU',
  notes: 'NOTE',
  art: 'ART',
};

const ROTATIONS = [-4, 6, -2, 5, -6, 3];

interface Props {
  tabs: TabConfig[];
  visitedTabs: string[];
  allVisited: boolean;
}

export default function PassportStamps({ tabs, visitedTabs, allVisited }: Props) {
  return (
    <div
      className="absolute flex flex-col items-center gap-2"
      style={{ top: 56, right: 'calc(100% + clamp(12px, 1.5vw, 24px))' }}
    >
      {visitedTabs.map((tabId, i) => {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return null;
        return (
          <div
            key={tab.id}
            className="passport-stamp"
            style={{
              '--stamp-rot': `${ROTATIONS[i % ROTATIONS.length]}deg`,
              '--stamp-i': i,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 44 44" className="w-[clamp(2.5rem,3.5vw,3.5rem)] h-[clamp(2.5rem,3.5vw,3.5rem)]" style={{ display: 'block' }}>
              <circle
                cx="22" cy="22" r="20"
                fill="none" stroke={tab.bg} strokeWidth="1.5"
                strokeDasharray="4 2.5" opacity="0.85"
              />
              <circle
                cx="22" cy="22" r="15"
                fill="none" stroke={tab.bg} strokeWidth="1"
                opacity="0.7"
              />
              <text
                x="22" y="23.5"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={tab.bg}
                fontFamily="'Space Mono', monospace"
                fontSize="6.5"
                letterSpacing="0.06em"
                opacity="0.9"
              >
                {ABBREVS[tab.id] || tab.label.toUpperCase().slice(0, 4)}
              </text>
            </svg>
          </div>
        );
      })}

      {allVisited && (
        <div
          className="passport-stamp-gold mt-1"
          style={{ animationDelay: `${(visitedTabs.length - 1) * 100 + 550}ms` }}
        >
          <svg viewBox="0 0 44 44" className="w-[clamp(2.5rem,3.5vw,3.5rem)] h-[clamp(2.5rem,3.5vw,3.5rem)]" style={{ display: 'block' }}>
            <circle
              cx="22" cy="22" r="20"
              fill="none" stroke="#e3e3e3" strokeWidth="1.5"
              strokeDasharray="4 2.5" opacity="0.9"
            />
            <circle
              cx="22" cy="22" r="15"
              fill="none" stroke="#e3e3e3" strokeWidth="1"
              opacity="0.7"
            />
            <text
              x="22" y="21"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#e3e3e3"
              fontSize="10"
              opacity="0.9"
            >
              ★
            </text>
            <text
              x="22" y="28.5"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#e3e3e3"
              fontFamily="'Space Mono', monospace"
              fontSize="4.5"
              letterSpacing="0.08em"
              opacity="0.85"
            >
              EXPLORER
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
