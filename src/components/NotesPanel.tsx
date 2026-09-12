import { useState } from 'react';
import notesData from '../data/notes.json';
import ExpandCard from './ExpandCard';
import type { Note } from '../types';

const posts = ([...notesData] as Note[]).sort((a, b) => b.id - a.id);

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotesPanel() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h1
        className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22] mb-4 sm:mb-6 md:mb-8"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Notes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {posts.map((post) => (
          <ExpandCard
            key={post.id}
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
              <div className="mt-3 sm:mt-4">
                <p
                  className="text-[clamp(0.78rem,1.7vw,0.9rem)] text-[#2E2A22] leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  {post.body}
                </p>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
