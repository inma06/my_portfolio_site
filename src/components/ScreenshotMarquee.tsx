import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";

interface ScreenshotMarqueeProps {
  slug: string;
  files: string[];
  alt: string;
}

export function ScreenshotMarquee({ slug, files, alt }: ScreenshotMarqueeProps) {
  const [active, setActive] = useState<number | null>(null);

  if (!files || files.length === 0) return null;

  const urls = files.map((f) => `/screenshots/${slug}/${f}`);
  const looped = [...urls, ...urls];
  // Slower when many images so individual screenshots are readable
  const durationSec = Math.max(20, urls.length * 6);

  return (
    <>
      <div
        className="relative -mx-6 -mt-6 mb-5 overflow-hidden bg-[var(--color-bg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--color-surface)] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--color-surface)] to-transparent"
        />

        <ul
          className="marquee-track flex gap-3 py-4"
          style={{ "--marquee-duration": `${durationSec}s` } as React.CSSProperties}
        >
          {looped.map((src, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(i % urls.length);
                }}
                aria-label={`${alt} 캡처 ${(i % urls.length) + 1} 크게 보기`}
                className="block overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] transition hover:border-[var(--color-accent)]"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="block h-32 w-auto select-none object-cover sm:h-36"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ImageLightbox
        urls={urls}
        alt={alt}
        index={active}
        onClose={() => setActive(null)}
        onPrev={() =>
          setActive((i) =>
            i === null ? null : (i - 1 + urls.length) % urls.length
          )
        }
        onNext={() =>
          setActive((i) => (i === null ? null : (i + 1) % urls.length))
        }
      />
    </>
  );
}
