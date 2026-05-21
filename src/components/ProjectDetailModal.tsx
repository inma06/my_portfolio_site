import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiFileText } from "react-icons/fi";
import type { Project } from "../data/portfolio";
import { Modal } from "./Modal";
import { Markdown } from "./Markdown";

type Mode = "brief" | "detail";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const [mode, setMode] = useState<Mode>("brief");

  useEffect(() => {
    if (project) setMode("brief");
  }, [project]);

  if (!project) {
    return <Modal open={false} onClose={onClose}>{null}</Modal>;
  }

  const hasBrief = !!project.brief;
  const hasDetail = !!project.detail;
  const showingDetail = mode === "detail" && hasDetail;
  const source = showingDetail ? project.detail! : project.brief ?? "";

  const headerExtra =
    showingDetail && hasBrief ? (
      <button
        type="button"
        onClick={() => setMode("brief")}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        <FiArrowLeft className="h-3 w-3" />
        간략 보기
      </button>
    ) : (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
        <FiFileText className="h-3 w-3" />
        {showingDetail ? "Detail" : "Brief"}
      </span>
    );

  const footer = !showingDetail && hasDetail ? (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--color-muted)]">
        더 자세한 회고가 준비되어 있습니다.
      </span>
      <button
        type="button"
        onClick={() => setMode("detail")}
        className="group inline-flex items-center gap-2 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-2 text-sm font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
      >
        자세한 회고 보기
        <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </button>
    </div>
  ) : null;

  return (
    <Modal
      open={!!project}
      onClose={onClose}
      title={project.name}
      subtitle={
        [project.period, project.role].filter(Boolean).join(" · ") || undefined
      }
      headerExtra={headerExtra}
      footer={footer}
    >
      {source ? (
        <Markdown source={source} />
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          등록된 문서가 없습니다.
        </p>
      )}
    </Modal>
  );
}
