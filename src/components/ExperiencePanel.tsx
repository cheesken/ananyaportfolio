import { useState } from 'react';
import experienceData from '../data/experience.json';
import richText from '../utils/richText';
import type { Experience } from '../types';
import settingIcon from '../asset/setting.png';
import circleImg from '../asset/circle.png';

const entries = ([...experienceData] as Experience[]).sort((a, b) => b.id - a.id);
const allTags = Array.from(new Set(entries.flatMap(e => e.tags || [])));

export default function ExperiencePanel() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? entries.filter(e => e.tags?.includes(activeTag))
    : entries;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
        <h1
          className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Experience
        </h1>
        <div className="relative" style={{ width: 50, height: 50 }}>
          {/* "Filter" label + arrow */}
          <span
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-white/60 whitespace-nowrap select-none pointer-events-none hidden sm:block"
            style={{ fontFamily: "'Caveat', cursive", fontSize: 18 }}
          >
            Filter
          </span>
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="cursor-pointer bg-transparent border-none p-0 transition-transform hover:scale-125 relative w-full h-full"
            aria-label="Filter experiences"
            style={{ outline: 'none' }}
          >
          <img
            src={circleImg}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.55 }}
            draggable={false}
          />
          <img
            src={settingIcon}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 16,
              height: 16,
              opacity: filterOpen ? 1 : 0.5,
              transition: 'opacity 0.2s',
            }}
            draggable={false}
          />
          </button>
        </div>
      </div>

      {/* Filter tags */}
      {filterOpen && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 animate-fade-in-up" style={{ '--i': 0 } as React.CSSProperties}>
          <button
            onClick={() => setActiveTag(null)}
            className={`cursor-pointer border-none rounded-full px-3 py-1 text-[clamp(0.65rem,1.4vw,0.78rem)] transition-all ${
              activeTag === null
                ? 'bg-[#2E2A22] text-[#F7F2E7]'
                : 'bg-[#2E2A22]/10 text-[#2E2A22] hover:bg-[#2E2A22]/20'
            }`}
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
              className={`cursor-pointer border-none rounded-full px-3 py-1 text-[clamp(0.65rem,1.4vw,0.78rem)] transition-all ${
                activeTag === tag
                  ? 'bg-[#2E2A22] text-[#F7F2E7]'
                  : 'bg-[#2E2A22]/10 text-[#2E2A22] hover:bg-[#2E2A22]/20'
              }`}
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative ml-3 sm:ml-4 md:ml-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-[#2E2A22] opacity-30" />

        <div key={activeTag ?? '__all'} className="space-y-5 sm:space-y-7 md:space-y-8">
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              className="relative pl-5 sm:pl-7 md:pl-8 animate-fade-in-up"
              style={{ '--i': i } as React.CSSProperties}
            >
              {/* Dot on timeline */}
              <div className="absolute left-0 top-[0.55rem] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2E2A22] -translate-x-[calc(50%-0.5px)]" />

              {/* Duration */}
              <p
                className="text-[clamp(0.65rem,1.4vw,0.78rem)] text-[#5B5340] mb-1 tracking-wide uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {entry.duration}
              </p>

              {/* Role, Company */}
              <h2
                className="inline text-[clamp(1.1rem,3vw,1.5rem)] text-[#2E2A22] pb-0.5"
                style={{ fontFamily: "'Syne', sans-serif", borderBottom: '2px dotted #2E2A22' }}
              >
                {entry.role}, {entry.company}
              </h2>

              {/* Team */}
              {entry.team && (
                <h3
                  className="text-[clamp(0.8rem,2vw,1rem)] text-[#5B5340] mt-1"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {entry.team}
                </h3>
              )}

              {/* Technologies as pills */}
              {entry.technologies && entry.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                  {entry.technologies.map((tech, j) => (
                    <span
                      key={j}
                      className="text-[clamp(0.6rem,1.2vw,0.72rem)] text-[#2E2A22] bg-[#2E2A22]/10 px-1.5 sm:px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {entry.description && entry.description.length > 0 && (
                <div className="ml-3 sm:ml-4 md:ml-5 mt-1.5 sm:mt-2">
                  <ul
                    className="grid grid-cols-1 gap-y-0.5 sm:gap-y-1 list-disc pl-3 sm:pl-4 text-[clamp(0.75rem,1.6vw,0.88rem)] text-[#2E2A22] text-justify"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {entry.description.map((item, j) => (
                      <li key={j}>{richText(item)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
