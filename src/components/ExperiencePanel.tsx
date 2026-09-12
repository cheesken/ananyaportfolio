import experienceData from '../data/experience.json';
import richText from '../utils/richText';
import type { Experience } from '../types';

const entries = ([...experienceData] as Experience[]).sort((a, b) => b.id - a.id);

export default function ExperiencePanel() {
  return (
    <div>
      <h1
        className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22] mb-4 sm:mb-6 md:mb-8"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Experience
      </h1>

      {/* Timeline */}
      <div className="relative ml-3 sm:ml-4 md:ml-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-[#2E2A22] opacity-30" />

        <div className="space-y-5 sm:space-y-7 md:space-y-8">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-5 sm:pl-7 md:pl-8">
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
                  {entry.technologies.map((tech, i) => (
                    <span
                      key={i}
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
                    className="grid grid-cols-1 gap-y-0.5 sm:gap-y-1 list-disc pl-3 sm:pl-4 text-[clamp(0.75rem,1.6vw,0.88rem)] text-[#2E2A22]"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {entry.description.map((item, i) => (
                      <li key={i}>{richText(item)}</li>
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
