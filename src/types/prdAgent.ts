export type PrdMessageRole = "assistant" | "user";

export type PrdDocumentTab =
  | "all"
  | "download"
  | "summary"
  | "prd"
  | "detail"
  | "questions";

export type FeaturePriority = "required" | "recommended" | "optional" | "caution";

export type FakeCheckoutStatus = "idle" | "started" | "completed";

export interface PrdMessage {
  id: string;
  role: PrdMessageRole;
  content: string;
}

export interface SuggestedFeature {
  id: string;
  label: string;
  description: string;
  priority: FeaturePriority;
}

export interface PrdAgentState {
  projectType?: string;
  businessSummary?: string;
  selectedFeatureIds: string[];
  missingFields: string[];
  riskAreas: string[];
  pricingIntent: "none" | "viewed" | "checkout_started" | "checkout_completed";
  fakeCheckoutStatus: FakeCheckoutStatus;
}

export interface GeneratedDocuments {
  summary: string;
  prd: string;
  detail: string;
  questions: string;
}

export interface ExpertModeRecommendation {
  recommended: boolean;
  reason: string;
}

export interface CompletionState {
  isComplete: boolean;
  message: string;
  ctaText: string;
}

export interface PrdAgentRequest {
  messages: PrdMessage[];
  state: PrdAgentState;
  selectedFeatures: SuggestedFeature[];
}

export interface PrdAgentResponse {
  assistantMessage: string;
  nextQuestion: string;
  suggestedFeatures: SuggestedFeature[];
  missingFields: string[];
  riskAreas: string[];
  documentDraft: GeneratedDocuments;
  expertModeRecommendation: ExpertModeRecommendation;
  completion: CompletionState;
}
