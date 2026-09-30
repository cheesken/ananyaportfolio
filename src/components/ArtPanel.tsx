import artData from '../data/art.json';
import ShimmerImage from './ShimmerImage';
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
          Artfolio
        </h1>
      </div>

      <div
        className="gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8"
        style={{ columns: '2 240px' }}
      >
        {pieces.map((piece, i) => {
          const src = getArtImage(piece.image);
          if (!src) return null;
          return (
            <div
              key={piece.id}
              className="relative group mb-3 sm:mb-4 break-inside-avoid rounded-lg overflow-hidden border border-[#2E2A22]/10 cursor-default animate-fade-in-up"
              style={{ '--i': i, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } as React.CSSProperties}
            >
              <ShimmerImage src={src} alt={piece.title || 'Artwork'} className="w-full block transition-transform duration-500 ease-out group-hover:scale-[1.75]" />

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
