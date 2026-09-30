import { useState } from 'react';
import notesData from '../data/notes.json';
import ExpandCard from './ExpandCard';
import ShimmerImage from './ShimmerImage';
import type { Note } from '../types';

const posts = ([...notesData] as Note[]).sort((a, b) => b.id - a.id);

const imageModules = import.meta.glob('../asset/notes/*.{png,jpg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function getNoteImage(filename: string): string | undefined {
  const key = `../asset/notes/${filename}`;
  return imageModules[key];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotesPanel() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
          Notes
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
        {posts.map((post, i) => (
          <ExpandCard
            key={post.id}
            index={i}
            isExpanded={expandedId === post.id}
            onToggle={() => setExpandedId(expandedId === post.id ? null : post.id)}
            header={
              <>
                <p
                  className="text-[clamp(0.6rem,1.2vw,0.72rem)] text-[#5B5340] mb-1 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {formatDate(post.date)}
                </p>
                <h2
                  className="text-[clamp(1rem,2.5vw,1.3rem)] text-[#2E2A22]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {post.title}
                </h2>
              </>
            }
            pills={
              post.tags && post.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[clamp(0.58rem,1.1vw,0.68rem)] text-[#2E2A22] bg-[#2E2A22]/10 px-1.5 sm:px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null
            }
            expandedContent={
              <>
                {post.video && (
                  <div
                    className="mt-3 sm:mt-4 rounded-lg overflow-hidden border border-[#2E2A22]/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <iframe
                      src={post.video}
                      title={post.title}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {post.image && (() => {
                  const src = getNoteImage(post.image);
                  return src ? (
                    <div className="mt-3 sm:mt-4 rounded-lg overflow-hidden border border-[#2E2A22]/10">
                      <ShimmerImage src={src} alt={post.title} className="w-full object-cover" />
                    </div>
                  ) : null;
                })()}
                <div className="mt-3 sm:mt-4 flex flex-col gap-3">
                  {post.body.map((para, i) => (
                    <p
                      key={i}
                      className="text-[clamp(0.78rem,1.7vw,0.9rem)] text-[#2E2A22] leading-relaxed"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
