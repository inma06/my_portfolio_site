import { FiDownload, FiFileText } from "react-icons/fi";

export function PortfolioDownloadFab() {
  return (
    <a
      href="/park-bongho-portfolio.pdf"
      download
      aria-label="포트폴리오 PDF 다운로드"
      className="group fixed bottom-[calc(160px+env(safe-area-inset-bottom))] z-50 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/92 px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_18px_42px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] dark:border-white/10 dark:bg-[#16161b]/92 dark:text-[#e6e6ea] dark:shadow-[0_18px_46px_-24px_rgba(0,0,0,0.9)] dark:hover:border-[#a78bfa]/70 dark:hover:text-[#c4b5fd] sm:bottom-[calc(192px+env(safe-area-inset-bottom))] sm:px-4"
      style={{
        right: "max(16px, calc((100vw - 64rem) / 2 - 148px))",
      }}
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-100 dark:bg-[#a78bfa]/12 dark:text-[#a78bfa] dark:group-hover:bg-[#a78bfa]/18">
        <FiFileText className="h-4 w-4" />
      </span>
      <span className="hidden leading-none sm:inline">Portfolio PDF</span>
      <FiDownload className="h-4 w-4 text-slate-400 transition group-hover:text-blue-600 dark:text-[#8b8b95] dark:group-hover:text-[#c4b5fd]" />
    </a>
  );
}
