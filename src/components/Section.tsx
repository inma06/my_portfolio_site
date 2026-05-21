import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
    >
      <div className="mb-12 flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
          {eyebrow}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
