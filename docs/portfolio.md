# AI 캐릭터 채팅 서비스 — 포트폴리오 요약

> 풀스택(NestJS · React · Flutter) 으로 구축한 **AI 캐릭터 롤플레이 채팅 서비스**.
> SSE 실시간 스트리밍, 멀티 LLM 라우팅, Spark 화폐 시스템, OAuth 3종, OneSignal 푸시까지
> iOS/Android/Web 3-platform 으로 서비스 운영 중.

---

## 한눈에 보는 정량 지표

| 구분 | 수치 |
|---|---|
| 개발 기간 | 2026-02 ~ 2026-05 (약 **3.5개월**) |
| 총 커밋 | **1,181건** |
| 총 코드 라인 | 약 **100,000줄** (Backend 36.6K TS + Web 20.3K TS/TSX + App 44.0K Dart) |
| 운영 모듈 | NestJS 도메인 모듈 **30개** (auth, chat, billing, memory, iap, notification, proactive-message, ...) |
| DB 엔티티 | **24개** |
| 지원 AI 모델 | **20+ 개** (OpenAI / Gemini / Anthropic / Grok / DeepSeek / OpenRouter) |
| **현재 운영 프리셋** | **`grok-nothink-apr11`** (scene/atmosphere/final 3단 분리, 운영 실측 턴당 **5원대** / 응답 **3~4초대**) |
| 지원 OAuth | Google / **Kakao** / **Apple Sign In** |
| 분석 SDK | **Mixpanel · Meta · Firebase/GA4 · OneSignal** (단일 진입점 fan-out) |
| 출시 플랫폼 | iOS · Android · Web (PWA) |

---

## 핵심 기술 의사결정

| 영역 | 선택 | 왜 |
|---|---|---|
| 백엔드 런타임 | NestJS 11 + **Fastify** | SSE 에서 `reply.hijack()`·`socket.setNoDelay()` 같은 저수준 제어 가능, Express 대비 처리 성능 ↑ |
| 실시간 전송 | **SSE (Server-Sent Events)** | AI 응답은 서버→클라 단방향. WebSocket 대비 HTTP/Nginx/CDN 호환 + `EventSource` 재연결 의미론 단순 |
| 세션 관리 | **듀얼 JWT** (Access 15분 + Refresh 120일, Redis) + Sliding Window | 짧은 Access 로 보안 ↑, Refresh 갱신마다 새 토큰으로 UX 유지, Device fingerprint 로 디바이스 단위 강제 로그아웃 |
| 화폐 차감 | PostgreSQL **`SELECT ... FOR UPDATE`** (비관적 잠금) + FIFO charge 차감 | 동시 차감으로 잔액 음수가 되는 사고 차단, 차감 순서를 트랜잭션 로그만으로 역추적 가능 |
| 중복 결제 방지 | **멱등성 키** + 30초 내 **Jaccard 유사도 ≥ 0.55** 판정 | 모바일 망 단절 → 재시도로 같은 메시지 2번 결제되는 사고 차단. 클라가 키를 안 보내도 near-duplicate 차단 |
| AI 호출 분리 | **BullMQ** (Redis 백엔드) | 메모리 요약 / 프록액티브 메시지 등 수초 걸리는 AI 호출이 SSE 응답을 막지 않게 백그라운드 분리 + 지수 백오프 자동 재시도 |
| 모바일 클라 | Flutter + **Riverpod 2.6** (code gen) + Dio SSE | 컴파일 타임 타입 안전성, BuildContext 의존성 제거 |
| 배포 | EC2 + **PM2 fork mode** + GitHub Actions | BullMQ 워커가 중복 실행되면 안 되는 잡(프록액티브)이 있어 cluster 모드 회피, brand 별 SSH 키 분리 |

---

## 현재 운영 프리셋: `grok-nothink-apr11` — 3단 모델 파이프라인 (운영 실측 **턴당 5원대 / 응답 3~4초대**)

