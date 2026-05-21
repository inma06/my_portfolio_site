import { Section } from "./Section";
import { stacks } from "../data/portfolio";

export function TechStack() {
  return (
    <Section
      id="stack"
      eyebrow="Tech Stack"
      title="이런 기술들을 다룹니다"
      description="백엔드와 모바일을 중심으로, 인프라/도구까지 직접 다루며 서비스를 운영합니다."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stacks.map((group) => (
          <article
            key={group.category}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition hover:border-[var(--color-accent)]/60"
          >
            <header className="mb-4 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                {group.label}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {group.category}
              </span>
            </header>
            <p className="mb-5 text-sm text-[var(--color-muted)]">
              {group.description}
            </p>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 font-mono text-xs text-[var(--color-text)]"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
