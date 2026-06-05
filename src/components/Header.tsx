import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { profile } from "../data/portfolio";

const NAV_ITEMS = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "stack", label: "Tech Stack" },
  { id: "contact", label: "Contact" },
] as const;

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "portfolio-theme";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = mode;
}

export function Header() {
  const [active, setActive] = useState<string>(NAV_ITEMS[0].id);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActive(topmost.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    const els = NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-6 sm:px-8">
        <a
          href="#hero"
          className="font-mono text-sm font-semibold tracking-tight text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
          aria-label="맨 위로"
        >
          {profile.name}
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav aria-label="섹션 네비게이션">
            <ul className="flex items-center gap-1 sm:gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative inline-flex items-center rounded-md px-2 py-1.5 text-xs font-medium transition sm:px-2.5 sm:text-sm ${
                        isActive
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute inset-x-2.5 -bottom-px h-px bg-[var(--color-accent)] transition-opacity ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <span
            aria-hidden
            className="hidden h-5 w-px bg-[var(--color-border)] sm:block"
          />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "화이트모드로 전환" : "다크모드로 전환"
            }
            title={theme === "dark" ? "화이트모드" : "다크모드"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            {theme === "dark" ? (
              <FiSun className="h-4 w-4" />
            ) : (
              <FiMoon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
