"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

type Props = {
  images: string[];
  alt: string;
  /** "FIG. PENDING" placeholder label, already localised by the caller. */
  pendingLabel: string;
  prevLabel: string;
  nextLabel: string;
};

/**
 * Product image carousel.
 *
 * Convention across the catalogue: images[0] is the hanging product shot and
 * images[1] is the design itself. The grid card shows [1] because the design
 * carries at thumbnail size; here we open on [0] because the hanging shot is
 * the better hero, and the rest stay one click away.
 *
 * Thumbnails stay visible the whole time rather than collapsing into dots —
 * with only two or three images per product, dots would hide information for
 * no gain.
 */
export default function ProductGallery({
  images,
  alt,
  pendingLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const [rawIndex, setIndex] = useState(0);
  const count = images.length;
  // Clamp during render rather than correcting in an effect: if the image
  // list shrinks under us (locale switch, CMS edit in dev) a stale index
  // would otherwise render an empty frame for one paint.
  const index = count === 0 ? 0 : Math.min(rawIndex, count - 1);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Arrow keys work whenever the gallery itself holds focus, not globally —
  // hijacking arrows for the whole page would break normal scrolling.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  };

  if (count === 0) {
    return (
      <div className="aspect-square overflow-hidden plate">
        <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-bone-dim)_0_12px,var(--color-bone)_12px_24px)]">
          <span className="code border border-ink bg-bone px-3 py-1.5 text-graphite">
            {pendingLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-square overflow-hidden plate outline-none"
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="group"
        aria-roledescription="carousel"
        aria-label={alt}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === index ? alt : ""}
            fill
            // Only the first frame is a candidate for LCP; the rest load lazily.
            priority={i === 0}
            sizes="(min-width: 1024px) 46vw, 94vw"
            className={`object-cover transition-opacity duration-300 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          />
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={prevLabel}
              className="absolute left-2 top-1/2 -translate-y-1/2 border border-ink bg-bone/90 px-2.5 py-2 code leading-none text-ink opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={nextLabel}
              className="absolute right-2 top-1/2 -translate-y-1/2 border border-ink bg-bone/90 px-2.5 py-2 code leading-none text-ink opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              →
            </button>
            <span className="absolute bottom-2 right-2 code bg-bone/90 px-2 py-1 text-graphite">
              {index + 1}/{count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square w-full overflow-hidden border transition-colors ${
                i === index
                  ? "border-ink"
                  : "border-rule opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="128px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
