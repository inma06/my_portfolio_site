import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiCopy,
  FiDownload,
  FiMaximize2,
  FiMinimize2,
  FiSend,
  FiX,
} from "react-icons/fi";
import ctaButton from "../assets/ai-prd-cta-button.svg";
import { Markdown } from "./Markdown";
import { profile } from "../data/portfolio";
import { trackPrdAgentEvent } from "../lib/trackPrdAgentEvent";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { usePrdAgent } from "../hooks/usePrdAgent";
import type {
  FakeCheckoutStatus,
  FeaturePriority,
  PrdDocumentTab,
} from "../types/prdAgent";

const DOCUMENT_TABS: { id: PrdDocumentTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "download", label: "다운로드" },
  { id: "summary", label: "요약" },
  { id: "prd", label: "PRD" },
  { id: "detail", label: "상세" },
  { id: "questions", label: "질문" },
];

const DOWNLOAD_ITEMS: { id: Exclude<PrdDocumentTab, "download">; label: string }[] = [
  { id: "all", label: "전체 문서" },
  { id: "summary", label: "요약본" },
  { id: "prd", label: "PRD" },
  { id: "detail", label: "상세 기획서" },
  { id: "questions", label: "확인 질문" },
];

const PRIORITY_LABELS: Record<FeaturePriority, string> = {
  required: "필수",
  recommended: "추천",
  optional: "선택",
  caution: "주의",
};

const PRIORITY_CLASSES: Record<FeaturePriority, string> = {
  required: "border-[var(--color-accent)]/60 text-[var(--color-text)]",
  recommended: "border-sky-400/40 text-sky-200",
  optional: "border-[var(--color-border)] text-[var(--color-muted)]",
  caution: "border-amber-300/50 text-amber-200",
};

function CheckoutPanel({
  status,
  onStart,
  onComplete,
  onReset,
  onConsultation,
}: {
  status: FakeCheckoutStatus;
  onStart: () => void;
  onComplete: () => void;
  onReset: () => void;
  onConsultation: () => void;
}) {
  if (status === "completed") {
    return (
      <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-surface-2)] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
          <FiCheck className="h-4 w-4 text-[var(--color-accent)]" />
          결제 의사 확인 완료
        </div>
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          현재는 베타 테스트로 실제 결제는 발생하지 않았습니다. 정식 출시 전
          상담이나 우선 안내를 원하시면 아래 버튼을 눌러주세요.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={profile.kakao}
            target="_blank"
            rel="noreferrer noopener"
            onClick={onConsultation}
            className="rounded-lg border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-2 text-center text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
          >
            상담 신청
          </a>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
          >
            다시 보기
          </button>
        </div>
      </div>
    );
  }

  if (status === "started") {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Fake checkout
        </p>
        <h4 className="mt-2 text-sm font-semibold text-[var(--color-text)]">
          전문가 설계서 결제 시뮬레이션
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
          카드번호나 계좌정보는 입력받지 않습니다. 구매 의사 검증을 위한 화면이며
          다음 단계에서 실제 결제 없음 안내가 표시됩니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
          >
            결제 완료
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Expert mode
          </p>
          <h4 className="mt-2 text-sm font-semibold text-[var(--color-text)]">
            전문가 설계서
          </h4>
        </div>
        <p className="text-right text-lg font-bold text-[var(--color-text)]">
          49,000원
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
        기술 스택, DB/API 초안, 동시성 리스크, 결제/예약 안정성 전략까지
        개발자용 문서로 정리합니다.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 w-full rounded-lg border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/15"
      >
        결제하기
      </button>
    </div>
  );
}

