/**
 * The Northcourt mark: the goal-arc and true north, broken into one line.
 * A wide goal-mouth arc (the sport) with a north-pointing spike breaking
 * through its apex (the "north" in the name). Arc is always the brand's
 * Ice; the spike defaults to Gold but takes any currentColor override —
 * the brand sheet shows it in both Gold-on-navy and Crimson-on-bone.
 */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      className={className}
      role="img"
      aria-label="Northcourt mark"
    >
      <path
        d="M10 66C10 66 30 92 60 92C90 92 110 66 110 66"
        stroke="var(--color-court)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M60 8L86 78L60 64L34 78L60 8Z"
        fill="var(--color-resin)"
      />
    </svg>
  );
}
