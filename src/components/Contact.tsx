import type { IconType } from "react-icons";
import { FiCheck, FiCopy, FiDownload, FiFileText, FiMail, FiPhone } from "react-icons/fi";
import { SiKakaotalk } from "react-icons/si";
import { Section } from "./Section";
import { profile } from "../data/portfolio";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

function formatPhoneDisplay(raw: string): string {
  return raw.replace(/^\+(\d{2})/, "+$1 ").replace(/\./g, "-");
}

function formatPhoneTel(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

interface ContactRowProps {
  Icon: IconType;
  label: string;
  display: string;
  copyValue: string;
  href: string;
  className?: string;
  iconClassName?: string;
}

function ContactRow({
  Icon,
  label,
  display,
  copyValue,
  href,
  className = "",
  iconClassName = "text-[var(--color-accent)]",
}: ContactRowProps) {
  const { copied, copy } = useCopyToClipboard();
  const isExternal = /^https?:\/\//.test(href);
  return (
    <article
      className={`group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]/60 ${className}`}
    >
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] ${iconClassName}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {label}
        </p>
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer noopener" : undefined}
          className="block truncate text-sm font-medium text-[var(--color-text)] transition hover:text-[var(--color-accent)] sm:text-base"
        >
          {display}
        </a>
      </div>
      <button
        type="button"
        onClick={() => copy(copyValue)}
        aria-label={copied ? `${label} 복사됨` : `${label} 복사`}
        title={copied ? "복사됨!" : "복사"}
        className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        {copied ? (
          <FiCheck className="h-4 w-4 text-[var(--color-accent)]" />
        ) : (
          <FiCopy className="h-4 w-4" />
        )}
      </button>
    </article>
  );
}

function DownloadRow() {
  return (
    <article className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]/60 sm:col-span-2">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-accent)]">
        <FiFileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          다운로드
        </p>
        <a
          href="/park-bongho-portfolio.pdf"
          download
          className="block truncate text-sm font-medium text-[var(--color-text)] transition hover:text-[var(--color-accent)] sm:text-base"
        >
          박봉호 포트폴리오 PDF
        </a>
      </div>
      <a
        href="/park-bongho-portfolio.pdf"
        download
        aria-label="포트폴리오 PDF 다운로드"
        title="PDF 다운로드"
        className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        <FiDownload className="h-4 w-4" />
      </a>
    </article>
  );
}

export function Contact() {
  const phoneDisplay = formatPhoneDisplay(profile.phone);
  const phoneTel = formatPhoneTel(profile.phone);

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="연락주세요"
      description="제안 · 협업 · 채용 어느 쪽이든 편하게 연락 주세요."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ContactRow
          Icon={FiMail}
          label="이메일"
          display={profile.email}
          copyValue={profile.email}
          href={`mailto:${profile.email}`}
        />
        <ContactRow
          Icon={FiPhone}
          label="전화"
          display={phoneDisplay}
          copyValue={phoneDisplay}
          href={`tel:${phoneTel}`}
        />
        <DownloadRow />
        <ContactRow
          Icon={SiKakaotalk}
          label="카카오 오픈채팅"
          display={profile.kakao.replace(/^https?:\/\//, "")}
          copyValue={profile.kakao}
          href={profile.kakao}
          className="sm:col-span-2"
          iconClassName="text-yellow-400"
        />
      </div>
    </Section>
  );
}