> **운영 중인 메인 프리셋. Claude Sonnet 단일 모델 35원 → 압축 23원 → 3단 분리 nothink 5원대 (실측, 분위기 가이드·anti-loop 포함) 로 약 7배 절감.**

| 단계 | 모델 | 역할 | reasoning |
|---|---|---|---|
| **Phase 1 (scene)** | **Grok 4.1 Fast** (OpenRouter) | 묘사·지문 생성 (`#scene`) | OFF |
| **분위기 가이드 (atmosphere)** | Gemini 2.5 Pro | scene/final 의 톤 결정용 가이드 | **OFF** (`disableMainModelReasoning`) |
| **Phase 2 (rest / final)** | **Grok 4.1 Fast** (OpenRouter) | 행동·대사 본문 생성 | **OFF** (`disableFinalModelReasoning`) |
| AntiLoop / 경량 분석 | Gemini 2.5 Pro | 반복 방지·서사 비트 추출 | - |

### 이 프리셋이 어떻게 5원대까지 내려갔는가

1. **모델 1개 → 3개 단계 분리** — Sonnet 단독 풀파이프라인을 끊고, 단계별로 가장 비용 효율적인 모델 배치
2. **본문 모델 교체 — Sonnet → Grok 4.1 Fast** ([`5b6ff58`](.)) — "비용 31원→2.4원, 9캐릭터 검증 78% B등급 이상" 으로 본문 단독 비용을 13배 절감 (목표 10~20원을 크게 하회)
3. **scene 모델 교체 — Flash Lite → Grok 4.1 Fast** ([`b0fde1b`](.)) — Flash Lite 가 history 의 action/dialogue 패턴에 끌려 scene-only 지시 무시 → 매 턴 재시도 실패 → Phase 1 전체 drop 되던 문제 해결. **비용도 flash-lite 1.5원 + 재시도 1.6원 ≈ 3원 → grok 단독 2원으로 오히려 절감**
4. **3단계 전부 reasoning OFF** — `disableMainModelReasoning` + `disableFinalModelReasoning` 플래그를 ChatPresetConfig 에 신설 ([`31af16f`](.)). "nothink" 이름 그대로 thinking 토큰 0
5. **sceneFirstParallel** — Phase 1 (scene) 과 Phase 2 (rest) 를 같은 호출 안에서 분할 생성. 첫 그룹은 빠르게 노출

> 본문 단독 호출은 2.4원이지만, 운영 환경에서는 atmosphere 가이드 (Gemini 2.5 Pro 호출) + scene Grok + final Grok + AntiLoop 분석까지 모두 합쳐 **턴당 약 5원대로 실측**.

### 비용 절감 변천사 (모두 실측 / 커밋 기록)

```
Sonnet 풀버전 (claude-sonnet)          35원/턴   ← 시작점 (87f5d42, b2f00c0 실측)
   ↓ NARRATOR_DIRECTIVE 70% 압축
Sonnet 압축 (claude-sonnet-lite)       23원/턴   (-32%)
   ↓ Anthropic 캐싱 적용
Anthropic 캐시 워밈 평균              29.52원/턴 (run2 12/12 100% hit, 최저 14.30원)
   ↓ 본문 모델 Sonnet → Grok 4.1 Fast 전환 (5b6ff58)
Grok 4.1 Fast 본문 단독                2.4원/턴  (-92%, 13배)
   ↓ 분위기 가이드 + AntiLoop + scene 모두 합친 운영 실측
grok-nothink-apr11 ★ (운영 실측)       5원대/턴  (Sonnet 대비 -약 86%, 7배)
```

> 운영 측면: 일일 활성 사용자 1만 명 × 평균 30턴/일 가정 시 **월 약 3.15억 → 0.45억으로 절감 (월 약 2.7억)**.

---

## 성능 개선 — 정량 임팩트

> **핵심 (운영 실측):**
> - **턴당 LLM 비용 35원 → 5원대** (약 7배 절감)
> - **응답 시간 40초대 (최악 사례 67초) → 3~4초대** (10배+ 단축)
> - 보조 단계 벤치마크: 분위기 가이드만 떼어내면 4.66s → 0.69s (6.7배)

