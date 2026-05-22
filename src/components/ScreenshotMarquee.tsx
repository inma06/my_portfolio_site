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
  const durationSec = Math.max(20, urls.length * 6);

  // 모달이 열려있는지 여부 확인
  const isLightboxOpen = active !== null;

  return (
    <>
      <div
        // 💡 수정 포인트: 라이트박스 모달이 열려 있을 때는 마키 영역의 포인터 이벤트를 차단(pointer-events-none)하여
        // 마우스 커서 이동 시 발생하는 부모/자식 간의 이벤트 버그 및 깜빡임을 원천 차단합니다.
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
          // 💡 추가 팁: 모달이 열렸을 때 뒤에서 마키가 웅성웅성 움직이면 연산이 꼬일 수 있으므로 애니메이션을 잠시 멈춰줍니다 (선택사항)
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
                  e.stopPropagation(); // 부모 카드 클릭 방지
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