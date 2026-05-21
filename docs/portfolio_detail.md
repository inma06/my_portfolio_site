# AI 캐릭터 채팅 서비스 — 포트폴리오 상세본

> 요약본은 [PORTFOLIO.md](PORTFOLIO.md), 본 문서는 면접관 정독용 상세본입니다.
> 모든 정량 수치는 git commit 메시지·실측 기반이며 출처 커밋 해시(`abc1234`)를 함께 표기합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [핵심 기술 의사결정 — Deep Dive](#3-핵심-기술-의사결정--deep-dive)
4. [현재 운영 프리셋 `grok-nothink-apr11` — 비용 17배 절감 사례](#4-현재-운영-프리셋-grok-nothink-apr11--비용-17배-절감-사례)
5. [성능 개선 사례 (정량 수치 포함)](#5-성능-개선-사례)
6. [데이터·애널리틱스 인프라](#6-데이터애널리틱스-인프라)
7. [안정성·정합성 설계](#7-안정성정합성-설계)
8. [기능 구현 하이라이트](#8-기능-구현-하이라이트)
9. [운영·인프라](#9-운영인프라)
10. [트러블슈팅 사례](#10-트러블슈팅-사례)
11. [기술 스택 전체](#11-기술-스택-전체)

---

## 1. 프로젝트 개요

### 1.1 서비스 한 줄 정의

> **사용자가 AI 캐릭터(가상 인물) 와 장기 롤플레이 대화를 나누는 iOS/Android/Web 서비스.**
> 단순 챗봇이 아니라 캐릭터 페르소나·분위기·반복 방지·메모리·검열·과금이 한 SSE 응답 안에서 함께 흐르는 멀티-LLM 파이프라인.

### 1.2 규모

| 구분 | 수치 |
|---|---|
| 개발 기간 | 2026-02-07 ~ 2026-05-21 (약 **3.5개월** 누적) |
| 총 커밋 수 | **1,181건** |
| Backend (NestJS) | **36,652** lines TypeScript |
| Web (React SPA) | **20,322** lines TypeScript/TSX |
| Mobile (Flutter) | **43,965** lines Dart |
| **총 코드 라인** | **약 100,939 lines** |
| NestJS 도메인 모듈 | **30개** |
| DB 엔티티 | **24개** |
| 지원 AI 모델 | **20+ 개** (관리자 패널에서 런타임 ON/OFF) |
| 운영 환경 | AWS EC2 (Backend) + S3/CloudFront (Web) + App Store/Play Store |

### 1.3 도메인 모듈 30개 전체 목록

```
auth                 — 듀얼 JWT + OAuth 3종 (Google/Kakao/Apple)
chat                 — 실서비스 채팅 (SSE 스트리밍, 풀 파이프라인)
chat-room            — 채팅방 CRUD, 입출입, unread 카운트
chat-bookmark        — 메시지 북마크
character            — 캐릭터 카탈로그, 좋아요/조회/부스트
test-character       — 어드민 캐릭터 시트 테스트
test-chat            — 어드민 모델 비교 도구 (chat 모듈과 의도적 분리)
billing              — Spark 화폐 시스템 (FIFO + 정확 환불)
admin-iap            — IAP 어드민
admin-narrator-directive — 시스템 프롬프트 관리
admin-nsfw-keywords  — 검열 키워드 관리
admin-user           — 사용자 관리
admin-chat-export    — 채팅 로그 추출
model-catalog        — AI 모델 카탈로그 (DB 기반 런타임 ON/OFF)
memory               — BullMQ 비동기 대화 요약
iap                  — Apple JWS 로컬 검증 + Android 결제 보정
notification         — OneSignal 푸시 (tag 기반 broadcast)
proactive-message    — KST 21시 비활성 사용자 일괄 발송
reply-nudge          — 답장 유도 push (조건 검사 strict)
user-persona         — 사용자 롤플레이 캐릭터
user-settings        — 알림·언어 등 사용자 설정
deferred-deeplink    — Play Install Referrer (Android) + IP fingerprint (iOS)
identity-verification— 본인인증
quiz                 — 퀴즈
ranking              — 랭킹 캐시
faq                  — FAQ
legal                — 법률 문서 (TOS, Privacy)
log                  — HTTP 로깅 (인메모리 버퍼 + DB + SSE 실시간 뷰어)
app-version          — 앱 버전 강제 업데이트
webhooks             — 외부 시스템 콜백
```

---

## 2. 시스템 아키텍처

### 2.1 전체 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│ Clients (3 platforms)                                            │
│  Web (React 19/Vite 7/Zustand 5/Tailwind 4)                     │
│  iOS / Android (Flutter / Riverpod 2.6 / Dio / Go Router 14)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / SSE
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ AWS EC2 — Nginx (SPA + /api/ 역프록시 + SSE 호환 설정)             │
│  - proxy_buffering off                                           │
│  - X-Accel-Buffering: no                                         │
│  - proxy_read_timeout 86400s                                     │
│  - $is_args$args 보존 (chat/rooms/*/messages 전용 regex location) │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ NestJS 11 + Fastify (PM2 fork mode, max_memory_restart 1G)       │
│  - reply.hijack() + raw.socket.setNoDelay(true) 로 즉시 flush      │
│  - JwtAuthGuard / AdminGuard / RoleGuard                          │
│  - HttpLoggingInterceptor → 인메모리 링버퍼(1000) + DB 영구 저장    │
│  - 30개 도메인 모듈                                                │
└────┬──────────────────────────────┬──────────────────────────────┘
     │                              │
     ▼                              ▼
┌────────────────────┐  ┌────────────────────────────────────────┐
│ PostgreSQL 16      │  │ Redis 7                                 │
│ - 24 entities      │  │ - Refresh Token (auth:{uid}:{did} TTL120d)│
│ - SELECT FOR UPDATE│  │ - Access Token blacklist (jti 기반)      │
│ - SQL migrations   │  │ - BullMQ 큐 (memory/proactive/nudge)    │
│   (synchronize:OFF │  │ - Deferred deep link (10분 TTL GETDEL)  │
│    in production)  │  └────────────────────────────────────────┘
└────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────────────┐
              │ AI Providers (20+ 모델 카탈로그, DB 관리)      │
              │  OpenAI · Gemini · Anthropic (cache) · Grok · │
              │  DeepSeek · OpenRouter (proxy 라우팅)         │
              └──────────────────────────────────────────────┘
```

### 2.2 채팅 메시지 1회 처리 흐름 (가장 복잡한 핫패스)

```
사용자 메시지 입력
   │
   ▼
[1] JwtAuthGuard → Access Token 검증
   │
   ▼
[2] 멱등성 키 검사 (30초 윈도우, Jaccard ≥ 0.55 near-duplicate 차단)
   │
   ▼
[3] NSFW 검열 (미인증 사용자 차단)
   │
   ▼
[4] Spark 잔액 확인 + 차감 (SELECT FOR UPDATE + FIFO charge 차감)
   │
   ▼
[5] user 메시지 DB 저장 + 히스토리 로드 (병렬)
   │
   ▼
[6] hybrid 라우팅 결정 + atmosphere 가이드 백그라운드 선시작 ◄── perf 319036c
   │
   ▼
[7] AntiLoop 보정 + prompt build (atmosphere 와 병렬)
   │
   ▼
[8] atmosphere prepend → scene LLM 호출 (Phase 1)
   │   - scene 청크는 검증 후 paced drainer 로 flush (25ms/1자)
   ▼
[9] scene 끝 → rest LLM 호출 (Phase 2)
   │   - SSE 청크를 25ms/1자 paced drainer 로 클라 송출
   ▼
[10] 대화 종료 시점에 ChatMessage 저장
   │
   ▼
[11] 메모리 요약 작업 BullMQ 큐잉 (백그라운드)
   │
   ▼
[12] AI 실패 시 ConsumedRow[] 기반 정확 환불
```

---

## 3. 핵심 기술 의사결정 — Deep Dive

### 3.1 SSE 가 WebSocket 보다 적합했던 이유

```typescript
// backend/src/modules/chat/chat.controller.ts (요지)
reply.hijack();                                  // Fastify 자동 응답 우회
reply.raw.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'X-Accel-Buffering': 'no',                     // Nginx 버퍼링 비활성화
  'Cache-Control': 'no-cache, no-transform',
});
reply.raw.flushHeaders();                        // 즉시 헤더 flush
reply.raw.socket.setNoDelay(true);              // Nagle 알고리즘 해제 → 작은 청크 즉시 전송
```

**선택 근거:**
- AI 응답은 **서버 → 클라이언트 단방향** — WebSocket 의 양방향은 오버스펙
- HTTP/HTTPS·CDN·Nginx 와 그대로 호환 (WebSocket 은 별도 upgrade)
- `EventSource` 의 자동 재연결 의미론이 단순 (last-event-id 등)
- 모바일 SDK 호환성 (Dio + dart:io / Cronet / NSURLSession 전부 가능)

**Nginx 측 보완:** `location /chat/rooms/*/messages` regex location 의 `proxy_pass` 에 `$is_args$args` 반드시 포함 (query string 누락 이슈 발견 후 [`d90c1bd`](.) 에서 가이드 추가).

### 3.2 듀얼 JWT + Sliding Window + Device Fingerprint

```
[클라] ──login──► [Backend]
                      │
                      ├─ Access Token (15분)   → JWT 서명, 비검증 stateless
                      └─ Refresh Token (120일) → Redis: auth:{userId}:{deviceId}

[클라] ──API 호출──► [Backend]
                          │
                          ├─ Access 유효? → 통과
                          └─ 만료? → 401 → 클라가 /auth/refresh 호출
                                            │
                                            ├─ Refresh 검증 (Redis 조회)
                                            ├─ 새 Access + 새 Refresh 발급 (Sliding)
                                            └─ 이전 Refresh 무효화
```

**왜 Refresh 를 Redis 에 저장:**
- 즉시 무효화 가능 (디바이스별 강제 로그아웃)
- TTL 자동 만료 (DB 처리 시 별도 스케줄러 필요)
- 매 API 호출 직전에 발생하는 검증 지연이 누적되므로 인메모리 필수

**Device fingerprint:**
- 키: `auth:{userId}:{deviceId}` (User-Agent 또는 클라 제공 deviceId)
- 같은 계정으로 5개 디바이스에서 로그인 가능, 각 디바이스 개별 로그아웃 가능
- 디바이스 토큰을 `DeviceToken` 테이블에 매핑하면서 **deviceId 기준으로 userId 재매핑** → 같은 기기에서 로그인 계정이 바뀌어도 푸시 토큰이 정확히 이동

### 3.3 멀티 OAuth (Google · Kakao · Apple)

- 3종 모두 **id_token 기반 검증** (서버 redirect 방식 X) → 모바일 앱과 통합 깔끔
- **Apple JWS 로컬 검증 도입** ([`4e51fb2`](.)) 으로 4040010 오류 해결
- 탈퇴 계정 OAuth 로그인 차단 (403) ([`aeb6ff4`](.))

### 3.4 Spark 화폐 — FIFO 차감 + 정확 환불

**구조:**
```
charge row 1: amount=100, consumed=20, remaining=80, createdAt=T1
charge row 2: amount=50,  consumed=0,  remaining=50, createdAt=T2

차감 30원 요청 → row 1 부터 깎음 (FIFO)
  → row 1: remaining 80 → 50
  → row 2: 손대지 않음

AI 실패 환불 → ConsumedRow[{rowId:1, amount:30}] 기록을 따라 row 1 에 30 반환
```

- 각 charge 의 잔여 = `charge.amount + SUM(consume/refund 트랜잭션)`
- 트랜잭션 로그만으로 잔액 추적 가능 → 회계 감사 용이
- `setLock('pessimistic_write')` 로 동시 차감 시 잔액 음수 사고 차단
- 환불 트랜잭션은 **배치 `save()`** 로 INSERT 최적화 ([`ba7dce3`](.))

### 3.5 멱등성 키 — 네트워크 단절 → 이중 결제 차단

```typescript
// chat_message 테이블에 (roomId, idempotencyKey) 복합 인덱스
// 30초 윈도우 안에 같은 roomId 로 메시지가 다시 들어오면:
//   1. idempotencyKey 가 같으면 즉시 stored 응답 반환 (no charge)
//   2. 다르면 본문을 Jaccard 유사도 계산 → ≥ 0.55 면 near-duplicate 로 차단
```

- Jaccard 토큰화는 한국어 형태소 stem 기반 ([`message-dedup.spec.ts`](backend/src/modules/chat/message-dedup.spec.ts))
- 클라가 키를 안 보내도 본문 유사도로 차단 → 구버전 클라/잘못된 SDK 호출도 방어

### 3.6 BullMQ 비동기 큐 — AI 부하 격리

- **메모리 요약**: 20개 메시지마다 GPT-5.2 로 short(20) / mid(60) / long(120) 토큰 계층 요약
- **프록액티브 메시지**: 매일 KST 21시 활성방 일괄 발송 ([`dbfce3d`](.))
- **답장 유도(reply-nudge)**: 사용자 미응답 시간 기반 push
- Rate Limit 발생 시 지수 백오프 자동 재시도
- 잡 상태 (waiting/active/completed/failed) 어드민에서 조회

**왜 PM2 cluster 모드 안 씀:** BullMQ 워커가 중복 실행되면 안 되는 잡 (프록액티브 일괄 발송) 이 있어 fork mode 로 운영.

---

## 4. 현재 운영 프리셋 `grok-nothink-apr11` — 비용 약 7배 절감 사례 (운영 실측)

> **Sonnet 풀버전 35원 → 압축 23원 → 본문 단독 Grok 2.4원 → 운영 풀파이프라인 (atmosphere+AntiLoop+scene+final) 실측 5원대 / 응답 3~4초대. 단순 모델 교체가 아니라 파이프라인 자체 재설계.**

> 본 문서의 `estimatedCostWon: 2.0` 은 코드에 적힌 본문 예상치이며, **실제 운영에서는 분위기 가이드 / AntiLoop 추출 / scene 호출까지 모두 합산되어 턴당 약 5원대로 실측**됩니다. 응답 속도도 SSE 청크 전체 수신까지 평균 3~4초대 (운영 기준).

### 4.1 운영 중인 프리셋 구성 (`backend/src/modules/chat/chat-preset.config.ts:577`)

```typescript
export const PRESET_GROK_NOTHINK_APR11: ChatPresetConfig = {
  id: 'grok-nothink-apr11',
  displayName: 'Grok Apr11 🧠❌',
  estimatedCostWon: 2.0,

  // 3단 모델 분리
  mainModelId: 'gemini-2.5-pro',          // 분위기 가이드 (atmosphere)
  finalModelId: 'x-ai/grok-4.1-fast',    // Phase 2 본문 (행동·대사)
  sceneModelId: 'x-ai/grok-4.1-fast',    // Phase 1 묘사 (#scene)
  lightweightModelId: 'gemini-2.5-pro',  // AntiLoop / 서사 비트 추출

  // 3단계 전부 reasoning OFF — "nothink" 의미 그대로
  disableMainModelReasoning: true,
  disableFinalModelReasoning: true,
  // (scene 은 chat.service 의 sceneFirstParallel 경로에서 disableReasoning 하드코딩)

  // 분할 생성 + 캐싱 OFF (Anthropic 전용)
  sceneFirstParallel: true,
  anthropicCaching: false,

  historyTake: 40,
  atmosphereMaxTokens: 800,
  sceneMaxLength: 160,
  narratorDirective: NARRATOR_DIRECTIVE_GROK_APR11,
  narratorDirectiveKey: 'grok-apr11',
  // ...
};
```

### 4.2 비용 절감 변천사 (실측 + 코드 주석)

| 프리셋 ID | 비용/턴 | 출처 |
|---|---|---|
| `claude-sonnet` (Sonnet 풀버전) | **35원 (실측)** | A/B 테스트 후 풀버전 복원 ([`87f5d42`](.), [`b2f00c0`](.)) — 시작점 |
| Anthropic 프롬프트 캐싱 적용 (Sonnet) | 평균 **29.52원**, 최저 **14.30원** | Phase 4 캐싱 검증 12턴 100% hit ([`c83d37a`](.)) |
| `claude-sonnet-lite` (Sonnet 압축) | 23원 (estimatedCostWon) | NARRATOR_DIRECTIVE 70% 압축 + historyTake 6 ([`6b4721e`](.)) |
| 본문 모델 Sonnet → **Grok 4.1 Fast 전환 직후** | **31원 → 2.4원 (-92%, 13배)** ★ | "9캐릭터 78% B등급 이상, NSFW/드리프트/자가답변 전원 0" ([`5b6ff58`](.)) |
| **`grok-nothink-apr11`** ★ **현재 운영 (실측)** | **약 5원대/턴** | atmosphere 가이드 + scene Grok + final Grok + AntiLoop 추출 모두 합산 |
| 코드 내 `estimatedCostWon` | 2.0 | 본문 단독 호출만 가정한 예상치 (실제 운영과 다름) |
| `deepseek-v4-flash` (실측 반영) | **30원** | 본문이 reasoning 무시하고 thinking 토큰 폭주 → 실측치 반영 |
| `grok-turbo` | 1.5원 | atmosphere 제거 + 압축 디렉티브 |
| `grok-solo` (scene 단독) | 0.3원 | scene 만 떼어낸 1-phase 변종 |

**핵심 변천 요약:**
- Claude Sonnet 4.5 가 지시 추종·문체 품질은 최고 (건당 ~38원, Grok 대비 약 8배) 였으나 손익 분기점 초과
- 본문만 Grok 4.1 Fast 로 교체해 본문 단독 비용을 31원 → 2.4원 (-92%) 으로 절감, 품질도 9캐릭터 검증 78% B등급 이상 확보
- 운영 풀파이프라인 실측은 **5원대** (atmosphere 등 보조 단계 포함)
- 일일 1만 명 × 30턴 가정: **월 3.15억 → 0.45억 (약 2.7억 절감)**

### 4.3 이 프리셋이 어떻게 만들어졌나 — 의사결정 흐름

#### (a) 모델 1개 → 3개 단계 분리

처음에는 Claude Sonnet 단독으로 풀파이프라인을 돌렸음. **실측 35원/턴** ([`87f5d42`](.), [`b2f00c0`](.)) → 손익 분기점 초과.

→ "한 모델이 다 잘할 필요는 없다" 는 가설로 단계별 최적 모델 배치:
- **분위기 가이드 (atmosphere)**: 짧은 톤 가이드만 생성하면 됨 → Gemini 2.5 Pro (instruction following 안정)
- **scene 묘사**: 형식 준수가 중요 (`#scene` 마커, 톤 일관성) → Grok 4.1 Fast
- **본문 (final)**: 대화·행동 생성, 속도·비용·품질 균형 → Grok 4.1 Fast

#### (b) scene 모델 교체 — Flash Lite → Grok 4.1 Fast ([`b0fde1b`](.))

처음에는 scene 도 Flash Lite (저렴) 로 갔으나 회귀 발견:
- Flash Lite 가 history 의 action/dialogue 패턴에 끌려 **scene-only 지시 무시**
- `_isEmptySceneResponse=true` → 재시도 → 재시도도 실패 → Phase 1 응답 전체 drop
- 사용자 체감: "#scene narration 이 안 보인다"

비용 비교:
```
Flash Lite: 1.5원 + 재시도 1.6원 ≈ 3원 (재시도율 높음)
Grok 4.1 Fast 단독: 2.0원 (재시도 거의 없음)
```

→ **저렴한 모델이 재시도율 때문에 오히려 비싸지는 사례** — 교체로 비용도 절감 + 품질도 개선.

#### (c) reasoning OFF 적용 — 3단계 전부

Grok 4.1 Fast 는 reasoning ON 시 140자 응답에도 **900+ thinking 토큰 / 13초** 소비. 프리셋 이름이 `nothink` 인데 코드는 reasoning ON 상태로 운영되던 회귀 ([`31af16f`](.)).

```typescript
// ChatPresetConfig 에 두 플래그 신설
disableMainModelReasoning?: boolean;    // 분위기 가이드 모델
disableFinalModelReasoning?: boolean;   // 최종 응답 모델
```

- `outputOverrides.disableReasoning: true` 로 Phase 2 호출에 주입
- Provider 별 페이로드 변환 처리 (`reasoning.enabled=false` for DeepSeek 등)

#### (d) sceneFirstParallel — 분할 생성

같은 모델 2회 호출로 첫 메시지 그룹을 빠르게 표시:
- 첫 호출: scene 만 생성 → 즉시 flush → 사용자에게 묘사 노출
- 두 번째 호출: 행동·대사 생성 → typing 인디케이터 뒤 노출

scene 완료 ~ rest 도착 갭에는 typing 인디케이터 자동 표시 ([`74c72ff`](.)).

### 4.4 운영 효과 (가정 모델 — 실측 기반)

일일 활성 사용자 1만 명 × 평균 30턴/일 가정 (총 900만 턴/월):

| | Sonnet (실측 35원) | grok-nothink-apr11 (운영 실측 5원대) |
|---|---|---|
| 턴당 비용 | 35원 | 5원 |
| 일일 LLM 비용 | 1,050만원 | **150만원** |
| 월 비용 | 약 3.15억 | 약 0.45억 |
| 절감액 | - | **월 약 2.7억** |

→ **이 프리셋 단독 결정이 서비스의 손익 분기점을 결정했음.**

### 4.5 응답 속도 — 운영 실측 3~4초대 (이전 40초대 → 10배+ 단축)

| | 실측 시점 | 비고 |
|---|---|---|
| **최악 사례** | **67초** (337자 응답) | DeepSeek V4 Flash 본문 호출이 reasoning 무시 + 큐잉/재라우팅 침묵 ([`5fb20a2`](.)) |
| 30s timeout + retry 적용 후 | 35~45초 | Promise.race 로 30s 차단 → 자동 1회 재시도 ([`5035722`](.)) |
| **현재 운영 (`grok-nothink-apr11`)** | **3~4초대** | 본문 모델 Grok 4.1 Fast 교체 + 3단계 reasoning OFF + atmosphere 병렬화 누적 결과 |
| (참고) 분위기 가이드 단일 단계 | 4.66s → 0.69s | [`702d30a`](.) 벤치마크 |

→ **40초대 → 3~4초대 약 10배 이상 단축.** 사용자 체감이 가장 크게 바뀐 부분.

---

## 5. 성능 개선 사례

### 5.1 분위기 가이드 모델 교체 — **TTFT 4.66s → 0.69s (85% 감소, 6.7배 빠름)**

**출처:** [`702d30a`](.) `perf(chat): 분위기 가이드 모델을 Flash-Lite로 교체하여 TTFT 약 4초 단축`

**문제:**
- 하이브리드 라우팅의 atmosphere(분위기) 가이드 단계가 응답 지연의 주 원인
- 분위기 가이드는 `gemini-2.5-pro` 호출 → 결과를 prompt 에 prepend 한 뒤 scene/final 시작 → 누적 4초+ 지연

**진단:**
- Pro 모델이 토큰 한도(800)까지 과잉 생성 — 3~5문장만 필요한데 한 페이지를 생성
- Flash-Lite 로 같은 프롬프트 호출 시 지시 정확 준수 + 5배 이상 빠름

**조치:**
```diff
- MAIN_MODEL_ID: 'gemini-2.5-pro'
+ MAIN_MODEL_ID: 'gemini-2.5-flash-lite'
- maxOutputTokens: 800
+ maxOutputTokens: 400
```

**검증:** 벤치마크 평균 **4.66s → 0.69s** (5회 평균)

---

### 5.2 프롬프트 압축 — **턴당 비용 34원 → 23원 (32% 절감)**

**출처:** [`6b4721e`](.) `perf(chat): 프롬프트 압축 및 히스토리/출력 제한으로 턴당 비용 34→23원 절감`

**문제:** Claude Sonnet 기반 운영에서 턴당 LLM 비용이 한국돈 34원 — 일일 활성 사용자 기준 손익 분기점 초과

**진단:**
- NARRATOR_DIRECTIVE 가 **62줄** (반복 강조 다수) — 캐싱돼도 input 토큰 누수
- 히스토리 윈도우 40개 → 메모리 요약 시스템이 있는데 중복
- 출력 토큰 평균치가 분량 가이드 부재로 비대

**조치:**
| 항목 | Before | After |
|---|---|---|
| NARRATOR_DIRECTIVE | 62줄 | **18줄 (70% 축소)** |
| 히스토리 윈도우 | 40개 | 6개 (메모리 요약과 병행) |
| 출력 가이드 | 없음 | 상한 200자 + 핑퐁 리듬 강제 |

**검증:**
- 턴당 비용 **34원 → 23원** (32% 절감)
- Sonnet 품질 유지 (Phase 4 캐싱 품질 회귀 검증 5회 완주 [`2cec40f`](.))

---

### 5.3 Anthropic 멀티턴 캐싱 — **후반 턴 약 10원/턴 절감 (-22%)**

**출처:** [`d440da7`](.) `perf(chat): Anthropic 멀티턴 캐싱으로 히스토리 토큰 비용 절감`

**문제:** 50턴+ 대화에서 매 턴마다 누적 히스토리 전체가 비캐시로 재청구

**조치:**
```typescript
// chat-prompt.builder.ts 의 ChatPromptPackage 분리
{
  anthropicStableSystemPrefix: '...',   // supreme directive · 캐릭터 · 정적 규칙
  anthropicTurnVariableSuffix: '...',   // 물리적 환경 · 메모리 요약 · 턴 목표
  openAiSystemPrompt: '...',            // 비-Anthropic 경로 호환 보존
}
```

- variable suffix 를 **user 메시지 앞에 주입** → cache prefix chain 보호
- 모든 히스토리 메시지를 **content 배열 형태로 통일** → 바이트 단위 prefix 매치 보장
- 히스토리 마지막 메시지에 `cache_control: {type:'ephemeral'}` breakpoint 추가
- 5분 TTL 의 ephemeral cache 활용

**검증:** 후반 턴 기준 **약 10원/턴 절감 (-22%)** 검증됨

---

### 5.4 atmosphere 호출 병렬화 — **추가 200~600ms 단축**

**출처:** [`319036c`](.) `perf(chat): 분위기 가이드 호출을 prompt 조립과 병렬 실행하여 첫 토큰 지연 단축`

**Before:**
```
atmosphere 호출 (1~2s)  ──► prompt build  ──► AntiLoop 추출  ──► scene LLM
└────────── 순차 ──────────┘
```

**After:**
```
atmosphere 호출 (1~2s) ─┐
prompt build  ─────────┼─► (모두 완료 await) ──► prepend ──► scene LLM
AntiLoop 추출 ─────────┘
```

- `Promise.allSettled` 패턴으로 hybrid 라우팅 직후 atmosphere 를 백그라운드 시작
- prompt build / AntiLoop 추출과 병렬 실행
- prepend 가 필요한 시점에서만 await
- **모델·프롬프트·prepend 위치/문구·에러 fallback·비용 누적·debug 로깅 100% 보존**

**검증:** 평균 200~600ms 절감

---

### 5.5 N+1 쿼리 일괄 제거 + INSERT 배치화

**출처:** [`ba7dce3`](.) `perf: N+1 쿼리 제거 — unreadCount·선제메시지 필터·환불 INSERT 배치화`

**3개 핫패스 정리:**

#### (a) chat-room.service — 방별 unreadCount
```diff
- // 각 방마다 개별 COUNT 쿼리 (N+1)
- for (const room of rooms) {
-   const count = await this.repo.count({ where: { roomId: room.id, isRead: false } });
-   room.unreadCount = count;
- }
+ // 단일 GROUP BY 쿼리로 모든 방 unread 한 번에
+ const counts = await this.repo
+   .createQueryBuilder('m')
+   .select('m.roomId', 'roomId')
+   .addSelect('COUNT(*)', 'cnt')
+   .where('m.roomId IN (:...ids)', { ids: roomIds })
+   .andWhere('m.isRead = false')
+   .groupBy('m.roomId')
+   .getRawMany();
```

#### (b) proactive-message.service — daily/unanswered count
- 방별 루프 → **FILTER + GROUP BY 단일 쿼리** (PostgreSQL `FILTER (WHERE ...)`)

#### (c) billing.service — 환불 트랜잭션
```diff
- for (const row of consumedRows) {
-   await this.transactionRepo.save({ ...row, type: 'refund' });
- }
+ await this.transactionRepo.save(consumedRows.map(r => ({ ...r, type: 'refund' })));
```

---

### 5.6 SSE Keep-alive Ping 단축 — 첫 청크 도달 시간 추가 단축

**출처:** [`01dc2fa`](.) `perf(chat): SSE keep-alive ping 간격 500ms → 100ms 단축`

**배경:**
- 앱이 OS 네이티브 네트워크 스택(Cronet/NSURLSession)으로 전환 후 응답 배칭 우회 목적은 사라짐
- 하지만 다음 안전망 역할로 ping 자체는 유지:
  - Cronet/cupertino 초기화 실패 시 IOClient fallback 경로 대응 (이 경우 여전히 응답 배칭 특성 작동)
  - 중간 Nginx/ALB 의 idle timeout 방지
  - 클라 connection 활성 유지

**효과:** 첫 청크 도달 전 체감 지연 추가 단축, 부하는 무시 가능 (3바이트 × 10/s = 30B/s)

---

### 5.7 Turbo 프리셋 — TTFT 1.5s + tail latency 0.5~1s 단축

**출처:** [`5b34ffa`](.) `perf: turbo 프리셋 추가 최적화 (historyTake 20, maxOutputTokens 2048)`

- `historyTake` 30 → 20: **입력 토큰 감소로 TTFT ~1.5s 단축**
- `maxOutputTokens` 4096 → 2048: **tail latency ~0.5~1s 단축**

---

### 5.8 Grok reasoning 차단 — 13s/턴 낭비 해결

**출처:** [`31af16f`](.) `perf: Grok reasoning 차단 + SSE 즉시 flush + typewriter dynamic rate`

**문제:**
- 프리셋 이름이 `grok-nothink-apr11` 인데도 최종 모델의 reasoning 이 켜진 채로 운영됨
- 140자 응답에 **900+ 출력 토큰 (=thinking) / 13초** 씩 소비
- ChatPresetConfig 에 `disableFinalModelReasoning` 플래그 누락이 원인

**조치:**
- ChatPresetConfig 에 플래그 추가, `grok-nothink-apr11` 에 `true` 세팅
- outputOverrides 에 `disableReasoning:true` 로 Phase 2(rest) 호출에 주입
- 동시에 SSE 즉시 flush + Nagle 해제 적용

---

### 5.9 AntiLoop 블로킹 스킵 + sceneMaxLength — 6.7s → 1.7s (4배)

**출처:** [`fe90c31`](.) `perf(scene-only-test): AntiLoop 블로킹 스킵 + sceneMaxLength 160→80`

- `preset.sceneOnly=true` 시 pre-turn AntiLoop extract 호출 스킵 (평균 4s 절감, gemini-2.5-pro lightweightModel)
- `sceneMaxLength` 160 → 80 → 출력 토큰 120 → 60 (Grok 생성 1.1s 절감)
- 6.7s → 1.7s (이론적 하한은 OpenRouter proxy TTFB ~1s 때문에 1.5s)

---

### 5.10 Phase 2 paced drainer — UX 버그 해결

**출처:** [`a9c8b3d`](.) `fix(chat): Phase 2 청크 paced drainer — "본문만 즉시 완성" UX 버그 해결`

**문제:** scene 완료 시점에 누적된 rest 버퍼를 한 번에 onChunk 로 flush → 클라 typewriter backlog 300자+ 폭주 → 8자/틱(100자/초) 가속 → Phase 2 가 시각적으로 즉시 완성됨

**조치:**
- restBuffer 를 글자 누적(restPending) + **25ms/1자 paced drainer** 로 교체
- backlog 를 50~150 구간에 가두고 ~25자/초 표시 속도 유지
- SSE 종료 전 drainer 완료를 await 해서 마지막 글자 누락 방지

---

### 5.11 Flutter 이미지 캐싱 — 재방문 시 네트워크 0 콜

**출처:** [`27b045e`](.) `perf(frontend): Image.network → CachedNetworkImage 전환으로 이미지 캐싱 적용`

- 메인 홈, 채팅 목록, 채팅 상세, 설정, 프로필 등 **10개 파일** 일괄 교체
- `Image.network` → `cached_network_image` 패키지의 `CachedNetworkImage`
- 디스크 캐싱 활성화 → 재방문 시 네트워크 요청 없이 즉시 로딩

---

## 6. 데이터·애널리틱스 인프라

> **마케팅·PM·CS 가 가설을 검증하고 광고를 운영할 수 있도록 데이터 파이프라인 전체를 직접 설계·구현.**
> Mixpanel/Meta/Firebase/OneSignal 4종 SDK 를 단일 `AnalyticsService` 진입점에서 fan-out, 11개 이벤트 + 10 User Property + iOS SKAN 6밴드 매핑까지 단독 구축.

### 6.1 SDK 통합 4종 — 왜 이 조합인가

| SDK | 역할 | 도입 근거 |
|---|---|---|
| **Mixpanel** | 사내 제품 분석 (가설 검증, 코호트, 퍼널) | 이벤트 기반 분석에 강함, 마케터/PM 이 직접 대시보드 구성 가능 |
| **Meta (Facebook)** | Meta 광고 최적화 + iOS SKAN(메타 사서함) | 한국 시장 Meta 광고 비중 高, 표준 이벤트명 (`fb_mobile_purchase` 등) 매핑 필요 |
| **Firebase / GA4** | Google Ads 광고 최적화 + iOS SKAN(구글 사서함) + 자동 `screen_view` | Google Ads 1순위 전환 송신용, `FirebaseAnalyticsObserver` 로 화면 추적 자동화 |
| **OneSignal** | 푸시 발송 + 클릭 어트리뷰션 | FCM 직접 사용 시 OneSignal 과 충돌 → OneSignal 단일화 |
| ~~AppsFlyer~~ | 멀티채널 어트리뷰션 | **제거됨** ([`3233a12`](.)) — 영업팀 미팅 후 비용 대비 효용 낮다고 판단, 채널별 1순위 어트리뷰션으로 전환 |

### 6.2 Fan-out 아키텍처 — 단일 진입점

진입점: [`frontend/app/lib/application/analytics/analytics_service.dart`](frontend/app/lib/application/analytics/analytics_service.dart)

```dart
// 단일 호출이 3중 SDK 로 자동 분기
AnalyticsService.logEvent('chat_message_sent', properties: {...});
    ├─→ Mixpanel.track()
    ├─→ FacebookAnalyticsService.logEvent()  // 표준명 매핑 + SKAN 트리거
    └─→ FirebaseAnalyticsService.logEvent()  // GA4 표준명 매핑 + Google Ads 전환

// User Property 도 동일 fan-out
AnalyticsService.setUserProperties({...});
    ├─→ Mixpanel.people.set()
    └─→ FirebaseAnalyticsService.setUserProperties()

// 결제는 별도 분리 (KRW value/currency 필수 표준)
PurchaseAnalytics.completed(...);
    ├─→ Meta logPurchase(amount, KRW)
    └─→ Firebase logPurchase(amount, KRW)
```

**왜 이 구조:**
- 새 이벤트 추가 시 발화부 한 곳만 손대면 3중 SDK 전체에 자동 송신
- Facebook 표준 이벤트 매핑 (`signup_completed` → `fb_mobile_complete_registration` 등) 은 어댑터 레이어에서 자동
- ATT 거부 / GDPR 거부 같은 정책 응답을 단일 게이트웨이에서 일관 처리
- 메타에 보내면 안 되는 이벤트는 `_skipEvents` 셋으로 명시

### 6.3 택소노미 v1.0 — 11 이벤트 (★ 가설 핵심 / ★★ 북극성)

원본 명세: `docs/DEEPER 이벤트 택소노미 v1.0 (260507).xlsx`
구현 가이드: `docs/analytics/events.md`

| # | 이벤트 | 카테고리 | 핵심 속성 |
|---|---|---|---|
| 1 | `app_first_open` | 유입 | `install_source` |
| 2 | `signup_completed` | 가입 | `auth_method` (`kakao`/`apple`/`google`) |
| 3 | `app_opened` | 리텐션 | `days_since_signup`, `is_returning` (백그라운드 30초+ 재진입만) |
| 4 | **`chat_message_sent`** ★★ | 코어 | `spark_source` ★, `was_mixed_deduction` ★, `lifetime_message_count`, `spark_balance_after_free/paid` |
| 5 | `rewarded_ad_completed` | 광고 | `daily_ad_views_used` ★, `spark_amount`, `days_since_signup` |
| 6 | **`spark_low_modal_viewed`** ★ | 퍼널 | `ad_available` ★, `modal_type`, `ad_limit_reached_count` ★ |
| 7 | `store_viewed` | 퍼널 | `entry_point` (`spark_low_modal`/`settings`/`banner`) |
| 8 | `purchase_initiated` | 퍼널 | `product_id`, `product_price_krw` |
| 9 | **`purchase_completed`** ★★ | 북극성 | `is_first_purchase` ★, `days_since_signup` ★, `was_ad_limit_reached_today` ★, `ad_limit_reached_count_at_purchase` ★★, `lifetime_ad_views_at_purchase` ★, `transaction_id` (중복 방지) |
| 10 | `purchase_failed` | 퍼널 | `error_code` (8단계 분류: `user_cancelled`/`store_unavailable`/`verification_failed`/...) |
| 11 | `chat_session_ended` | 이탈 | `session_message_count`, `exit_reason` ★ (`back_button`/`app_background`/`spark_exhausted`) |
| 12 | `chat_milestone_4` | SKAN | 누적 메시지 4회 도달 시 1회 — **메타 SKAN CV 슬롯 매핑용** ([`0630693`](.)) |

### 6.4 User Property 10종 — `LifetimeCounters` 인프라

| 속성 | 갱신 시점 | 책임 클래스 |
|---|---|---|
| `user_id` | 가입 시 1회 | `AnalyticsService.identify()` |
| `signup_date` | `signup_completed` | 발화부 |
| `acquisition_source` | `app_first_open` | 발화부 |
| `lifetime_message_count` ★ | `chat_message_sent` 마다 +1 | `LifetimeCounters` |
| `lifetime_ad_views` ★ | `rewarded_ad_completed` 마다 +1 | `LifetimeCounters` |
| **`ad_limit_reached_count`** ★★ | **광고 한도 도달 + 잔액 0 동시 충족 시 +1 (1일 1회)** | `LifetimeCounters.markAdLimitReached()` |
| `days_since_first_ad_limit` ★ | 위 카운터가 처음 1 될 때 1회 | `LifetimeCounters` |
| `lifetime_purchase_count` | `purchase_completed` 마다 +1 | `LifetimeCounters` |
| `first_purchase_date` ★★ | `is_first_purchase=true` 결제 시 1회 | 발화부 |
| `last_active_date` ★ | `app_opened` 마다 갱신 | 발화부 |

신규 인프라 클래스:
- **`LifetimeCounters`** — 누적 카운터 (SharedPreferences), `markAdLimitReached()` 가 같은 날 중복 호출 무시 로직 포함
- **`DailyAdCounter`** — 일일 광고 카운터, **KST 자정 리셋**, `adLimitReachedToday()` 로 당일 결제 전환 측정
- **`UserSession`** — 가입일/마지막 활동일/첫 결제일 timestamp, `daysSinceSignup()` 같은 파생 속성 산출
- **`ChatSessionTracker`** — 세션당 메시지 카운트 + 이탈 사유 자동 판정 (4 hook 지점: `_onChatRouteVisible/Hidden`, `didChangeAppLifecycleState`, `dispose`)

### 6.5 가설 검증 — 북극성 KPI

> **"광고 한도 2번+ 도달한 유저 → 7일 내 결제 전환"**

이 가설을 Mixpanel 코호트 분석으로 검증하려면 다음 3개가 정확해야 함:
- `ad_limit_reached_count` (User Property)
- `was_ad_limit_reached_today` (`purchase_completed` 속성)
- `days_since_signup` (가입 후 경과)

→ 이 셋의 산출 정확도가 곧 가설 검증 가능성. 그래서 `chat_message_sent` / `spark_low_modal_viewed` / `purchase_completed` 의 속성 산출 로직이 가장 정교하게 구현됨.

### 6.6 iOS SKAN 6밴드 어트리뷰션

**SKAdNetworkItems 152개 일괄 등록** ([`08835bb`](.)) — 기존 3개 → 152개로 확장

```
Before: AdMob 1 + Meta 2 = 3개
After:  AppLovin master endpoint 의 152개
        (Meta / Google / AdMob / Unity / AppLovin / IronSource 등 메이저 네트워크 망라)
```

→ iOS 14.5+ ATT 거부 유저의 어트리뷰션을 SKAN 경로로 정상 수집 가능

**SKAN CV 6밴드 매핑:**
- `chat_message_sent` → SKAN 11~20 밴드
- `spark_low_modal_viewed` → SKAN 21~30 밴드
- `chat_milestone_4` → SKAN CV 슬롯 (메타 이벤트 매니저에서 매핑)
- `purchase_completed` → 최상위 CV
- Info.plist 에 `FacebookAutoLogAppEventsEnabled` / `FacebookAdvertiserIDCollectionEnabled` 추가로 메타 SDK SKAN CV 자동 갱신 활성

### 6.7 안전장치 (실수 / 회귀 방지)

| 안전장치 | 의도 | 출처 |
|---|---|---|
| **결제 이벤트 `kReleaseMode` 가드** | debug/profile 빌드의 결제 테스트가 광고 학습 데이터 오염시키지 않게 차단 | [`1d3c41c`](.) |
| **ATT 거부 시 GA4 수집도 자동 OFF** | `setAnalyticsCollectionEnabled(false)` — Apple/GDPR 정책 일관성 | [`0498fe2`](.) |
| **`chat_message_sent` 발화 보장** | 카운터 실패 시에도 이벤트 보냄 — 북극성 이벤트 누락 차단 | [`a294f1d`](.) |
| **purchase 중복 발화 방지** | SharedPreferences 에 `transaction_id` 기록, 발화 전 체크 | events.md |
| **Mixpanel email super property + 로그아웃 unregister** | 로그아웃 후 새 distinct_id 에 이전 email 묻어가는 문제 차단 | [`cd2c38b`](.) |
| **가입일을 서버 createdAt 으로 동기화** | 로컬 SharedPreferences 만으로 산출 시 재설치 후 잘못된 D+0 처리 방지 | [`b4a351d`](.) |
| **메타에 안 보낼 이벤트 명시** | `FacebookAnalyticsService._skipEvents` 셋으로 `rewarded_ad_completed` 같이 표준 매핑 없는 이벤트 차단 | 택소노미 명세 |

### 6.8 문서화

직접 작성한 분석 가이드 문서 (개발자 → 마케터/PM 인수인계용):

```
docs/analytics/
├── README.md            — SDK 목록 / fan-out 다이어그램 / 가설 / 책임 분리
├── events.md            — 11개 이벤트 명세 + 발화 위치 + 핵심 코드 스니펫
├── user-properties.md   — 10 User Property + 갱신 책임자
├── firebase-ga4.md      — Firebase/GA4/구글 SKAN/푸시 클릭 어트리뷰션 통합 가이드
└── verification.md      — Mixpanel Live View / Meta 이벤트 관리자 / GA4 DebugView 검증 절차
```

→ 운영 단계에서 마케터가 SDK 콘솔에서 직접 검증할 수 있도록 verification 가이드까지 작성.

---

## 7. 안정성·정합성 설계

### 7.1 결제·과금 시나리오 방어

| 실제 운영 사고 시나리오 | 방어 |
|---|---|
| 모바일 망 단절 → 클라 재시도 → 같은 메시지 2번 결제 | **멱등성 키** + 30초 윈도우 + Jaccard 0.55 near-duplicate 차단 |
| 잔액 0 사용자가 무료로 무한 호출 | 메시지 전송 전 **잔액 사전 차감** (Pessimistic Lock) |
| AI 호출 실패 시 잔액 반환 누락 | `ConsumedRow[]` 기록 → 배치 환불 INSERT |
| Android 결제 결제액 누락 | [`dc8f05f`](.) 보정 + 과거 데이터 백필 엔드포인트 |
| Apple JWS 검증 실패로 결제 영수증 검증 4040010 | [`4e51fb2`](.) **로컬 검증 도입**으로 해결 |
| 광고 보상 횟수 무제한 악용 | DB `ad_reward_config` 테이블 + KST 자정 리셋 + 일 5→1회로 축소 |

### 7.2 검열·심사 대응

- **NSFW 검열**: 미인증 사용자 차단 + 콘텐츠 필터 감지 시 **태그 기반 캐릭터 거절 메시지** 시스템 ([`8395aea`](.))
  - tag (sexual/violent/drug/minor/general) 별로 캐릭터 말투의 거절 메시지를 DB 캐싱
  - 없으면 Gemini Flash 로 캐릭터 말투의 거절 메시지를 자동 생성·저장
- **Apple Guideline 1.2 (크리에이터 차단)** 대응 기능 추가 ([`e402d9d`](.))
- 운영모드(release)에서 에러코드 숨김 (`kDebugMode` 체크)
- 민감정보 로그 제거·미사용 권한 정리 ([`dedca63`](.))

### 7.3 푸시 알림 버그 사례

**[`b34b930`](.) `fix(nudge): 나간 방·삭제된 방·알림 OFF 유저에게 nudge 발송되던 버그 수정`**

- reply-nudge processor 가 방/유저 상태 검사를 안해서 잘못 발송됨
- 방 검사: `endedAt IS NULL, deleted=false, notificationEnabled=true`
- 유저 검사: `deletedAt IS NULL, suspendedUntil 미만료, proactiveMessageEnabled=true`
- 부적격이면 log 의 repliedAt 을 마킹해 **영구 retire** (cron 재픽업 차단)

**[`fbd65f0`](.) `fix(push): 캐릭터 profileImageUrl http→https 자동 정규화로 푸시 아바타 누락 해결`**

- 레거시 http:// URL 1건이 Android cleartext 정책 / iOS ATS 에 막혀 푸시 아바타가 기본 실루엣으로 떨어짐
- 클라이언트 정책을 풀면 스토어 심사 리스크 → 백엔드 출구에서 정규화
- **TypeORM column transformer** 로 SELECT 시 자동 https 변환 (매퍼 11곳 무손)
- `LocalFileUploader.buildUrl` 은 production 에서 https 강제 (저장 시점 재발 방지)

---

## 8. 기능 구현 하이라이트

### 8.1 멀티 AI 모델 카탈로그 (DB 기반 런타임 ON/OFF)

```typescript
// backend/src/modules/chat/ai-models.config.ts
export const AI_MODELS: AiModel[] = [
  { id: 'gpt-4o', provider: 'openai', cost: 3, ... },
  { id: 'gpt-4o-mini', provider: 'openai', cost: 1, ... },
  { id: 'gemini-2.5-flash', provider: 'gemini', cost: 1, ... },
  { id: 'gemini-2.5-pro', provider: 'gemini', cost: 3, ... },
  { id: 'claude-sonnet-4-5', provider: 'anthropic', cost: 5, ... },
  { id: 'claude-haiku-4-5', provider: 'anthropic', cost: 1, ... },
  { id: 'grok-4.1-fast', provider: 'openrouter', cost: 2, ... },
  { id: 'deepseek-3.1', provider: 'openrouter', cost: 1, ... },
  // ... 20+ 개
];

// selectable_models DB 테이블이 관리자가 런타임에 노출할 모델을 결정
// 비용/온도/max_tokens 도 코드 변경 없이 DB 에서 설정
```

### 8.2 캐릭터별 다국어 시스템 프롬프트

- `Character.language` (`ko`|`ja`|`zh-TW`) 컬럼으로 분기
- supreme/scene/rest/sceneRetry 4개 phase prompt 의 suffix 가 언어별로 분리 ([`bd16f5b`](.))
- 캐릭터 system prompt 컬럼 추가 ([`5329c45`](.))
- 운영 DB 다국어 마이그레이션 SQL 포함 ([`544ed62`](.))

### 8.3 Deferred Deep Link

```
Android: Play Install Referrer API + Meta SDK → 설치 후 자동 캐릭터 진입
iOS:     서버 IP fingerprint (Redis 10분 TTL GETDEL)
```

- 처음에 Postgres 로 구현했다가 **Redis 로 전환** ([`2c2b913`](.))
  - 10분 짧은 TTL + 단순 IP 키 조회 특성상 Redis 가 정석
  - BullMQ/auth 가 이미 쓰는 Redis 인스턴스 그대로 활용
  - `SET ip→characterId EX 600` / `GETDEL` 으로 원자적 매칭
  - DB 엔티티/마이그레이션/sweep 로직 모두 제거

### 8.4 분위기·반복방지·메모리 — 장기 컨텍스트 일관성

| 시스템 | 역할 |
|---|---|
| **atmosphere (분위기) 가이드** | scene/final 이 행동·대사를 만들기 전 "지금 분위기" 를 결정해 캐릭터 톤을 일관되게 유지 |
| **AntiLoop / 반복방지** | 100턴짜리 대화에서 같은 말이 반복되는 것 방지 |
| **story context 추출** | 이전 사건이 잊히는 것 방지 |
| **scene 버퍼링** | scene 은 묘사 텍스트라 부적절·반복 판정 시 회수 가능해야 함 → 검증 후 한 번에 flush |
| **메모리 요약 (BullMQ)** | 20개 메시지마다 short/mid/long 토큰 계층 요약을 백그라운드에서 생성 |

### 8.5 어드민 진단 도구

- **실시간 로그 SSE 뷰어**: 모든 HTTP 요청/응답을 인터셉트해 인메모리 링버퍼(1000개) + DB 영구 저장, SSE 로 실시간 스트리밍
  - SSE 인증: `EventSource` 가 헤더를 지원하지 않으므로 query param 으로 JWT 전달
- **지난 로그 조회**: 날짜/시간 범위 + method/level/keyword 필터
- **채팅 로그**: 전체 채팅방 enumerate + 메시지 열람
- **test-chat 모듈**: chat (실서비스) 와 분리된 모델 비교 도구. idempotency·검열·과금 같은 운영 로직을 의도적으로 빼고 모델 응답 속도/품질만 비교 가능

---

## 9. 운영·인프라

### 9.1 배포 파이프라인

```
[GitHub Push to dev/prod]
        │
        ▼
[GitHub Actions]
   ├─ Backend: SSH + rsync dist/ → EC2 → pm2 restart
   └─ Web:     Vite build → S3/CloudFront
```

- 브랜치별 SSH 키 분리 (dev/prod)
- PM2 ecosystem.config.cjs: `fork` 모드 + `max_memory_restart 1G` + pm2-logrotate (50MB / 60일)

### 9.2 Nginx 설정 포인트

```nginx
# SPA 라우팅
location / { try_files $uri $uri/ /index.html; }

# API 프록시 — `proxy_pass` 끝 `/` 로 `/api` 접두사 제거
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_read_timeout 86400s;
}

# SSE 전용 regex location — query string 보존 필수
location ~ ^/chat/rooms/.*/messages$ {
    proxy_pass http://127.0.0.1:3000$uri$is_args$args;
    proxy_buffering off;
}
```

### 9.3 시간대·KST 정책

- 코드와 DB 양쪽에서 `TZ=Asia/Seoul` 고정
- 프록액티브 메시지 / 일일 광고 보상 / 분석 이벤트 등 KST 의존 로직 안전
- 매일 KST 21시 active room 일괄 push 발송 ([`dbfce3d`](.))

---

## 10. 트러블슈팅 사례

### 10.1 "웹은 빠른데 앱은 첫 토큰까지 3초"

**전수 진단 문서:** [`docs/2026-05-05_web-vs-app-chat-latency.md`](docs/2026-05-05_web-vs-app-chat-latency.md)

**진단 과정:**
1. Flutter 측에 진단용 Stopwatch 를 심어 단계별 시간 측정
2. 토큰 조회 9ms / 헤더 수신 454ms / 첫 ping 3ms — 클라이언트 비용은 모두 정상
3. 첫 `data:` 라인까지 **3303ms** 가 백엔드 지연으로 확정
4. 웹 Network 탭으로 확인: **웹과 앱이 다른 엔드포인트를 호출하고 있었음**
   - 웹: `/api/test-chat/rooms/.../messages` (어드민 모델 비교 도구)
   - 앱: `/api/chat/rooms/.../messages` (실서비스 풀 파이프라인)

**결론:**
- "앱이 단일 모델이라 느린 게 아니라, 앱은 무거운 풀 파이프라인을, 웹은 경량 직접 호출을 탄 것"
- test-chat 의 빠름은 안전·과금·품질·일관성 책임을 덜어낸 대가 → 실서비스에 그대로 적용 불가
- 구조를 망치지 않는 선에서 atmosphere 호출 병렬화 ([`319036c`](.)) 로 200~600ms 절감 + UX 측면에서 typing 인디케이터 추가

### 10.2 SSE 청크 경계에서 한글 깨짐

**[`1a36ddd`](.) `fix(web): reassemble SSE stream chunks across read boundaries`**
**[`ca0bff6`](.) `fix(app): robust SSE decoding and timeout for chat streaming`**

- UTF-8 멀티바이트 한글이 chunk 경계에서 잘리는 문제
- 웹: chunk 를 reassemble 하는 buffer 로직 추가
- 앱: chunk 경계를 넘는 UTF-8 디코딩 + receive timeout 설정

### 10.3 drainer 속도/문자 깨짐 반복 튜닝

**커밋:** [`6148520`](.), [`4c5af1d`](.), [`42def07`](.) `drainer 속도 개선` / `문자깨짐 방지처리를 한 drainer처리`

- Phase 2 청크를 paced drainer 로 처리하면서 글자 누락/속도 문제 반복 발견
- 1차 개선 → 오류 발생 원복 → 2차 문자깨짐 방지 추가 → 최종 안정화
- 현장에서 사용자 피드백을 반영하며 점진 개선한 사례

### 10.4 모듈 분리 결정의 정당성

**chat vs test-chat 모듈을 의도적으로 분리:**

| | chat (실서비스) | test-chat (어드민) |
|---|---|---|
| 사용자 | 일반 사용자 (수만 명) | 운영자 / 개발자 (소수, 내부) |
| 핵심 가치 | 안전·과금·품질·일관성 | 모델 후보 비교 속도 |
| idempotency 검사 | ✓ | ✗ |
| NSFW 검열 | ✓ | ✗ |
| 잔액 사전 차감 | ✓ | ✗ |
| atmosphere 가이드 | ✓ | 병렬 처리 |
| scene 버퍼링 | ✓ | 첫 청크 즉시 |

→ test-chat 의 "빠름" 은 책임을 덜어낸 대가. 실서비스에 그대로 적용하면 사고가 남.

---

## 11. 기술 스택 전체

### Backend
| 구분 | 기술 |
|------|------|
| 프레임워크 | NestJS 11 (Fastify 어댑터) |
| 언어 | TypeScript 5.7 |
| ORM | TypeORM 0.3 |
| 데이터베이스 | PostgreSQL 16 |
| 캐시/큐 | Redis 7 + BullMQ |
| 인증 | Passport (JWT, Google/Kakao/Apple OAuth) |
| AI | OpenAI · Gemini · Anthropic · Grok · DeepSeek · OpenRouter (20+) |
| 검증 | class-validator, class-transformer |
| 푸시 | OneSignal |

### Web Frontend
| 구분 | 기술 |
|------|------|
| 프레임워크 | React 19.2 |
| 빌드 도구 | Vite 7.2 |
| 언어 | TypeScript 5.9 |
| 라우팅 | React Router DOM 7 |
| 상태관리 | Zustand 5 |
| 스타일링 | Tailwind CSS 4 |
| HTTP | fetch + EventSource (SSE) |

### Mobile App
| 구분 | 기술 |
|------|------|
| 프레임워크 | Flutter |
| 언어 | Dart 3.10 |
| 상태관리 | Riverpod 2.6 (code generation) |
| 라우팅 | Go Router 14.6 (deep link 지원) |
| HTTP | Dio (SSE streaming + 토큰 갱신 인터셉터) |
| 이미지 캐싱 | cached_network_image |
| 인앱결제 | in_app_purchase + Apple JWS 로컬 검증 |
| 푸시 | OneSignal SDK |

### 인프라
| 구분 | 기술 |
|------|------|
| 컴퓨팅 | AWS EC2 |
| CDN | S3 + CloudFront (Web) |
| 컨테이너 | Docker Compose (PostgreSQL + Redis) |
| 프로세스 매니저 | PM2 (fork mode) |
| 웹 서버 | Nginx (SSE 호환 설정) |
| CI/CD | GitHub Actions (dev/prod 브랜치별 SSH 키) |
| 로깅 | 인메모리 링버퍼 + PostgreSQL + SSE 실시간 뷰어 |
| 분석 | Mixpanel + SKAdNetwork (iOS) |

---

## 12. 한 줄 요약

> **"실시간 AI 채팅" 이라는 단일 핵심 시나리오를 안정적으로 흘리기 위해**
> Fastify(저수준 SSE 제어) + Redis(토큰·큐) + BullMQ(AI 부하 격리) + Pessimistic Lock(화폐 안전) +
> 멱등성 키(이중 차감 방지) + 멀티 모델 카탈로그(비용·품질 튜닝) 가 골격을 이루고,
> 그 위에 OAuth 3종 · OneSignal 푸시 · Flutter+Web 클라이언트 · Mixpanel/Meta/Firebase 4종 fan-out 애널리틱스가 얹힌 구조.
>
> **3.5개월 동안 1,181 커밋, 약 10만 줄을 풀스택 단독으로 운영하면서:**
> - **AI 비용 약 7배 절감** (운영 실측 Sonnet 35원/턴 → `grok-nothink-apr11` 5원대/턴, 본문 단독으로는 13배)
> - **응답 시간 10배+ 단축** (운영 실측 40초대 / 최악 67초 → 3~4초대)
> - **데이터 파이프라인 단독 구축** — 11 이벤트 + 10 User Property + iOS SKAN 152개 등록까지
>
> 모든 정량 임팩트를 git 로그·코드 주석·docs/analytics 에 출처 가능한 형태로 남겨두었습니다.
