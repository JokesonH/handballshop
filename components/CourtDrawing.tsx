/**
 * Plan view of a handball court — the 6m goal area and 9m free-throw arcs.
 *
 * This is the hero art for the merch branch. The arc pair is the sport's most
 * recognisable graphic and reads as apparel-brand iconography rather than a
 * product illustration, which is the right register when the line is the
 * product and there is no photography yet.
 *
 * Strokes animate in on load via .draw-in; --len is tuned per path.
 */
export default function CourtDrawing({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 560 320"
      fill="none"
      className={className}
      role="img"
      aria-label="Plan view of a handball court showing the goal area and free-throw lines"
    >
      <g stroke="currentColor" strokeLinecap="square" vectorEffect="non-scaling-stroke">
        {/* Sidelines and goal lines */}
        <rect
          x="30"
          y="30"
          width="500"
          height="260"
          strokeWidth="2.5"
          className="draw-in"
          style={{ "--len": 1520, animationDelay: "100ms" } as React.CSSProperties}
        />

        {/* Centre line */}
        <line
          x1="280"
          y1="30"
          x2="280"
          y2="290"
          strokeWidth="1.5"
          className="draw-in"
          style={{ "--len": 260, animationDelay: "400ms" } as React.CSSProperties}
        />

        {/* Left 6m goal area — solid */}
        <path
          d="M30 100 L64 100 A 60 60 0 0 1 64 220 L30 220"
          strokeWidth="2"
          className="draw-in"
          style={{ "--len": 260, animationDelay: "520ms" } as React.CSSProperties}
        />
        {/* Left 9m free-throw — dashed */}
        <path
          d="M30 68 L74 68 A 92 92 0 0 1 74 252 L30 252"
          strokeWidth="1.5"
          strokeDasharray="9 9"
          opacity="0.6"
          className="draw-in"
          style={{ "--len": 400, animationDelay: "700ms" } as React.CSSProperties}
        />

        {/* Right 6m goal area */}
        <path
          d="M530 100 L496 100 A 60 60 0 0 0 496 220 L530 220"
          strokeWidth="2"
          className="draw-in"
          style={{ "--len": 260, animationDelay: "600ms" } as React.CSSProperties}
        />
        {/* Right 9m free-throw */}
        <path
          d="M530 68 L486 68 A 92 92 0 0 0 486 252 L530 252"
          strokeWidth="1.5"
          strokeDasharray="9 9"
          opacity="0.6"
          className="draw-in"
          style={{ "--len": 400, animationDelay: "780ms" } as React.CSSProperties}
        />

        {/* Goals — the only amber on the drawing */}
        <g
          stroke="var(--color-resin-deep)"
          strokeWidth="4"
          className="draw-in"
          style={{ "--len": 60, animationDelay: "980ms" } as React.CSSProperties}
        >
          <line x1="30" y1="140" x2="30" y2="180" />
          <line x1="530" y1="140" x2="530" y2="180" />
        </g>
      </g>

      {/* Dimension stamp */}
      <g
        fill="var(--color-graphite)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.4"
        className="rise-in"
        style={{ animationDelay: "1150ms" }}
      >
        <text x="30" y="308">40 × 20 M · IHF COURT · FIG. 1</text>
      </g>
    </svg>
  );
}
