import { useState } from "react";
import { FaApple, FaGooglePlay, FaGithub } from "react-icons/fa";
import { FiExternalLink, FiArrowRight } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Section } from "./Section";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { projects } from "../data/portfolio";
import type { Project, ProjectLink, ProjectLinkKind } from "../data/portfolio";

const LINK_META: Record<
  ProjectLinkKind,
  { label: string; Icon: IconType }
> = {
  appstore: { label: "App Store", Icon: FaApple },
  playstore: { label: "Play Store", Icon: FaGooglePlay },
  github: { label: "GitHub", Icon: FaGithub },
  website: { label: "Website", Icon: FiExternalLink },
};

function LinkButton({ link }: { link: ProjectLink }) {
  const meta = LINK_META[link.kind];
  const Icon = meta.Icon;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => e.stopPropagation()}
      className="group inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-white"
    >
      <Icon className="h-3.5 w-3.5 text-[var(--color-muted)] transition group-hover:text-[var(--color-accent)]" />
      {link.label ?? meta.label}
    </a>
  );
}

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <Section
        id="projects"
        eyebrow="Projects"
        title="만든 것들"
        description="카드를 클릭하면 간략 회고가 열리고, 거기서 한 번 더 누르면 상세 회고로 이어집니다."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                className={`group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition focus:outline-none ${
                  openable
                    ? "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-accent)]/60 hover:shadow-[0_10px_40px_-20px_rgba(167,139,250,0.4)] focus-visible:border-[var(--color-accent)]"
                    : ""
                }`}
              >
                <header className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
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
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {project.description}
                </p>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-muted)]">
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