### 1. 분위기 가이드 모델 교체 — TTFT 약 **4초 단축 (85% 감소, 6.7배 빠름)**
- 하이브리드 라우팅의 atmosphere(분위기) 가이드 단계가 응답 지연의 주 원인이었음
- `gemini-2.5-pro` → **`gemini-2.5-flash-lite`**, `maxOutputTokens` 800 → 400
- 벤치마크: **평균 4.66s → 0.69s**
- Pro 가 토큰 한도까지 과잉 생성했지만 Flash-Lite 는 3~5문장 지시를 정확히 준수 → 품질 동등 검증

### 2. 프롬프트 압축 + 히스토리/출력 제한 — 턴당 비용 **34원 → 23원 (32% 절감)**
- NARRATOR_DIRECTIVE **62줄 → 18줄 (70% 축소)**, 핵심 규칙만 유지
- 히스토리 윈도우 40 → 6개 (BullMQ 메모리 요약 시스템과 병행)
- 출력 분량 가이드 강화 (상한 200자, 핑퐁 리듬)
- Sonnet 품질 유지하면서 안정구간 턴당 23~25원 달성

### 3. nothink 3단 파이프라인으로 본문 모델 전환 — **본문 단독 31원 → 2.4원 (13배), 운영 풀파이프라인 5원대 (실측)**
- 본문(final) 모델을 Sonnet → **Grok 4.1 Fast (nothink)** 로 교체 ([`5b6ff58`](.) "비용 31원→2.4원, 9캐릭터 78% B등급 이상")
- scene 모델도 Grok 4.1 Fast 로 통일 (Flash Lite 의 scene-only 지시 무시 회귀 해결)
- 3단계 전부 reasoning OFF — Grok 의 thinking 토큰 70% 낭비 차단 ([`31af16f`](.))
- atmosphere/AntiLoop/scene 다 합쳐 운영 실측 5원대로 안착, 현재 메인 프리셋으로 운영 중

### 4. Grok reasoning 차단 — 응답 13s + 출력 토큰 900+ 낭비 해결
- 프리셋 이름이 `grok-nothink-apr11` 인데도 최종 모델의 reasoning 이 켜진 채로 운영되던 회귀 발견
- `ChatPresetConfig` 에 `disableFinalModelReasoning` 플래그 신설, outputOverrides 로 Phase 2 호출에 주입
- 140자 응답에 900+ thinking 토큰 / 13초씩 소비하던 문제 정상화

### 4-1. Phase 2 본문 호출 60s+ 침묵 방어 — **67초 사례 → 30s timeout + 자동 retry**
- `5fb20a2`: DeepSeek V4 Flash 가 337자 응답에 67초 침묵하는 사례 진단을 위해 OpenRouter 호출에 reasoning 진단 로그 3종(REQ/TTFT/USAGE) 추가
- `5035722`: OpenRouter underlying 제공자 큐잉/재라우팅으로 60s+ 침묵 시 사용자가 무한정 대기하던 문제 방어
- Promise.race 로 30s 초과 시 await 만 풀고 빈 restFullText 진입 → empty 처리가 자동 1회 retry → **재시도는 보통 35~45초로 단축**
- `phase2TimedOut` 플래그로 늦게 도착한 onDone 이 retry 결과를 덮어쓰는 것 차단

### 5. Anthropic 멀티턴 캐싱 — 후반 턴 **약 10원/턴 절감 (-22%)**
- variable suffix 를 system 에서 분리해 user 메시지 앞에 주입 → cache prefix chain 보호
- 모든 히스토리 메시지를 content 배열로 통일 → 바이트 단위 prefix 매치 보장
- 히스토리 마지막 메시지에 `cache_control` breakpoint 추가, 5분 TTL ephemeral cache

