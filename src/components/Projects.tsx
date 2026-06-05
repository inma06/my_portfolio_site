import { useState } from "react";
import {
  FaAppStoreIos,
  FaGooglePlay,
  FaGithub,
  FaApple,
  FaAndroid,
} from "react-icons/fa";
import {
  FiArrowRight,
  FiServer,
  FiGlobe,
  FiSmartphone,
} from "react-icons/fi";
import { SiFlutter } from "react-icons/si";
import type { IconType } from "react-icons";
import { Section } from "./Section";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { ScreenshotMarquee } from "./ScreenshotMarquee";
import { projects } from "../data/portfolio";
import type {
  Badge as BadgeData,
  BadgeKind,
  Project,
  ProjectLink,
  ProjectLinkKind,
} from "../data/portfolio";

const LINK_META: Record<
  ProjectLinkKind,
  { label: string; Icon: IconType }
> = {
  appstore: { label: "App Store", Icon: FaAppStoreIos },
  playstore: { label: "Play Store", Icon: FaGooglePlay },
  github: { label: "GitHub", Icon: FaGithub },
  website: { label: "Website", Icon: FiArrowRight },
};

const BADGE_META: Record<
  BadgeKind,
  { label: string; fallback?: string; Icon: IconType; cls: string }
> = {
  backend: {
    label: "Back-End",
    Icon: FiServer,
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  web: {
    label: "Front-End",
    fallback: "Web",
    Icon: FiGlobe,
    cls: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  app: {
    label: "Front-End",
    fallback: "App",
    Icon: FiSmartphone,
    cls: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  ios: {
    label: "iOS",
    Icon: FaApple,
    cls: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-200",
  },
  aos: {
    label: "AOS",
    Icon: FaAndroid,
    cls: "border-lime-500/30 bg-lime-500/10 text-lime-700 dark:text-lime-300",
  },
  flutter: {
    label: "Flutter",
    Icon: SiFlutter,
    cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
};

const KINDS_WITH_FRAMEWORK: ReadonlySet<BadgeKind> = new Set<BadgeKind>([
  "backend",
  "web",
  "app",
]);

function Badge({ badge }: { badge: BadgeData }) {
  const meta = BADGE_META[badge.kind];
  const Icon = meta.Icon;
  const suffix = KINDS_WITH_FRAMEWORK.has(badge.kind)
    ? badge.framework ?? meta.fallback
    : undefined;
  const label = suffix ? `${meta.label} (${suffix})` : meta.label;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function LinkButton({ link }: { link: ProjectLink }) {
  const meta = LINK_META[link.kind];
  const Icon = meta.Icon;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => e.stopPropagation()}
      className="group inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      <Icon className="h-3.5 w-3.5 text-[var(--color-muted)] transition group-hover:text-[var(--color-accent)]" />
      {link.label ?? meta.label}
    </a>
  );
}

// 💡 Props의 인자 타입을 명확하게 선언하여 implicitly 'any' 에러를 완전 차단합니다.
interface ProjectsProps {
  onOpenGlobalLightbox: (urls: string[], alt: string, index: number) => void;
}

export function Projects({ onOpenGlobalLightbox }: ProjectsProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <Section
        id="projects"
        eyebrow="Projects"
        title="만든 것들"
        description="카드를 클릭하면 간략 회고가 열리고, 거기서 한 번 더 누르면 상세 회고로 이어집니다."
      >
        <div className="grid grid-cols-1 gap-7">
          {projects.map((project) => {
            const openable = !!project.brief || !!project.detail;
            return (
              <article
                key={project.name}
                onClick={openable ? () => setActiveProject(project) : undefined}
                onKeyDown={
                  openable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveProject(project);
                        }
                      }
                    : undefined
                }
                role={openable ? "button" : undefined}
                tabIndex={openable ? 0 : undefined}
                aria-label={openable ? `${project.name} 회고 열기` : undefined}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_18px_60px_-42px_var(--color-shadow)] transition focus:outline-none sm:p-8 ${
                  openable
                    ? "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-accent)]/60 hover:shadow-[0_24px_70px_-42px_var(--color-shadow)] focus-visible:border-[var(--color-accent)]"
                    : ""
                }`}
              >
                {project.screenshots && project.screenshots.length > 0 && (
                  /* 💡 인자 타입 선언을 추가하여 바인딩 오류를 없앱니다. */
                  <ScreenshotMarquee
                    slug={project.slug}
                    files={project.screenshots}
                    alt={project.name}
                    onOpenLightbox={(urls: string[], alt: string, index: number) =>
                      onOpenGlobalLightbox(urls, alt, index)
                    }
                  />
                )}
                <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <h3 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
                    {project.name}
                  </h3>
                  {project.period && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {project.period}
                    </span>
                  )}
                </header>
                {project.role && (
                  <p className="mb-3 text-xs text-[var(--color-accent)]">
                    {project.role}
                  </p>
                )}
                {project.badges && project.badges.length > 0 && (
                  <ul className="mb-4 flex flex-wrap gap-1.5">
                    {project.badges.map((b) => (
                      <li key={b.kind}>
                        <Badge badge={b} />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-base leading-8 text-[var(--color-muted)]">
                  {project.description}
                </p>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                    {project.highlights.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]/70" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text)]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                {(project.links.length > 0 || openable) && (
                  <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5">
                    <div className="flex flex-wrap gap-2">
                      {project.links.map((link) => (
                        <LinkButton key={link.kind + link.url} link={link} />
                      ))}
                    </div>
                    {openable && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] transition group-hover:text-[var(--color-accent)]">
                        간략 회고 보기
                        <FiArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </footer>
                )}
              </article>
            );
          })}
        </div>
      </Section>

      <ProjectDetailModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </>
  );
}
