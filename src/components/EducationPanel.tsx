import educationData from '../data/education.json';
import richText from '../utils/richText';
import type { Education } from '../types';

const entries = ([...educationData] as Education[]).sort((a, b) => b.id - a.id);

export default function EducationPanel() {
  return (
    <div>
      <div
        className="sticky -top-6 sm:-top-8 md:-top-10 lg:-top-12 z-10 -mx-6 px-6 -mt-6 pt-6 pb-1 sm:-mx-8 sm:px-8 sm:-mt-8 sm:pt-8 md:-mx-10 md:px-10 md:-mt-10 md:pt-10 lg:-mx-12 lg:px-12 lg:-mt-12 lg:pt-12"
        style={{
          backgroundColor: 'var(--panel-bg)',
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 4px),
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(0,0,0,0.04), transparent 50%)
          `,
          backgroundAttachment: 'fixed',
        }}
      >
        <h1
          className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Education
        </h1>
      </div>

      <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 md:mt-8">
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
                  className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 gap-y-1 list-disc pl-4 text-[clamp(0.8rem,1.8vw,0.95rem)] text-[#2E2A22] text-justify"
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
                  className="mt-1 grid grid-cols-1 gap-y-1 list-disc pl-4 text-[clamp(0.8rem,1.8vw,0.95rem)] text-[#2E2A22] text-justify"
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
