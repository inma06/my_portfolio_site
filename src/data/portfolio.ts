import aiChatBrief from "../../docs/portfolio_brief.md?raw";
import aiChatDetail from "../../docs/portfolio_detail.md?raw";
import sajuBrief from "../../docs/사주_포트폴리오_간략버전.md?raw";
import sajuDetail from "../../docs/사주_포트폴리오_디테일버전.md?raw";

export type StackCategory = "Backend" | "Mobile" | "Infra" | "Tooling";

export interface TechItem {
  name: string;
  description?: string;
}

export interface StackGroup {
  category: StackCategory;
  label: string;
  description: string;
  items: TechItem[];
}

export type ProjectLinkKind = "appstore" | "playstore" | "github" | "website";

export interface ProjectLink {
  kind: ProjectLinkKind;
  url: string;
  label?: string;
}

export interface Project {
  name: string;
  period?: string;
  role?: string;
  description: string;
  highlights?: string[];
  tech: string[];
  links: ProjectLink[];
  brief?: string;
  detail?: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  github: string;
}

export const profile: Profile = {
  name: "Bongho Pak",
  title: "Backend & Mobile Engineer",
  tagline:
    "NestJS · Node.js 백엔드와 Flutter 앱을 함께 만드는 풀스택 개발자입니다.",
  email: "leo0832010@gmail.com",
  github: "https://github.com/inma06",
};

export const stacks: StackGroup[] = [
  {
    category: "Backend",
    label: "Backend",
    description: "API 서버, 도메인 모델링, 인증/결제 등 비즈니스 코어 구현",
    items: [
      { name: "NestJS" },
      { name: "Node.js" },
      { name: "Express" },
      { name: "TypeScript" },
      { name: "PostgreSQL" },
      { name: "MySQL" },
      { name: "Redis" },
      { name: "TypeORM / Sequelize" },
      { name: "BullMQ" },
    ],
  },
  {
    category: "Mobile",
    label: "Mobile & Web",
    description: "Flutter 앱과 React 웹을 단일 코드베이스로 출시·운영",
    items: [
      { name: "Flutter" },
      { name: "Dart" },
      { name: "Riverpod" },
      { name: "React 19" },
      { name: "Vite" },
      { name: "Zustand" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    category: "Infra",
    label: "Infra & Cloud",
    description: "AWS 기반 배포와 운영, SSE / 결제 / 푸시 트래픽 처리",
    items: [
      { name: "AWS EC2" },
      { name: "S3 · CloudFront" },
      { name: "Nginx (SSE 튜닝)" },
      { name: "PM2" },
      { name: "Docker" },
      { name: "GitHub Actions" },
    ],
  },
  {
    category: "Tooling",
    label: "AI · Analytics",
    description: "멀티 LLM 라우팅과 데이터 파이프라인",
    items: [
      { name: "OpenAI · Gemini · Anthropic" },
      { name: "Grok · DeepSeek · OpenRouter" },
      { name: "Mixpanel" },
      { name: "Meta SDK" },
      { name: "Firebase / GA4" },
      { name: "OneSignal" },
    ],
  },
];

export const projects: Project[] = [
  {
    name: "AI 캐릭터 채팅 서비스",
    period: "2026.02 — 2026.05 (3.5개월)",
    role: "풀스택 단독 (Backend · Mobile · Web · Infra · Data)",
    description:
      "AI 캐릭터와 롤플레이 대화를 나누는 iOS · Android · Web 3-플랫폼 서비스. NestJS 백엔드 · Flutter 앱 · React 웹 · AWS 인프라 · 데이터 파이프라인까지 단독 개발·운영 중.",
    highlights: [
      "AI 비용 약 7배 절감 (실측 35원 → 5원대/턴), grok-nothink-apr11 프리셋 운영",
      "채팅 응답 시간 10배+ 단축 (40초대 → 3~4초대), SSE + BullMQ 비동기 분리",
      "Mixpanel / Meta / Firebase / OneSignal 4종 SDK 단일 진입점 fan-out, iOS SKAN 152개 등록",
      "약 100,000줄 · 커밋 1,181건 · NestJS 도메인 모듈 30개 · DB 엔티티 24개",
    ],
    tech: [
      "NestJS",
      "Fastify",
      "TypeScript",
      "PostgreSQL",
      "Redis",
      "BullMQ",
      "Flutter",
      "Riverpod",
      "React 19",
      "AWS EC2",
      "OpenRouter / Grok",
    ],
    links: [],
    brief: aiChatBrief,
    detail: aiChatDetail,
  },
  {
    name: "사주사이트",
    period: "2026.02 — 2026.05 (3.5개월)",
    role: "백엔드 · 풀스택 단독",
    description:
      "Node.js · Express 기반 사주 리포트 결제·발급 서비스. 토스페이먼츠 v2 전환, GPT 리포트 파이프라인, 관리자 백오피스, 사주 계산 엔진까지 단독 개발 (약 170 커밋).",
    highlights: [
      "토스페이먼츠 v1 → v2 전환 + 멱등성 기반 중복 결제·미발급 가드",
      "신년사주 · 재회사주 신규 상품 풀스택 출시 (랜딩 → 미리보기 → 결제 → 리포트)",
      "슈퍼어드민 권한 분리 + GPT_LOG · SMS msg_id 추적 인프라 구축",
      "절기 · 진태양시 · 서머타임 · 대운수 등 사주 엔진 경계 버그 일소",
    ],
    tech: [
      "Node.js",
      "Express",
      "NestJS",
      "Sequelize",
      "MySQL",
      "Toss Payments v2",
      "OpenAI GPT",
      "Aligo SMS",
      "PM2",
      "Jest",
      "Playwright",
    ],
    links: [],
    brief: sajuBrief,
    detail: sajuDetail,
  },
];
