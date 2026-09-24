import artData from '../data/art.json';
import type { Art } from '../types';

const pieces = ([...artData] as Art[]).sort((a, b) => b.id - a.id);

const imageModules = import.meta.glob('../asset/art/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function getArtImage(filename: string): string | undefined {
  const key = `../asset/art/${filename}`;
  return imageModules[key];
}

export default function ArtPanel() {
  return (
    <div>
      <h1
        className="text-[clamp(1.8rem,5vw,3rem)] text-[#2E2A22] mb-4 sm:mb-6 md:mb-8"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Art
      </h1>

      <div
        className="gap-3 sm:gap-4"
        style={{ columns: '2 240px' }}
      >
        {pieces.map((piece) => {
          const src = getArtImage(piece.image);
          if (!src) return null;
          return (
            <div
              key={piece.id}
              className="relative group mb-3 sm:mb-4 break-inside-avoid rounded-lg overflow-hidden border border-[#2E2A22]/10 cursor-default"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              <img
                src={src}
                alt={piece.title || 'Artwork'}
                className="w-full block"
              />

              {(piece.title || piece.passage) && (
                <div className="absolute inset-0 bg-[#2E2A22]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5">
                  {piece.title && (
                    <p
                      className="text-[#F7F2E7] text-sm sm:text-base font-medium mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {piece.title}
                    </p>
                  )}
                  {piece.passage && (
                    <p
                      className="text-[#F7F2E7]/80 text-xs sm:text-sm leading-relaxed"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {piece.passage}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
