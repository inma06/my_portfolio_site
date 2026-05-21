import aiChatBrief from "../../docs/portfolio_brief.md?raw";
import aiChatDetail from "../../docs/portfolio_detail.md?raw";
import sajuBrief from "../../docs/사주_포트폴리오_간략버전.md?raw";
import sajuDetail from "../../docs/사주_포트폴리오_디테일버전.md?raw";
import limeBrief from "../../docs/라임프렌즈_포트폴리오_간략버전.md?raw";
import limeDetail from "../../docs/라임프렌즈_포트폴리오_디테일버전.md?raw";
import milkBrief from "../../docs/밀크코퍼레이션_포트폴리오_간략버전.md?raw";
import milkDetail from "../../docs/밀크코퍼레이션_포트폴리오_디테일버전.md?raw";

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

export type BadgeKind =
  | "backend"
  | "web"
  | "app"
  | "ios"
  | "aos"
  | "flutter";

export interface Badge {
  kind: BadgeKind;
  framework?: string;
}

export interface Project {
  name: string;
  slug: string;
  period?: string;
  role?: string;
  description: string;
  highlights?: string[];
  tech: string[];
  badges?: Badge[];
  links: ProjectLink[];
  screenshots?: string[];
  brief?: string;
  detail?: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  github: string;
  kakao: string;
}

export const profile: Profile = {
  name: "박봉호(Leo)",
  title: "Backend & Mobile Engineer",
  tagline:
    "백엔드 · 프론트엔드 · Flutter 앱을 함께 만드는 풀스택 개발자입니다.",
  email: "leo0832010@gmail.com",
  phone: "+8210.4152.9841",
  github: "https://github.com/inma06",
  kakao: "https://open.kakao.com/o/smU86Wvi",
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
    slug: "ai-chat",
    period: "2026.02 — 2026.05 (3.5개월)",
    role: "풀스택 단독 (Backend · Mobile · Web · Infra · Data)",
    description:
      "AI 캐릭터와 롤플레이 대화를 나누는 iOS · Android · Web 3-플랫폼 서비스. NestJS 백엔드 · Flutter 앱 · React 웹 · AWS 인프라 · 데이터 파이프라인까지 단독 개발·운영 중.",
    badges: [
      { kind: "backend", framework: "NestJS" },
      { kind: "web", framework: "React" },
      { kind: "app", framework: "Flutter" },
      { kind: "ios" },
      { kind: "aos" },
      { kind: "flutter" },
    ],
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
    links: [
      {
        kind: "appstore",
        url: "https://apps.apple.com/kr/app/%EB%94%94%ED%8D%BC-deeper-ai-%EC%BA%90%EB%A6%AD%ED%84%B0%EC%99%80-%EB%8D%94-%EA%B9%8A%EC%9D%80-%EB%8C%80%ED%99%94/id6761097402",
      },
      {
        kind: "playstore",
        url: "https://play.google.com/store/apps/details?id=kr.lowtone.aichat&hl=ko",
      },
    ],
    screenshots: ["01.png", "02.png", "03.png", "04.png", "05.png"],
    brief: aiChatBrief,
    detail: aiChatDetail,
  },
  {
    name: "사주 서비스",
    slug: "saju",
    period: "2026.02 — 2026.05 (3.5개월)",
    role: "백엔드 · 풀스택 단독",
    description:
      "Node.js · Express 기반 사주 리포트 결제·발급 서비스. 토스페이먼츠 v2 전환, GPT 리포트 파이프라인, 관리자 백오피스, 사주 계산 엔진까지 단독 개발 (약 170 커밋).",
    badges: [
      { kind: "backend", framework: "Express / NestJS" },
      { kind: "web", framework: "EJS" },
    ],
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
    links: [
      { kind: "website", url: "https://saju-maeul.kr/saju", label: "사주마을" },
      { kind: "website", url: "https://unsaeline.store/saju", label: "지금운세" },
      {
        kind: "website",
        url: "https://myunguncheop.store/saju",
        label: "운세라운지",
      },
      { kind: "website", url: "https://www.sajulog.store/saju", label: "사주로그" },
      {
        kind: "website",
        url: "https://unse-jeojangso.kr/saju",
        label: "운세저장소",
      },
    ],
    screenshots: ["01.png", "02.png"],
    brief: sajuBrief,
    detail: sajuDetail,
  },
  {
    name: "SNS 감사 일기",
    slug: "sns-gratitude",
    period: "2022.05 — 2023.01",
    role: "Flutter 앱 단독",
    description:
      "일상의 감사를 카드와 짧은 글로 표현하는 감성 SNS Flutter 앱. iOS · Android 동시 운영. CI/CD 정비, 백엔드 마이그레이션 대응, 스토어 심사 대응까지 전반을 책임짐.",
    badges: [
      { kind: "app", framework: "Flutter" },
      { kind: "ios" },
      { kind: "aos" },
      { kind: "flutter" },
    ],
    highlights: [
      "Flavor + Fastlane 기반 CI/CD 정비로 빌드 · QA 사이클 단축",
      "BLoC + DDD + Layered Architecture 로 장기 운영 가능한 구조 정착",
      "백엔드 Firestore → AWS Lambda + PostgreSQL 전환에 맞춰 클라이언트 데이터 레이어 재구성",
      "Google UGC 정책 반려 대응 + 아임포트 선물하기 결제 흐름 구축",
    ],
    tech: [
      "Flutter",
      "Dart",
      "BLoC",
      "DDD",
      "Layered Architecture",
      "Firebase",
      "AWS Lambda",
      "PostgreSQL",
      "Fastlane",
      "Flavor",
      "아임포트",
    ],
    links: [],
    brief: limeBrief,
    detail: limeDetail,
  },
  {
    name: "유아동복 쇼핑몰",
    slug: "kids-shop",
    period: "2021.07 — 2022.04 (10개월)",
    role: "Flutter 앱 프론트엔드 단독",
    description:
      "유아동복 쇼핑몰 모바일 앱 프론트엔드 전반을 단독 담당. 초기 셋업부터 1.3.0 정식 출시까지 약 10개월간 iOS · Android 동시 운영.",
    badges: [
      { kind: "app", framework: "Flutter" },
      { kind: "ios" },
      { kind: "aos" },
      { kind: "flutter" },
    ],
    highlights: [
      "GetX 기반 상태관리 + 중복 라우팅 · 중복 push 방지 규칙 정착",
      "Firebase Auth · FCM · Crashlytics 통합으로 운영 안정화",
      "아임포트 결제 + 에어브릿지(AB108) 어트리뷰션 SDK 연동",
      "서버 설정만으로 즉시 켤 수 있는 권장 / 강제 업데이트 게이트 도입",
    ],
    tech: [
      "Flutter",
      "Dart",
      "GetX",
      "Firebase",
      "FCM",
      "Crashlytics",
      "아임포트",
      "에어브릿지",
    ],
    links: [
      {
        kind: "appstore",
        url: "https://apps.apple.com/kr/app/%ED%82%A4%EC%A6%88%EB%8B%9D/id1599682755",
      },
      {
        kind: "playstore",
        url: "https://play.google.com/store/apps/details?id=kr.milkcorp.kidsning&hl=ko",
      },
    ],
    screenshots: ["01.png", "02.png", "03.png", "04.png"],
    brief: milkBrief,
    detail: milkDetail,
  },
];
