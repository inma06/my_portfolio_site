import { useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

interface ImageLightboxProps {
  urls: string[];
  alt: string;
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ImageLightbox({
  urls,
  alt,
  index,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, onClose, onPrev, onNext]);

  if (index === null) return null;
  const total = urls.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white transition hover:border-white/50"
      >
        <FiX className="h-5 w-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="이전 이미지"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-3 text-white transition hover:border-white/50"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="다음 이미지"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-3 text-white transition hover:border-white/50"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>

          <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-white/80">
            {index + 1} / {total}
          </span>
        </>
      )}

      <img
        src={urls[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