export function PrdAgent() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<PrdDocumentTab>("all");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { copied, copy } = useCopyToClipboard();
  const {
    messages,
    features,
    selectedFeatureIds,
    documents,
    missingFields,
    riskAreas,
    expertReason,
    isLoading,
    apiSource,
    fakeCheckoutStatus,
    sendMessage,
    toggleFeature,
    setFakeCheckoutStatus,
  } = usePrdAgent();

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const allDocument = [
    documents.summary,
    documents.prd,
    documents.detail,
    documents.questions,
  ].join("\n\n---\n\n");

  const getDocumentByTab = (tab: Exclude<PrdDocumentTab, "download">) => {
    if (tab === "all") return allDocument;
    return documents[tab];
  };

  const activeDocument =
    activeTab === "download" ? allDocument : getDocumentByTab(activeTab);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextInput = input;
    setInput("");
    await sendMessage(nextInput);
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    if (isLoading || input.trim().length === 0) return;
    event.currentTarget.form?.requestSubmit();
  };

  const downloadMarkdown = (targetTab?: Exclude<PrdDocumentTab, "download">) => {
    const tab = targetTab ?? (activeTab === "download" ? "all" : activeTab);
    const documentText = getDocumentByTab(tab);
    const blob = new Blob([documentText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-prd-${tab}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const createTrackingPayload = () => ({
    selectedFeatures: selectedFeatureIds,
    riskAreas,
    missingFields,
    documentTab: activeTab,
    fakeCheckoutStatus,
    messageCount: messages.length,
  });

  const handleFakeCheckoutStart = () => {
    setFakeCheckoutStatus("started");
    trackPrdAgentEvent({
      eventName: "fake_checkout_started",
      payload: createTrackingPayload(),
    });
  };

  const handleFakeCheckoutComplete = () => {
    setFakeCheckoutStatus("completed");
    trackPrdAgentEvent({
      eventName: "fake_checkout_completed",
      payload: createTrackingPayload(),
    });
  };

  const handleConsultationClick = () => {
    trackPrdAgentEvent({
      eventName: "consultation_requested",
      payload: createTrackingPayload(),
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="무료 기획서 개발의뢰 챗봇 열기"
        className={`fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-50 w-[96px] transition duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:w-[116px] lg:w-[124px] ${
          open ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{
          right: "max(16px, calc((100vw - 64rem) / 2 - 148px))",
        }}
      >
        <img src={ctaButton} alt="" className="h-auto w-full" />
      </button>

      {open && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_-30px_rgba(0,0,0,0.85)] transition-all duration-200 ${
            expanded
              ? "inset-3 max-h-[calc(100dvh-24px)] rounded-2xl lg:inset-x-8 lg:bottom-6 lg:top-6 xl:inset-x-[max(32px,calc((100vw-76rem)/2))]"
              : "inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] max-h-[calc(100dvh-24px)] rounded-2xl sm:inset-x-auto sm:right-6 sm:w-[440px]"
          }`}
          style={{
            right: expanded
              ? undefined
              : "max(24px, calc((100vw - 64rem) / 2 - 148px))",
          }}
        >
          <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/70 p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                AI PRD Agent
              </p>
              <h3 className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                무료 기획서부터 개발의뢰까지
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {apiSource === "mock"
                  ? "목업 응답으로 동작 중입니다."
                  : "Netlify Function 응답으로 동작 중입니다."}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-label={expanded ? "챗봇 작게 보기" : "챗봇 크게 보기"}
                title={expanded ? "작게 보기" : "크게 보기"}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
              >
                {expanded ? (
                  <FiMinimize2 className="h-4 w-4" />
                ) : (
                  <FiMaximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="챗봇 닫기"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            className={`min-h-0 flex-1 ${
              expanded ? "grid grid-cols-1 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.35fr)]" : "flex flex-col"
            }`}
          >
            <section className="flex min-h-0 flex-col border-[var(--color-border)] lg:border-r">
              <div
                ref={scrollRef}
                className={`min-h-0 flex-1 overflow-y-auto p-4 ${
                  expanded ? "lg:p-5" : ""
                }`}
              >
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] whitespace-pre-line rounded-2xl border px-3 py-2 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-text)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-xs text-[var(--color-muted)]">
                      기획서를 정리하고 있습니다...
                    </div>
                  )}
                </div>

                {features.length > 0 && (
                  <section className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-3">
                    <p className="mb-3 text-xs font-semibold text-[var(--color-text)]">
                      추천 기능 선택
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature) => {
                        const selected = selectedFeatureIds.includes(feature.id);
                        return (
                          <button
                            key={feature.id}
                            type="button"
                            onClick={() => toggleFeature(feature.id)}
                            className={`rounded-full border px-3 py-1.5 text-left text-[11px] transition ${
                              selected
                                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text)]"
                                : PRIORITY_CLASSES[feature.priority]
                            }`}
                            title={feature.description}
                          >
                            {feature.label}
                            <span className="ml-1 text-[10px] opacity-70">
                              {PRIORITY_LABELS[feature.priority]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/70 p-3"
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  rows={1}
                  placeholder="예: 펜션 예약 사이트 만들고 싶어요"
                  className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
                />
                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  aria-label="메시지 보내기"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-text)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </form>
            </section>

            <section className="min-h-0 overflow-y-auto p-4 lg:p-5">
              <div className={expanded ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]" : "space-y-5"}>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {DOCUMENT_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`rounded-md px-2.5 py-1 text-xs transition ${
                            activeTab === tab.id
                              ? "bg-[var(--color-accent)]/15 text-[var(--color-text)]"
                              : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy(activeDocument)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
                      >
                        {copied ? (
                          <FiCheck className="h-3.5 w-3.5" />
                        ) : (
                          <FiCopy className="h-3.5 w-3.5" />
                        )}
                        {copied ? "복사됨" : "복사"}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadMarkdown()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
                      >
                        <FiDownload className="h-3.5 w-3.5" />
                        다운로드
                      </button>
                    </div>
                  </div>
                  <div
                    className={`overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 ${
                      expanded ? "max-h-[calc(100dvh-190px)] lg:p-5" : "max-h-64"
                    }`}
                  >
                    {activeTab === "download" ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {DOWNLOAD_ITEMS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => downloadMarkdown(item.id)}
                            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-left transition hover:border-[var(--color-accent)]"
                          >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] transition group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]">
                              <FiDownload className="h-4 w-4" />
                            </span>
                            <span className="mt-3 block text-sm font-semibold text-[var(--color-text)]">
                              {item.label}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)]">
                              Markdown 파일로 저장합니다.
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Markdown source={activeDocument} />
                    )}
                  </div>
                </div>

                {(missingFields.length > 0 || riskAreas.length > 0 || expertReason) && (
                  <div className="space-y-3">
                    {missingFields.length > 0 && (
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-3">
                        <p className="text-xs font-semibold text-[var(--color-text)]">
                          아직 확인하면 좋은 항목
                        </p>
                        <p className="mt-2 text-xs text-[var(--color-muted)]">
                          {missingFields.join(" · ")}
                        </p>
                      </div>
                    )}
                    {riskAreas.length > 0 && (
                      <div className="rounded-2xl border border-amber-300/30 bg-amber-300/5 p-3">
                        <p className="text-xs font-semibold text-amber-100">
                          전문가 검토 추천
                        </p>
                        <p className="mt-2 text-xs text-amber-100/70">
                          {riskAreas.join(" · ")}
                        </p>
                      </div>
                    )}
                    <CheckoutPanel
                      status={fakeCheckoutStatus}
                      onStart={handleFakeCheckoutStart}
                      onComplete={handleFakeCheckoutComplete}
                      onReset={() => setFakeCheckoutStatus("idle")}
                      onConsultation={handleConsultationClick}
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
