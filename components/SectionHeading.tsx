import Link from "next/link";

type Props = {
  kicker?: string;
  title: string;
  body?: string;
  action?: { href: string; label: string };
  tone?: "light" | "dark";
};

export default function SectionHeading({
  kicker,
  title,
  body,
  action,
  tone = "light",
}: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-6 border-b pb-3 ${
        dark ? "border-bone/20" : "border-rule"
      }`}
    >
      <div className="max-w-2xl">
        {kicker && (
          <p className={`code ${dark ? "text-resin" : "text-resin-deep"}`}>
            {kicker}
          </p>
        )}
        <h2
          className={`display-title mt-2 text-3xl sm:text-4xl ${
            dark ? "text-bone" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {body && (
          <p
            className={`mt-4 text-base leading-relaxed ${
              dark ? "text-bone/70" : "text-ink-soft"
            }`}
          >
            {body}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`code border-b-2 border-resin pb-1 transition-colors ${
            dark ? "text-bone hover:text-resin" : "text-ink hover:text-resin-deep"
          }`}
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
