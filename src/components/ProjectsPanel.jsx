import { useState } from 'react';
import projectData from '../data/project.json';
import ExpandCard from './ExpandCard';

const projects = [...projectData].sort((a, b) => b.id - a.id);

export default function ProjectsPanel() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      <h1
        className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22] mb-4 sm:mb-6 md:mb-8"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Projects
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {projects.map((project) => (
          <ExpandCard
            key={project.id}
            isExpanded={expandedId === project.id}
            onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
            header={
              <>
                {project.award && (
                  <p
                    className="text-[clamp(0.6rem,1.2vw,0.72rem)] text-[#A63D40] font-semibold mb-1 tracking-wide uppercase"
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
                  {project.technologies.slice(0, expandedId === project.id ? undefined : 4).map((tech, i) => (
                    <span
                      key={i}
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
              project.github ? (
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
              ) : null
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
                      className="grid grid-cols-1 gap-y-1 sm:gap-y-1.5 list-disc pl-3 sm:pl-4 text-[clamp(0.75rem,1.6vw,0.88rem)] text-[#2E2A22]"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {project.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.video && (
                  <div className="mt-3 sm:mt-4">
                    <a
                      href={project.video.replace('/embed/', '/watch?v=')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[clamp(0.75rem,1.5vw,0.85rem)] text-[#3E6680] hover:text-[#2E2A22] transition-colors"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Watch on YouTube &rarr;
                    </a>
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
