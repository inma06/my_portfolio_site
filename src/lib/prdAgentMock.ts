import type {
  GeneratedDocuments,
  PrdAgentRequest,
  PrdAgentResponse,
  SuggestedFeature,
} from "../types/prdAgent";

const FEATURE_PRESETS: Record<string, SuggestedFeature[]> = {
  booking: [
    {
      id: "booking-items",
      label: "서비스/객실 목록",
      description: "예약 가능한 상품을 목록과 상세 화면으로 보여줍니다.",
      priority: "required",
    },
    {
      id: "booking-calendar",
      label: "예약 달력",
      description: "날짜와 시간별 예약 가능 여부를 표시합니다.",
      priority: "required",
    },
    {
      id: "booking-approval",
      label: "예약 승인/취소",
      description: "관리자가 예약을 확인하고 상태를 변경합니다.",
      priority: "recommended",
    },
    {
      id: "booking-payment",
      label: "결제 연동",
      description: "예약금이나 전체 금액을 결제받습니다.",
      priority: "caution",
    },
    {
      id: "booking-alert",
      label: "알림 발송",
      description: "예약 확정, 취소, 리마인드 메시지를 보냅니다.",
      priority: "recommended",
    },
  ],
  commerce: [
    {
      id: "commerce-products",
      label: "상품 목록/상세",
      description: "상품을 탐색하고 구매 정보를 확인합니다.",
      priority: "required",
    },
    {
      id: "commerce-cart",
      label: "장바구니",
      description: "여러 상품을 담고 한 번에 주문합니다.",
      priority: "recommended",
    },
    {
      id: "commerce-payment",
      label: "주문/결제",
      description: "주문 생성과 결제 완료 흐름을 제공합니다.",
      priority: "required",
    },
    {
      id: "commerce-stock",
      label: "재고 관리",
      description: "옵션별 재고와 품절 상태를 관리합니다.",
      priority: "caution",
    },
    {
      id: "commerce-review",
      label: "리뷰/문의",
      description: "구매 전환과 신뢰도를 높이는 고객 피드백 영역입니다.",
      priority: "optional",
    },
  ],
  default: [
    {
      id: "site-home",
      label: "메인 페이지",
      description: "서비스의 첫인상과 핵심 가치를 전달합니다.",
      priority: "required",
    },
    {
      id: "site-contact",
      label: "문의 폼",
      description: "방문자가 상담이나 견적 문의를 남깁니다.",
      priority: "required",
    },
    {
      id: "site-admin",
      label: "관리자 기능",
      description: "콘텐츠나 문의 내역을 관리합니다.",
      priority: "recommended",
    },
    {
      id: "site-analytics",
      label: "방문 분석",
      description: "유입과 전환 데이터를 확인합니다.",
      priority: "optional",
    },
  ],
};

function detectProjectType(text: string) {
  if (/예약|펜션|병원|숙소|강의|클래스|좌석/.test(text)) {
    return "booking";
  }
  if (/쇼핑|몰|커머스|상품|판매|스토어|재고/.test(text)) {
    return "commerce";
  }
  return "default";
}

function getProjectLabel(projectType: string) {
  if (projectType === "booking") return "예약 사이트";
  if (projectType === "commerce") return "쇼핑몰";
  return "웹사이트";
}

function priorityLabel(priority: SuggestedFeature["priority"]) {
  const labels = {
    required: "필수",
    recommended: "추천",
    optional: "선택",
    caution: "주의",
  };
  return labels[priority];
}

function isCompletionIntent(text: string) {
  return /^(없어|없음|괜찮|네|응|준비|완료|좋아|이대로|충분)/.test(
    text.trim(),
  );
}