### 6. 분위기 가이드 호출 병렬화 — 추가 **200~600ms 단축**
- 기존: atmosphere 동기 호출(1~2s) → prompt 조립 → AntiLoop → scene/final 순차
- 개선: hybrid 라우팅 직후 atmosphere 를 **백그라운드 Promise 로 선시작**, prompt build / AntiLoop 추출과 병렬 실행, prepend 시점에서만 await

### 7. N+1 쿼리 제거 + INSERT 배치화 — 3개 핫패스 정리
- `chat-room.service`: 방별 unreadCount 개별 쿼리 → **단일 GROUP BY 쿼리**
- `proactive-message.service`: 방별 daily/unanswered count 루프 → **FILTER + GROUP BY 단일 쿼리**
- `billing.service`: 환불 트랜잭션 루프 INSERT → **배치 `save()`**

### 그 외 누적 개선
- SSE 즉시 flush (`flushHeaders` + `setNoDelay(true)`) — Phase 1 scene 청크가 OS 버퍼에 머무는 현상 제거
- Turbo 프리셋: historyTake 30 → 20 (TTFT 1.5s↓), maxOutputTokens 4096 → 2048 (tail latency 0.5~1s↓)
- 타이프라이터 동적 속도: backlog 기반 12.5~100자/s 자동 조절로 "scene 타이핑 뒤 오래 기다림" UX 문제 해결
- Flutter `Image.network` → `CachedNetworkImage` 전환으로 디스크 캐싱, 재방문 시 네트워크 0 콜
- 이미지 URL http → https 자동 정규화 (TypeORM column transformer) — 푸시 아바타 누락 11곳 일괄 해결
- Deferred deep link 저장소를 **Postgres → Redis 로 전환** (10분 짧은 TTL, IP 키 조회 특성에 맞춤)

---

## 데이터·애널리틱스 인프라 — 4종 SDK Fan-out + 11 이벤트 택소노미

> **마케팅·PM 가설 검증을 가능하게 한 분석 인프라 직접 구축. AnalyticsService 단일 진입점이 Mixpanel + Meta + Firebase 3중 송신.**

### SDK 통합 4종

| SDK | 역할 |
|---|---|
| **Mixpanel** | 사내 제품 분석 (가설 검증, 코호트, 퍼널) |
| **Meta (Facebook)** | Meta 광고 최적화 + iOS SKAN(메타 사서함) |
| **Firebase / GA4** | Google Ads 광고 최적화 + iOS SKAN(구글 사서함) + 자동 screen_view |
| **OneSignal** | 푸시 발송 + 클릭 어트리뷰션 (FCM 직접 미사용 — 충돌 방지) |

이전에 통합했던 ~AppsFlyer~ 는 영업팀 미팅 후 제거 ([`3233a12`](.)) — 단일 멀티채널 어트리뷰션 SDK 의존을 끊고 채널별 1순위 어트리뷰션으로 전환.

### Fan-out 아키텍처

```
앱 행동 → AnalyticsService.logEvent(name, props)
              ├─→ Mixpanel.track()
              ├─→ FacebookAnalyticsService.logEvent()   ← 표준 이벤트명 매핑 + SKAN 트리거
              └─→ FirebaseAnalyticsService.logEvent()   ← GA4 표준명 매핑 + Google Ads 전환

User Property → AnalyticsService.setUserProperties(map)
              ├─→ Mixpanel.people.set()
              └─→ FirebaseAnalyticsService.setUserProperties()

결제 완료 → PurchaseAnalytics.completed()
              ├─→ Meta logPurchase(amount, KRW)
              └─→ Firebase logPurchase(amount, KRW)

푸시 클릭 → OneSignal addClickListener → push_clicked 이벤트
ATT 응답 → Meta setAdvertiserTracking + GA4 setAnalyticsCollectionEnabled
화면 전환 → FirebaseAnalyticsObserver 가 GA4 screen_view 자동 발화
```

→ 새 이벤트 추가 시 발화부 한 곳만 손대면 3중 SDK 전체에 자동 송신, Facebook 표준 이벤트 매핑은 어댑터 레이어에서 자동 처리.

