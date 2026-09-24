import educationData from '../data/education.json';
import richText from '../utils/richText';
import type { Education } from '../types';

const entries = ([...educationData] as Education[]).sort((a, b) => b.id - a.id);

export default function EducationPanel() {
  return (
    <div>
      <h1
        className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22] mb-4 sm:mb-6 md:mb-8"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Education
      </h1>

      <div className="space-y-4 sm:space-y-6">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="animate-fade-in-up"
            style={{ '--i': i } as React.CSSProperties}
          >
            <h2
              className="text-[clamp(1.5rem,4vw,2rem)] text-[#2E2A22] underline decoration-dotted underline-offset-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {entry.school}
            </h2>
            <h3
              className="text-[clamp(1rem,2.5vw,1.25rem)] text-[#5B5340] mt-1"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {entry.degree}
            </h3>
            {entry.relevantCourses && entry.relevantCourses.length > 0 && (
              <div className="ml-4 sm:ml-6 mt-3">
                <h4
                  className="text-[clamp(0.775rem,1.8vw,0.975rem)] text-[#2E2A22] italic font-bold"
                  style={{ fontFamily: "'Bodoni Moda', serif" }}
                >
                  Relevant Courses
                </h4>
                <ul
                  className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 gap-y-1 list-disc pl-4 text-[clamp(0.8rem,1.8vw,0.95rem)] text-[#2E2A22]"
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  {entry.relevantCourses.map((course, i) => (
                    <li key={i}>{richText(course)}</li>
                  ))}
                </ul>
              </div>
            )}
            {entry.achievements && entry.achievements.length > 0 && (
              <div className="ml-4 sm:ml-6 mt-3">
                <h4
                  className="text-[clamp(0.775rem,1.8vw,0.975rem)] text-[#2E2A22] italic font-bold"
                  style={{ fontFamily: "'Bodoni Moda', serif" }}
                >
                  Achievements
                </h4>
                <ul
                  className="mt-1 grid grid-cols-1 gap-y-1 list-disc pl-4 text-[clamp(0.8rem,1.8vw,0.95rem)] text-[#2E2A22]"
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  {entry.achievements.map((item, i) => (
                    <li key={i}>{richText(item)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
