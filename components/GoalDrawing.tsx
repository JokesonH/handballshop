/**
 * Technical elevation of a regulation handball goal, 3.00m × 2.00m, drawn to
 * scale with dimension callouts.
 *
 * This is the hero art. The net mesh is the sport's most recognisable
 * graphic, and a dimensioned technical drawing carries the label's voice
 * better than a stock photo of someone jumping — which matters more than
 * usual here, because there is no product photography yet.
 *
 * Strokes animate in on load via .draw-in; --len is tuned per path to roughly
 * its own length so the timing reads evenly.
 */
export default function GoalDrawing({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 520 380"
      fill="none"
      className={className}
      role="img"
      aria-label="Technical drawing of a regulation 3.00m by 2.00m handball goal"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      >
        {/* Net mesh — drawn first so the frame sits over it */}
        <g opacity="0.28" strokeWidth="0.6">
          {Array.from({ length: 13 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={110 + i * 25}
              y1="90"
              x2={110 + i * 25}
              y2="290"
              className="draw-in"
              style={{ "--len": 200, animationDelay: `${700 + i * 18}ms` } as React.CSSProperties}
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="110"
              y1={90 + i * 25}
              x2="410"
              y2={90 + i * 25}
              className="draw-in"
              style={{ "--len": 300, animationDelay: `${760 + i * 18}ms` } as React.CSSProperties}
            />
          ))}
        </g>

        {/* Goal frame — the 3m × 2m opening */}
        <path
          d="M110 290 L110 90 L410 90 L410 290"
          strokeWidth="3"
          className="draw-in"
          style={{ "--len": 700, animationDelay: "150ms" } as React.CSSProperties}
        />

        {/* Ground line */}
        <path
          d="M40 290 L480 290"
          strokeWidth="2"
          className="draw-in"
          style={{ "--len": 440, animationDelay: "80ms" } as React.CSSProperties}
        />

        {/* Net depth — perspective rake back */}
        <g opacity="0.55">
          <path
            d="M110 90 L70 50 M410 90 L370 50 M110 290 L70 250 M410 290 L370 250"
            className="draw-in"
            style={{ "--len": 240, animationDelay: "900ms" } as React.CSSProperties}
          />
          <path
            d="M70 50 L370 50 M70 250 L370 250 M70 50 L70 250 M370 50 L370 250"
            className="draw-in"
            style={{ "--len": 1100, animationDelay: "1000ms" } as React.CSSProperties}
          />
        </g>

        {/* ---- Dimension callouts ---- */}
        <g
          stroke="var(--color-resin-deep)"
          strokeWidth="1"
          className="draw-in"
          style={{ "--len": 700, animationDelay: "1250ms" } as React.CSSProperties}
        >
          {/* width, below */}
          <path d="M110 322 L410 322 M110 316 L110 328 M410 316 L410 328" />
          {/* height, right */}
          <path d="M442 90 L442 290 M436 90 L448 90 M436 290 L448 290" />
        </g>
      </g>

      {/* Callout text */}
      <g
        fill="var(--color-resin-deep)"
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1.5"
        className="rise-in"
        style={{ animationDelay: "1500ms" }}
      >
        <rect x="228" y="312" width="64" height="20" fill="var(--color-bone)" />
        <text x="260" y="326" textAnchor="middle">
          3.00 M
        </text>
        <rect x="432" y="180" width="20" height="52" fill="var(--color-bone)" />
        <text
          x="442"
          y="206"
          textAnchor="middle"
          transform="rotate(-90 442 206)"
        >
          2.00 M
        </text>
      </g>

      {/* Spec stamp, bottom-left */}
      <g
        fill="var(--color-graphite)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.4"
        className="rise-in"
        style={{ animationDelay: "1650ms" }}
      >
        <text x="40" y="352">3.00 × 2.00 M · IHF GOAL</text>
        <text x="40" y="366">FIG. 1</text>
      </g>
    </svg>
  );
}