### 택소노미 v1.0 — 11 이벤트 + 10 User Property

**★★ 북극성 / ★ 가설 핵심**

| 카테고리 | 이벤트 |
|---|---|
| 유입·가입 | `app_first_open` · `signup_completed` |
| 리텐션 | `app_opened` (백그라운드 30초+ 재진입 조건) |
| 코어 행동 | **`chat_message_sent`** ★★ · `chat_session_ended` |
| 단계 전환 | `rewarded_ad_completed` |
| 결제 퍼널 | **`spark_low_modal_viewed`** ★ · `store_viewed` · `purchase_initiated` · **`purchase_completed`** ★★ · `purchase_failed` |
| SKAN 마일스톤 | `chat_milestone_4` (누적 메시지 4회 도달 시 1회 — 메타 SKAN CV 슬롯) |

**User Property 10종**: `lifetime_message_count`, `lifetime_ad_views`, **`ad_limit_reached_count` ★★**, `days_since_first_ad_limit`, `lifetime_purchase_count`, `first_purchase_date` ★★, `last_active_date` 등

### 가설 검증 핵심 (북극성)

> **"광고 한도 2번+ 도달한 유저 → 7일 내 결제 전환"**

이 가설을 검증 가능하게 만들기 위해 직접 구축한 인프라:
- `LifetimeCounters` (누적 카운터, 광고 5회 + 잔액 0 동시 충족 시 1일 1회 +1)
- `DailyAdCounter` (KST 자정 리셋)
- `UserSession` (가입일/마지막 활동일/첫 결제일 — `days_since_signup` 등 파생 속성 산출)
- `ChatSessionTracker` (세션당 메시지 수 + 이탈 사유 4종 자동 판정: `back_button` / `app_background` / `spark_exhausted` / `dispose`)

### iOS SKAN 6밴드 어트리뷰션

- **SKAdNetworkItems 152개 일괄 등록** (AppLovin master list 기준) — 기존 3개 → 152개로 확장 ([`08835bb`](.))
  - Meta / Google / AdMob / Unity / AppLovin / IronSource 등 메이저 광고 네트워크 망라
  - iOS 14.5+ ATT 거부 유저의 어트리뷰션을 SKAN 경로로 정상 수집
- `chat_message_sent` / `spark_low_modal_viewed` 를 메타 SKAN CV 11~20 / 21~30 밴드 트리거로 매핑
- `chat_milestone_4` 이벤트로 SKAN CV 슬롯 고정 — 앱은 이벤트 송신만, CV 매핑은 메타 이벤트 매니저에서 운영팀이 관리

### 안전장치

- **결제 이벤트 release 빌드 가드** ([`1d3c41c`](.)) — debug/profile 빌드의 결제 테스트가 광고 학습 데이터를 오염시키지 않도록 `kReleaseMode` 체크
- **ATT 거부 시 GA4 수집도 자동 OFF** — `setAnalyticsCollectionEnabled(false)` (Apple/GDPR 정책 일관성)
- **`chat_message_sent` 발화 보장** ([`a294f1d`](.)) — 카운터 실패 시에도 이벤트 보냄 (북극성 이벤트 누락 차단)
- **purchase 중복 발화 방지** — `transaction_id` 기반 SharedPreferences 체크
- **Mixpanel email super property** ([`cd2c38b`](.)) — 로그인 시 자동 부착, 로그아웃 시 unregister 로 이전 값 누수 차단

---

## 시스템 아키텍처 한눈에 보기

