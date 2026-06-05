interface ScreenshotMarqueeProps {
  slug: string;
  files: string[];
  alt: string;
  // 💡 콜백 Props 타입을 구체적으로 기입해 컴파일 에러를 완벽 복구합니다.
  onOpenLightbox: (urls: string[], alt: string, index: number) => void;
}

export function ScreenshotMarquee({
  slug,
  files,
  alt,
  onOpenLightbox,
}: ScreenshotMarqueeProps) {
  if (!files || files.length === 0) return null;

  const urls = files.map((f) => `/screenshots/${slug}/${f}`);
  const looped = [...urls, ...urls];
  // Slower when many images so individual screenshots are readable
  const durationSec = Math.max(20, urls.length * 6);

  return (
    <div
      className="relative -mx-6 -mt-6 mb-6 overflow-hidden bg-[var(--color-bg)] sm:-mx-8 sm:-mt-8"
      onClick={(e) => e.stopPropagation()} // 마키 슬라이더 터치 시 부모 프로젝트 요약 카드가 들리는 오류 방어
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
                e.stopPropagation(); // 부모 요약 카드 컴포넌트로 버블링 이관되는 것 완벽 제어
                // 💡 타입 불일치 및 스코프 간섭 없이 App.tsx 전역 모달로 토스합니다.
                onOpenLightbox(urls, alt, i % urls.length);
              }}
              aria-label={`${alt} 캡처 ${(i % urls.length) + 1} 크게 보기`}
              className="block overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] transition hover:border-[var(--color-accent)]"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                draggable={false}
                className="block h-36 w-auto select-none object-cover sm:h-44 lg:h-52"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
