import stickerImg from '../asset/me/stickerpainting copy.png';
import circleImg from '../asset/me/mecir.png';

export default function HomePanel() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] md:min-h-[60vh]">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4">
        {/* ── Mobile: circular image on top ── */}
        <div className="md:hidden flex-shrink-0">
          <img
            src={circleImg}
            alt="Ananya"
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover"
          />
        </div>

        {/* ── Desktop: sticker on left ── */}
        <div className="hidden md:flex flex-shrink-0 self-stretch items-center">
          <img
            src={stickerImg}
            alt="Ananya"
            className="h-full w-auto max-w-52 lg:max-w-64 xl:max-w-80 object-contain drop-shadow-lg"
          />
        </div>

        {/* ── Text block on right ── */}
        <div className="flex flex-col items-center md:items-start">
          <div
            className="inline-block text-left mb-3"
            style={{
              fontFamily: "'Caveat', cursive",
              transform: 'rotate(-1deg)',
            }}
          >
            <h1 className="text-[clamp(1.8rem,6vw,3.8rem)] leading-[1.1] text-[#2E2A22] font-bold">
              Hello! I'm Ananya.
            </h1>
          </div>
          <p
            className="text-[clamp(0.82rem,1.8vw,1.1rem)] text-[#5B5340] leading-relaxed text-center md:text-left"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              maxWidth: 'min(32ch, 100%)',
              fontWeight: 500,
            }}
          >
            I'm a software engineer with 3+ years of experience building robust systems at scale. I'm endlessly curious and love learning new things, so this is a collection of some of what I've picked up along the way. Feel free to explore, and reach out if you have a question, want to chat, or just want to say hi! {"❤︎"}
          </p>
        </div>
      </div>
    </div>
  );
}