```
Web (React 19/Vite/Zustand) ─┐
                             ├── HTTPS/SSE ──┐
App (Flutter/Riverpod/Dio) ──┘               │
                                              ▼
                                     ┌──────────────────────────┐
                                     │   Nginx (SSE 호환 설정)    │
                                     │   - proxy_buffering off  │
                                     │   - X-Accel-Buffering    │
                                     └────────────┬─────────────┘
                                                  ▼
                                     ┌──────────────────────────┐
                                     │ NestJS 11 + Fastify (PM2)│
                                     │ 30개 도메인 모듈          │
                                     └──┬───────────┬───────────┘
                                        │           │
                              ┌─────────┘           └─────────┐
                              ▼                               ▼
                  ┌──────────────────────┐       ┌─────────────────────┐
                  │ PostgreSQL 16        │       │ Redis 7             │
                  │ - 24 entities        │       │ - Refresh Token TTL │
                  │ - Pessimistic Lock   │       │ - Access Blacklist  │
                  │ - SQL migrations     │       │ - BullMQ 큐         │
                  └──────────────────────┘       │ - Deferred DeepLink │
                                                 └─────────────────────┘
                              ▼
                  ┌──────────────────────────────────────────┐
                  │ AI Providers (20+ 모델 카탈로그)          │
                  │ OpenAI · Gemini · Anthropic · Grok ·     │
                  │ DeepSeek · OpenRouter                    │
                  └──────────────────────────────────────────┘
```

---

## 어필 포인트 8가지

1. **풀스택 단독 운영 경험** — NestJS 백엔드 + React 웹 + Flutter 앱을 하나의 모노레포로 묶고, 인프라(EC2/Nginx/PM2)부터 CI/CD(GitHub Actions)까지 직접 관리
2. **AI 비용 약 7배 절감 (운영 실측 35원 → 5원대/턴)** — 단순 모델 swap 이 아니라, scene/atmosphere/final 3단 모델 분리 + 단계별 reasoning OFF + scene 모델 회귀 해결의 누적 결과. 본문 단독은 31원 → 2.4원 (13배). 현재 운영 중인 `grok-nothink-apr11` 프리셋
3. **실측 기반 성능 최적화** — "왜 느린지" 진단부터 시작해서 모델/프롬프트/네트워크/렌더 4개 레이어 전체에서 정량 측정 후 개선 (커밋 로그에 모든 벤치마크 수치 기록)
4. **데이터·애널리틱스 인프라 단독 구축** — Mixpanel/Meta/Firebase/OneSignal 4종 SDK 를 단일 `AnalyticsService` 진입점에서 fan-out, 11 이벤트 + 10 User Property 택소노미 + iOS SKAN 6밴드 매핑까지. 가설 검증("광고 한도 2번+ 도달한 유저 → 7일 내 결제 전환") 가능한 데이터 파이프라인을 직접 설계·구현
5. **결제·과금 정합성 설계** — Pessimistic Lock + FIFO charge 차감 + 정확 환불 + 멱등성 키. 같은 메시지 2번 결제 / 잔액 0 무한 호출 같은 실제 운영 사고 시나리오 모두 차단
6. **앱 스토어 심사 통과 경험** — Apple Guideline 1.2 (크리에이터 차단) 대응, Apple JWS 로컬 검증, Android 결제 누락 보정, 민감정보 로그 제거 등 심사 거절을 fix → 재제출로 통과
7. **장기 컨텍스트 유지 시스템 설계** — BullMQ 비동기 큐로 short/mid/long 토큰 계층 요약을 백그라운드 처리해 SSE 응답을 지연 없이 흘리면서도 100턴+ 대화 일관성 유지
8. **운영 진단 도구 직접 구축** — 어드민 전용 실시간 로그 SSE 뷰어 + 채팅방 enumerate + AI 모델 비교 도구(test-chat 모듈) 까지 자체 구축, CS 응대 속도 단축

---

## 상세 사례

각 개선의 배경 / 원인 분석 / 적용 / 검증을 자세히 기록한 문서는 [PORTFOLIO_DETAIL.md](PORTFOLIO_DETAIL.md) 에 정리.

---

## 비고

- 본 문서는 익명화된 포트폴리오 요약본입니다.
- 모든 정량 수치는 git commit 메시지에 기록된 벤치마크·실측 기반입니다.
- 일부 기능(캐릭터 IP, 프롬프트 본문 등)은 `.gitignore` 처리되어 저장소에 포함되지 않습니다.
