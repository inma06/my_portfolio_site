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
  email: "shared@lowtone.kr",
  github: "https://github.com/your-handle",
};

export const stacks: StackGroup[] = [
  {
    category: "Backend",
    label: "Backend",
    description: "API 서버, 도메인 모델링, 인증/결제 등 비즈니스 코어 구현",
    items: [
      { name: "NestJS" },
      { name: "Node.js" },
      { name: "TypeScript" },
      { name: "PostgreSQL" },
      { name: "Redis" },
      { name: "Prisma / TypeORM" },
    ],
  },
  {
    category: "Mobile",
    label: "Mobile",
    description: "Flutter 단일 코드베이스로 iOS / Android 앱 출시",
    items: [
      { name: "Flutter" },
      { name: "Dart" },
      { name: "Riverpod" },
      { name: "Firebase" },
      { name: "Fastlane" },
    ],
  },
  {
    category: "Infra",
    label: "Infra & Cloud",
    description: "AWS 기반 배포 및 운영, 컨테이너 오케스트레이션",
    items: [
      { name: "AWS (EC2 · ECS · RDS · S3)" },
      { name: "Docker" },
      { name: "GitHub Actions" },
      { name: "Nginx" },
    ],
  },
  {
    category: "Tooling",
    label: "Tooling",
    description: "협업·품질 향상을 위한 도구",
    items: [
      { name: "Git" },
      { name: "Sentry" },
      { name: "Notion" },
      { name: "Figma" },
    ],
  },
];

export const projects: Project[] = [
  {
    name: "Sample Service",
    period: "2025.01 — 진행 중",
    role: "Backend / Mobile",
    description:
      "NestJS API와 Flutter 앱을 함께 개발한 서비스 예시입니다. 카드 내용은 src/data/portfolio.ts 에서 수정하세요.",
    highlights: [
      "도메인 주도 설계 기반 NestJS 모듈 구성",
      "Flutter 단일 코드베이스로 iOS / Android 동시 출시",
      "AWS ECS 위에 무중단 배포 파이프라인 구축",
    ],
    tech: ["NestJS", "PostgreSQL", "Flutter", "Riverpod", "AWS ECS"],
    links: [
      {
        kind: "appstore",
        url: "https://apps.apple.com/app/idXXXXXXXXX",
      },
      {
        kind: "playstore",
        url: "https://play.google.com/store/apps/details?id=com.example",
      },
      {
        kind: "github",
        url: "https://github.com/your-handle/sample-service",
      },
    ],
  },
  {
    name: "Internal Admin Tool",
    period: "2024.08 — 2024.12",
    role: "Backend",
    description:
      "운영팀이 사용하는 어드민 도구. 권한 분리와 감사 로그를 중점적으로 설계했습니다.",
    highlights: [
      "RBAC 기반 권한 체계 도입",
      "주요 액션에 대한 감사 로그/알림 연동",
    ],
    tech: ["NestJS", "Prisma", "PostgreSQL", "AWS"],
    links: [
      {
        kind: "github",
        url: "https://github.com/your-handle/internal-admin",
      },
    ],
  },
];
