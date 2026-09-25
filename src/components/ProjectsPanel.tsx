import { useState } from 'react';
import projectData from '../data/project.json';
import ExpandCard from './ExpandCard';
import richText from '../utils/richText';
import type { Project } from '../types';
import settingIcon from '../asset/setting.png';
import circleImg from '../asset/circle.png';

const projects = ([...projectData] as Project[]).sort((a, b) => b.id - a.id);
const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

export default function ProjectsPanel() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? projects.filter(p => p.tags?.includes(activeTag))
    : projects;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
        <h1
          className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Projects
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
            aria-label="Filter projects"
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

      <div key={activeTag ?? '__all'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((project, i) => (
          <ExpandCard
            key={project.id}
            index={i}
            isExpanded={expandedId === project.id}
            onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
            header={
              <>
                {project.award && (
                  <p
                    className={`text-[clamp(0.6rem,1.2vw,0.72rem)] text-[#A63D40] font-semibold mb-1 tracking-wide uppercase${expandedId === project.id ? ' sm:hidden' : ''}`}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {project.award}
                  </p>
                )}
                <h2
                  className="text-[clamp(1rem,2.5vw,1.3rem)] text-[#2E2A22]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {project.name}
                </h2>
                {project.summary && (
                  <p
                    className="text-[clamp(0.72rem,1.4vw,0.82rem)] text-[#5B5340] mt-1 leading-snug"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {project.summary}
                  </p>
                )}
              </>
            }
            pills={
              project.technologies && project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                  {project.technologies.slice(0, expandedId === project.id ? undefined : 4).map((tech, j) => (
                    <span
                      key={j}
                      className="text-[clamp(0.58rem,1.1vw,0.68rem)] text-[#2E2A22] bg-[#2E2A22]/10 px-1.5 sm:px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {tech}
                    </span>
                  ))}
                  {expandedId !== project.id && project.technologies.length > 4 && (
                    <span
                      className="text-[clamp(0.58rem,1.1vw,0.68rem)] text-[#5B5340] px-1.5 py-0.5"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              ) : null
            }
            headerAction={
              <>
                {project.award && expandedId === project.id && (
                  <span
                    className="award-stamp hidden sm:inline-block border border-[#A63D40] rounded px-2 py-0.5 text-[#A63D40] font-semibold tracking-wide uppercase"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 'clamp(0.5rem, 1vw, 0.65rem)',
                    }}
                  >
                    {project.award}
                  </span>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5B5340] hover:text-[#2E2A22] transition-colors mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                    title="View on GitHub"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </a>
                )}
              </>
            }
            expandedContent={
              <>
                {project.video && (
                  <div
                    className="mt-3 sm:mt-4 rounded-lg overflow-hidden border border-[#2E2A22]/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <iframe
                      src={project.video}
                      title={project.name}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {project.description && project.description.length > 0 && (
                  <div className="mt-3 sm:mt-4 ml-2 sm:ml-3">
                    <ul
                      className="grid grid-cols-1 gap-y-1 sm:gap-y-1.5 list-disc pl-3 sm:pl-4 text-[clamp(0.75rem,1.6vw,0.88rem)] text-[#2E2A22] text-justify"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {project.description.map((item, j) => (
                        <li key={j}>{richText(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
