import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  source: string;
}

export function Markdown({ source }: MarkdownProps) {
  return (
    <article
      className="prose prose-sm sm:prose-base max-w-none
        prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight
        prose-headings:text-[var(--color-text)]
        prose-h1:text-2xl prose-h1:mt-0 sm:prose-h1:text-3xl
        prose-h2:text-xl prose-h2:mt-10 prose-h2:border-b prose-h2:border-[var(--color-border)] prose-h2:pb-2
        prose-h3:text-base prose-h3:mt-8
        prose-p:leading-8 prose-p:text-[var(--color-muted)]
        prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
        prose-strong:text-[var(--color-text)]
        prose-code:rounded prose-code:bg-[var(--color-surface-2)] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[var(--color-accent)] prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-lg prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:bg-[var(--color-bg)] prose-pre:text-xs sm:prose-pre:text-sm
        prose-blockquote:border-l-[var(--color-accent)] prose-blockquote:bg-[var(--color-surface-2)] prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-[var(--color-text)]
        prose-hr:border-[var(--color-border)]
        prose-ul:text-[var(--color-muted)] prose-ol:text-[var(--color-muted)]
        prose-table:text-sm
        prose-th:bg-[var(--color-surface-2)] prose-th:text-[var(--color-text)]
        prose-td:border-[var(--color-border)] prose-td:text-[var(--color-muted)]
        prose-td:align-top
        prose-li:marker:text-[var(--color-accent)]"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...rest }) => {
            const isExternal = href?.startsWith("http");
            if (!isExternal) {
              return <span className="text-[var(--color-muted)]">{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                {...rest}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
}
