import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy, FiGithub, FiMail } from "react-icons/fi";
import { profile } from "../data/portfolio";
import { useTypewriter } from "../hooks/useTypewriter";

export function Hero() {
  const fullText = `안녕하세요,\n${profile.name} 입니다.`;
  const typed = useTypewriter(fullText);

  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.email);
      } else {
        const ta = document.createElement("textarea");
        ta.value = profile.email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — fallback above already attempted
    }
  };

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
        <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 rounded-l-full py-2 pl-4 pr-3 text-sm text-[var(--color-text)]"
          >
            <FiMail className="h-4 w-4 text-[var(--color-muted)] transition group-hover:text-[var(--color-accent)]" />
            {profile.email}
          </a>
          <span aria-hidden className="h-4 w-px bg-[var(--color-border)]" />
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label={copied ? "이메일이 복사되었습니다" : "이메일 주소 복사"}
            title={copied ? "복사됨!" : "이메일 복사"}
            className="inline-flex items-center justify-center rounded-r-full py-2 pl-2.5 pr-3.5 text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            {copied ? (
              <FiCheck className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            ) : (
              <FiCopy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
