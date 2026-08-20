"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

type Props = {
  slug: string;
  sizes: string[];
  labels: {
    size: string;
    add: string;
    added: string;
    chooseSize: string;
    viewCart: string;
  };
  cartHref: string;
};

export default function AddToCart({ slug, sizes, labels, cartHref }: Props) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  return (
    <div className="mt-5">
      <p className="code text-graphite">{labels.size}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSize(s);
              setJustAdded(false);
            }}
            aria-pressed={size === s}
            className={`code min-w-12 border px-3 py-2 transition-colors ${
              size === s
                ? "border-ink bg-ink text-bone"
                : "border-rule text-ink hover:border-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!size}
        onClick={() => {
          if (!size) return;
          add({ slug, size, qty: 1 });
          setJustAdded(true);
        }}
        className="code mt-4 w-full border border-ink bg-ink px-4 py-3 text-bone transition-colors hover:bg-resin-deep disabled:cursor-not-allowed disabled:border-rule disabled:bg-bone-dim disabled:text-graphite"
      >
        {size ? labels.add : labels.chooseSize}
      </button>

      {justAdded && (
        <p className="code-sm mt-3 flex items-center justify-between gap-3 border border-resin-deep bg-resin-wash px-3 py-2">
          <span className="text-ink">{labels.added}</span>
          <a href={cartHref} className="underline">
            {labels.viewCart}
          </a>
        </p>
      )}
    </div>
  );
}
