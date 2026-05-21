import { useEffect, useState } from "react";

export function ScrollIndicator() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-8 flex justify-center transition-all duration-500 sm:bottom-12 ${
        hidden ? "translate-y-2 opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="mouse-outline">
          <div className="mouse-wheel" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
          scroll
        </span>
      </div>
    </div>
  );
}
