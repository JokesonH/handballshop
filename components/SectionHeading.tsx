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
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {kicker && (
          <p className={`kicker ${dark ? "text-nc-resin" : "text-nc-resin-deep"}`}>
            {kicker}
          </p>
        )}
        <h2
          className={`display-title mt-2 text-3xl sm:text-4xl ${
            dark ? "text-nc-paper" : "text-nc-court"
          }`}
        >
          {title}
        </h2>
        {body && (
          <p
            className={`mt-4 text-base leading-relaxed ${
              dark ? "text-nc-paper/75" : "text-nc-slate"
            }`}
          >
            {body}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`kicker border-b-2 pb-1 transition-colors ${
            dark
              ? "border-nc-resin text-nc-paper hover:text-nc-resin"
              : "border-nc-resin text-nc-court hover:text-nc-resin-deep"
          }`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