function buildDocuments(
  projectLabel: string,
  userSummary: string,
  features: SuggestedFeature[],
): GeneratedDocuments {
  const featureLines = features.length
    ? features
        .map((feature) => `- ${feature.label}: ${feature.description}`)
        .join("\n")
    : "- 메인 페이지\n- 문의 폼\n- 관리자 확인 기능";

  const risks = features
    .filter((feature) => feature.priority === "caution")
    .map((feature) => `- ${feature.label}: 동시성, 결제 실패, 운영 예외 처리가 필요합니다.`)
    .join("\n");

  return {
    summary: `# 상담용 요약본

- 사이트 유형: ${projectLabel}
- 초기 설명: ${userSummary || "사용자 입력 기반으로 정리 예정"}
- 핵심 기능: ${features.map((feature) => feature.label).join(", ") || "기본 기능"}
- 상담 포인트: MVP 범위, 예산, 일정, 관리자 기능을 먼저 확정합니다.`,
    prd: `# PRD 초안

## 프로젝트 개요

${userSummary || `${projectLabel}를 만들기 위한 초기 기획입니다.`}

## 목표

- 비개발자 의뢰 내용을 개발 가능한 요구사항으로 정리
- MVP 출시 범위와 추후 확장 범위 분리
- 상담과 견적 산정에 필요한 기능 기준 마련

## 기능 요구사항

${featureLines}

## 기술 리스크

${risks || "- 현재 선택 기능 기준으로 큰 기술 리스크는 낮습니다."}

## MVP 제외 범위

- 로그인 기반 문서 저장
- 실제 결제 기반 전문가 모드
- 복잡한 관리자 대시보드`,
    detail: `# 상세 기획서 초안

## 예상 화면

- 메인
- 기능/상품 상세
- 신청 또는 문의
- 완료 화면
- 관리자 확인 화면

## 사용자 흐름

1. 방문자가 사이트에 진입합니다.
2. 핵심 정보를 확인합니다.
3. 필요한 기능을 선택하거나 신청합니다.
4. 완료 안내를 확인합니다.
5. 관리자는 접수 내용을 확인하고 후속 조치를 진행합니다.

## 페이지별 구성

${featureLines}`,
    questions: `# 개발 전 확인 질문

- 예산 범위는 어느 정도인가요?
- 희망 오픈 일정이 있나요?
- 관리자가 직접 수정해야 하는 정보는 무엇인가요?
- 알림, 결제, 로그인 같은 외부 연동이 필요한가요?
- 처음 버전에서 꼭 필요한 기능 3가지는 무엇인가요?`,
  };
}

export function createMockPrdAgentResponse(
  request: PrdAgentRequest,
): PrdAgentResponse {
  const lastUserMessage = [...request.messages]
    .reverse()
    .find((message) => message.role === "user");
  const rawText = lastUserMessage?.content ?? "";
  const projectType = detectProjectType(rawText);
  const projectLabel = getProjectLabel(projectType);
  const suggestedFeatures = FEATURE_PRESETS[projectType];
  const selectedFeatures =
    request.selectedFeatures.length > 0
      ? request.selectedFeatures
      : suggestedFeatures.filter((feature) => feature.priority !== "optional");
  const documents = buildDocuments(projectLabel, rawText, selectedFeatures);
  const featureSummary = suggestedFeatures
    .map((feature) => `- ${feature.label} (${priorityLabel(feature.priority)})`)
    .join("\n");

  return {
    assistantMessage: `${projectLabel} 방향으로 이해했습니다. 보통 아래 기능들이 많이 들어가요.\n\n${featureSummary}\n\n필요한 기능을 골라주시면 PRD와 상세 기획서를 바로 다듬어드릴게요.`,
    nextQuestion:
      "이 중에서 꼭 필요한 기능을 선택하거나, 추가로 원하는 기능을 한 줄로 적어주세요.",
    suggestedFeatures,
    missingFields: ["예산 범위", "희망 일정", "관리자 기능", "참고 사이트"],
    riskAreas: selectedFeatures
      .filter((feature) => feature.priority === "caution")
      .map((feature) => feature.label),
    documentDraft: documents,
    expertModeRecommendation: {
      recommended: selectedFeatures.some((feature) => feature.priority === "caution"),
      reason:
        "예약/결제/재고처럼 동시에 여러 사용자가 같은 자원에 접근하는 기능은 전문가 모드에서 기술 설계를 구체화하는 편이 좋습니다.",
    },
    completion: {
      isComplete: isCompletionIntent(rawText),
      message:
        "무료 기획서가 완성되었습니다. 지금 단계만으로도 개발 상담을 시작할 수 있는 초안이 준비됐어요.",
      ctaText:
        "전문가 리뷰로 기능 누락, 예산 리스크, 동시성 이슈까지 더 꼼꼼하게 점검해보세요.",
    },
  };
}
