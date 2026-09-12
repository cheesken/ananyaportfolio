export default function Stamp() {
  return (
    <svg
      className="w-[min(60vw,220px)] sm:w-[min(55vw,260px)] md:w-[280px] h-auto aspect-square"
      viewBox="0 0 280 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ananya Makwana — Software stamp"
      style={{ transform: 'rotate(-4deg)' }}
    >
      <defs>
        {/* Arc paths centered between outer (r=132) and inner (r=98) rings */}
        <path
          id="arc-top"
          d="M 32,140 A 108,108 0 0,1 248,140"
          fill="none"
        />
        <path
          id="arc-bottom"
          d="M 18,140 A 122,122 0 0,0 262,140"
          fill="none"
        />
      </defs>

      <g>
        {/* ── Outer ring ── */}
        <circle
          cx="140"
          cy="140"
          r="132"
          fill="none"
          stroke="#d6d5d4"
          strokeWidth="2.5"
        />

        {/* ── Inner ring ── */}
        <circle
          cx="140"
          cy="140"
          r="98"
          fill="none"
          stroke="#d6d5d4"
          strokeWidth="1.5"
        />

        {/* ── Top arc text: ANANYA MAKWANA ── */}
        <text
          fill="#d6d5d4"
          stroke="#d6d5d4"
          strokeWidth="0.5"
          fontFamily="'Antic', sans-serif"
          fontSize="13"
          letterSpacing="0.22em"
        >
          <textPath
            href="#arc-top"
            startOffset="50%"
            textAnchor="middle"
          >
            ANANYA MAKWANA
          </textPath>
        </text>

        {/* ── Bottom arc text: SOFTWARE ── */}
        <text
          fill="#d6d5d4"
          stroke="#d6d5d4"
          strokeWidth="0.5"
          fontFamily="'Antic', sans-serif"
          fontSize="13"
          letterSpacing="0.22em"
        >
          <textPath
            href="#arc-bottom"
            startOffset="50%"
            textAnchor="middle"
          >
            PORTFOLIO
          </textPath>
        </text>

        {/* ── Centre monogram "A" ── */}
        <text
          x="118"
          y="162"
          textAnchor="middle"
          fill="#d6d5d4"
          stroke="#d6d5d4"
          strokeWidth="1.5"
          fontFamily="'Ballet', cursive"
          fontSize="78"
        >
          A
        </text>
      </g>
    </svg>
  );
}
