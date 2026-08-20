"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Locale } from "@/lib/locales";

export type CartCatalogEntry = {
  slug: string;
  name: string;
  href: string;
  image?: string;
  priceCents: number;
};

type Props = {
  catalog: CartCatalogEntry[];
  locale: Locale;
  labels: Record<string, string>;
};

function money(cents: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export default function CartView({ catalog, locale, labels }: Props) {
  const { lines, setQty, remove, ready } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anything in localStorage that no longer exists in the catalogue is
  // dropped from the view rather than rendered as a broken row.
  const rows = lines.flatMap((line) => {
    const entry = catalog.find((c) => c.slug === line.slug);
    return entry ? [{ line, entry }] : [];
  });
  const subtotal = rows.reduce((n, r) => n + r.entry.priceCents * r.line.qty, 0);

  if (!ready) return <p className="code text-graphite">…</p>;

  if (rows.length === 0) {
    return (
      <div>
        <p className="text-graphite">{labels.empty}</p>
        <Link href={`/${locale}/tops`} className="code mt-5 inline-block border border-ink px-4 py-2.5 hover:bg-ink hover:text-bone">
          {labels.continue}
        </Link>
      </div>
    );
  }

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: JSON.stringify(lines.map((l) => [l.slug, l.size, l.qty])), locale }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error ?? "failed");
      window.location.href = data.url;
    } catch {
      setError(labels.error);
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <ul className="flex flex-col">
        {rows.map(({ line, entry }) => (
          <li
            key={`${line.slug}-${line.size}`}
            className="flex gap-4 border-b border-rule py-4 first:border-t"
          >
            <Link href={entry.href} className="relative aspect-square w-24 shrink-0 overflow-hidden border border-rule">
              {entry.image && (
                <Image src={entry.image} alt="" fill sizes="96px" className="object-cover" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link href={entry.href} className="display-title text-lg leading-tight hover:text-resin-deep">
                {entry.name}
              </Link>
              <p className="code-sm text-graphite">{line.size}</p>
              <div className="mt-auto flex items-center gap-3">
                <label className="code-sm text-graphite">
                  {labels.qty}
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={line.qty}
                    onChange={(e) => setQty(line.slug, line.size, Number(e.target.value))}
                    className="ml-2 w-16 border border-rule bg-bone px-2 py-1 text-ink"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(line.slug, line.size)}
                  className="code-sm text-graphite underline hover:text-ink"
                >
                  {labels.remove}
                </button>
              </div>
            </div>
            <p className="display-title text-lg">{money(entry.priceCents * line.qty, locale)}</p>
          </li>
        ))}
      </ul>

      <aside className="plate h-fit p-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
          <span className="code text-graphite">{labels.subtotal}</span>
          <span className="display-title text-2xl">{money(subtotal, locale)}</span>
        </div>
        <p className="code-sm mt-3 text-graphite">{labels.shippingNote}</p>
        <button
          type="button"
          onClick={checkout}
          disabled={busy}
          className="code mt-5 w-full border border-ink bg-ink px-4 py-3 text-bone transition-colors hover:bg-resin-deep disabled:opacity-60"
        >
          {busy ? labels.processing : labels.checkout}
        </button>
        {error && <p className="code-sm mt-3 text-flag">{error}</p>}
      </aside>
    </div>
  );
}
