import { FiGithub, FiMail } from "react-icons/fi";
import { profile } from "../data/portfolio";
import { useTypewriter } from "../hooks/useTypewriter";

export function Hero() {
  const fullText = `안녕하세요,\n${profile.name} 입니다.`;
  const typed = useTypewriter(fullText);

  return (
    <section
      id="hero"
      className="relative isolate mx-auto flex min-h-[88vh] w-full max-w-5xl flex-col justify-center px-6 sm:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(167,139,250,0.18),transparent_70%)]"
      />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
        {profile.title}
      </p>

      <h1
        className="relative mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl"
        aria-label={fullText.replace("\n", " ")}
      >
        <span aria-hidden className="invisible whitespace-pre-line">
          {fullText}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 whitespace-pre-line"
        >
          {typed}
          <span className="caret">|</span>
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
        {profile.tagline}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
        >
          <FiGithub className="h-4 w-4 text-[var(--color-muted)] transition group-hover:text-[var(--color-accent)]" />
          GitHub
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
        >
          <FiMail className="h-4 w-4 text-[var(--color-muted)] transition group-hover:text-[var(--color-accent)]" />
          {profile.email}
        </a>
      </div>
    </section>
  );
}
