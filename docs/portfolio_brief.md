# 포트폴리오 한 장 요약 — AI 캐릭터 채팅 서비스

## 무엇을 만들었나

AI 캐릭터와 롤플레이 대화를 나누는 **iOS · Android · Web 3-플랫폼 서비스를 단독으로 풀스택 개발**.
백엔드(NestJS)부터 모바일 앱(Flutter), 웹(React), 인프라(AWS/Nginx), 데이터 파이프라인까지 한 명이 책임지고 출시·운영 중.

---

## 임팩트 3가지 (모두 git 로그·코드로 검증 가능)

### 💰 AI 비용 7배 절감 — 월 약 2.7억 원 절감 가능 (실측 기준)
- 메인 LLM 비용을 **턴당 35원 → 5원대 (운영 실측, 약 86% 절감)** 으로 낮춤
- 단순 모델 교체가 아니라 **scene/atmosphere/final 3단 파이프라인 재설계** + 단계별 reasoning OFF 의 누적 결과
- 운영 중인 프리셋: `grok-nothink-apr11`
- 핵심 의사결정 커밋: [`5b6ff58`](.) "최종 응답 모델을 Grok 4.1 Fast로 전환 (비용 31원→2.4원), 9캐릭터 78% B등급 이상 검증"
- 일일 활성 1만 명 × 30턴/일 기준 **월 약 3.15억 → 0.45억** 으로 손익 분기점을 바꾼 의사결정

### ⚡ 채팅 응답 속도 10배 이상 단축 — 40초대 → 3~4초대 (실측 기준)
- 초기에는 본문 모델 한 호출이 **337자 응답에 67초 침묵** 하던 사례까지 있었음 (커밋 [`5fb20a2`](.), [`5035722`](.))
- 단계별 진단 + 모델 교체 + reasoning OFF + 파이프라인 병렬화로 **현재 운영 평균 3~4초대 응답**
- "왜 느린지" 진단부터 시작해 **모델 / 프롬프트 / 네트워크 / 렌더 4개 레이어 전체** 정량 측정 후 개선
- 분위기 가이드 단계만 떼어내 측정하면 **4.66s → 0.69s (6.7배)**, 전체 응답은 **40초대 → 3~4초대 (10배+)**
- 모든 벤치마크 수치를 commit 메시지에 기록 — 검증 가능한 의사결정

### 📊 데이터·애널리틱스 인프라 단독 구축
- Mixpanel · Meta · Firebase/GA4 · OneSignal **4종 SDK 를 단일 진입점에서 fan-out**
- 11개 이벤트 + 10개 User Property 택소노미 + **iOS SKAN 152개 광고 네트워크 등록**
- 마케팅 가설("광고 한도 2번+ 도달 → 7일 내 결제 전환") 을 **검증 가능하게 만든 데이터 파이프라인** 직접 설계

---

## 한눈에 보는 규모

| | |
|---|---|
| 개발 기간 | **3.5개월** (2026-02 ~ 2026-05) |
| 총 커밋 | **1,181건** |
| 총 코드 | 약 **100,000줄** (Backend 36.6K · Web 20.3K · App 44.0K) |
| 도메인 모듈 | NestJS **30개** (auth · chat · billing · memory · iap · notification 외) |
| DB 엔티티 | **24개** |
| 지원 AI 모델 | **20+ 개** (OpenAI · Gemini · Anthropic · Grok · DeepSeek) |
| 출시 플랫폼 | **iOS · Android · Web** (실서비스 운영 중) |

---

## 채용 담당자 관점에서 매력적인 이유 5가지

1. **혼자서 처음부터 끝까지 책임짐** — 백엔드 · 모바일 · 웹 · 인프라 · CI/CD · 데이터 인프라까지. 입사 첫날부터 어느 영역에 투입해도 즉시 일 가능
2. **돈으로 환산되는 의사결정 경험** — "이 모델 쓸까 저거 쓸까" 가 아니라 "월 약 2.7억의 비용 차이를 만드는 파이프라인 설계" 까지 직접 한 사람 (실측 35원 → 5원대)
3. **앱스토어 심사 통과 경험** — Apple Guideline 1.2 대응, Apple 영수증 로컬 검증, Android 결제 누락 보정 등 실제 출시·운영 사고 경험 보유
4. **운영 사고를 미리 막는 설계 감각** — 비관적 잠금, 멱등성 키, FIFO 차감, 자동 환불 등 "결제 두 번 되면 어떡하지?" 같은 시나리오를 코드 단계에서 차단
5. **문서·검증을 남기며 일함** — 분석 가이드를 마케터에게 인수인계 가능한 형태로 작성, 모든 성능 개선은 벤치마크 수치와 함께 commit. **혼자서도 팀처럼 일하는 사람**

---

## 사용 가능 기술 스택

**Backend** NestJS · Fastify · TypeScript · TypeORM · PostgreSQL · Redis · BullMQ · JWT · OAuth(Google/Kakao/Apple)
**Web** React 19 · Vite · Zustand · Tailwind CSS · SSE (EventSource)
**Mobile** Flutter · Dart · Riverpod · Go Router · Dio · in_app_purchase
**AI/LLM** OpenAI · Google Gemini · Anthropic Claude · Grok · DeepSeek · OpenRouter · 프롬프트 캐싱
**Infra** AWS EC2 · S3/CloudFront · Nginx · PM2 · Docker · GitHub Actions
**Analytics** Mixpanel · Meta SDK · Firebase/GA4 · OneSignal · iOS SKAdNetwork (SKAN)

---

> 더 자세한 사례·코드 위치·벤치마크 수치는 [PORTFOLIO.md](PORTFOLIO.md) (요약 5p) / [PORTFOLIO_DETAIL.md](PORTFOLIO_DETAIL.md) (상세 20p) 참고.
