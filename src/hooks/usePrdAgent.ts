import { useMemo, useState } from "react";
import { requestPrdAgent } from "../lib/prdAgentApi";
import type {
  FakeCheckoutStatus,
  GeneratedDocuments,
  PrdAgentState,
  PrdMessage,
  SuggestedFeature,
} from "../types/prdAgent";

const INITIAL_DOCUMENTS: GeneratedDocuments = {
  summary: "# 상담용 요약본\n\n아이디어를 입력하면 자동으로 정리됩니다.",
  prd: "# PRD 초안\n\n대화를 시작하면 PRD가 생성됩니다.",
  detail: "# 상세 기획서 초안\n\n선택한 기능을 바탕으로 화면과 흐름을 정리합니다.",
  questions: "# 확인 질문\n\n개발 전 확인할 질문이 여기에 쌓입니다.",
};

const INITIAL_ASSISTANT_MESSAGE: PrdMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "어떤 사이트나 서비스를 만들고 싶으신가요? 예약 사이트, 쇼핑몰처럼 짧게 적어주셔도 괜찮아요.",
};

const COMPLETION_MESSAGE =
  "무료 기획서가 완성되었습니다. 지금 단계만으로도 개발 상담을 시작할 수 있는 초안이 준비됐어요.";

const COMPLETION_CTA =
  "전문가 리뷰로 기능 누락, 예산 리스크, 동시성 이슈까지 더 꼼꼼하게 점검해보세요.";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePrdAgent() {
  const [messages, setMessages] = useState<PrdMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [features, setFeatures] = useState<SuggestedFeature[]>([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocuments>(INITIAL_DOCUMENTS);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [riskAreas, setRiskAreas] = useState<string[]>([]);
  const [expertReason, setExpertReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiSource, setApiSource] = useState<"netlify" | "mock">("mock");
  const [fakeCheckoutStatus, setFakeCheckoutStatus] =
    useState<FakeCheckoutStatus>("idle");

  const selectedFeatures = useMemo(
    () => features.filter((feature) => selectedFeatureIds.includes(feature.id)),
    [features, selectedFeatureIds],
  );

  const state: PrdAgentState = {
    selectedFeatureIds,
    missingFields,
    riskAreas,
    pricingIntent:
      fakeCheckoutStatus === "completed"
        ? "checkout_completed"
        : fakeCheckoutStatus === "started"
          ? "checkout_started"
          : "none",
    fakeCheckoutStatus,
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: PrdMessage = {
      id: createId("user"),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    const { response, source } = await requestPrdAgent({
      messages: nextMessages,
      state,
      selectedFeatures,
    });

    setApiSource(source);
    setFeatures(response.suggestedFeatures);
    setMissingFields(response.missingFields);
    setRiskAreas(response.riskAreas);
    setDocuments(response.documentDraft);
    setExpertReason(response.expertModeRecommendation.reason);

    setMessages((current) => [
      ...current,
      {
        id: createId("assistant"),
        role: "assistant",
        content: response.completion.isComplete
          ? `${COMPLETION_MESSAGE}\n\n${COMPLETION_CTA}\n\n수정하고 싶은 곳이 있으면 편하게 말씀해주세요.`
          : `${response.assistantMessage}\n\n${response.nextQuestion}`,
      },
    ]);
    setIsLoading(false);
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds((current) =>
      current.includes(featureId)
        ? current.filter((id) => id !== featureId)
        : [...current, featureId],
    );
  };

  const markPriceViewed = () => {
    setFakeCheckoutStatus((current) => (current === "idle" ? "idle" : current));
  };

  return {
    messages,
    features,
    selectedFeatureIds,
    selectedFeatures,
    documents,
    missingFields,
    riskAreas,
    expertReason,
    isLoading,
    apiSource,
    fakeCheckoutStatus,
    sendMessage,
    toggleFeature,
    markPriceViewed,
    setFakeCheckoutStatus,
  };
}
