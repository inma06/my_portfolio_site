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

  // 💡 라이트박스 팝업이 활성화되었는지 확인하는 상태 변수입니다.
  const isLightboxOpen = active !== null;

  return (
    <>
      <div
        // 💡 라이트박스가 열려 있을 경우, 최외각 영역 전체에 pointer-events-none을 적용해
        // 마우스 커서가 섹션을 벗어날 때 발생하는 레이아웃 무한 깜빡임 버그를 원천 차단합니다.
        className={`relative -mx-6 -mt-6 mb-5 overflow-hidden bg-[var(--color-bg)] ${
          isLightboxOpen ? "pointer-events-none" : ""
        }`}
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
          // 💡 라이트박스가 켜지면 뒤에서 흐르는 애니메이션도 일시 중지(paused)시켜 충돌을 예방합니다.
          style={
            {
              "--marquee-duration": `${durationSec}s`,
              animationPlayState: isLightboxOpen ? "paused" : "running",
            } as React.CSSProperties
          }
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