import { useEffect } from "react";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  headerExtra,
  footer,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[100dvh] w-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl sm:h-auto sm:max-h-[88dvh] sm:max-w-3xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0 flex-1">
            {headerExtra && <div className="mb-1">{headerExtra}</div>}
            {title && (
              <h2 className="truncate text-lg font-semibold text-[var(--color-text)] sm:text-xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-[var(--color-muted)] sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <FiX className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-6 py-4 sm:px-8">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
