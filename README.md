# AutoPilot — AI 업무 보조 SaaS (프로토타입)

이메일 우선순위 분류·요약, 답장 초안, 문서 생성, 자연어 자동화 규칙을 한 화면에서 다루는 한국어 업무 보조 SaaS 프로토타입입니다.
OpenAI·Anthropic·Google 모델을 하나의 라우터 뒤에 두고, 사용자가 자기 API 키(BYOK)를 쓰거나 플랫폼 크레딧을 쓰도록 설계했습니다.

![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_·_Auth_·_RLS-3ECF8E?logo=supabase&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash_Redis-rate_limit_·_cache-00E9A3?logo=upstash&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

> **상태: 프로토타입(개발 중단).** AI 라우터, 이메일 분석·답장 API, 문서 생성, 정기결제 크론, 대시보드 UI 는 구현돼 있습니다.
> 다만 Gmail·Outlook 등에서 메일을 실제로 가져오는 수집기와, 자동화 규칙을 실행하는 엔진은 구현되지 않았습니다
> (외부 서비스 연동 화면은 "준비 중"으로 표시되고, 웹훅 수신 시에는 실행 기록만 남깁니다). 실서비스로 운영되지 않았습니다.

---

## 무엇을 하려 했나

| 기능 | 구현 위치 |
|---|---|
| 이메일 우선순위(긴급·중요·일반·스팸) 분류, 3줄 요약, 할 일 추출 | `POST /api/inbox/analyze` |
| 톤별 즉시 답장 3종, 답장 초안 | `/api/inbox/instant-replies`, `/api/inbox/draft` |
| 스누즈·별표·발신자 차단·리마인더·스니펫·집중 모드 | `/api/inbox/*`, `/api/user/focus-mode` |
| "긴급 메일 오면 Slack 으로 알려줘" 같은 문장 → 자동화 규칙(JSON 노드/엣지) | `POST /api/automations/parse`, 템플릿 20종 `src/lib/automation-templates.ts` |
| 보고서·제안서·회의록 등 문서 생성 후 저장 | `POST /api/documents/generate` |
| 토스페이먼츠 빌링키 정기결제, 결제 실패 처리 | `/api/billing/*`, `/api/cron/billing` |
| 전날 메일 요약 다이제스트 발송 | `/api/cron/email-digest` (Resend) |
| AI 비용·자동화 실행·우선순위 분포 차트 | `/analytics` (Recharts) |

## 아키텍처

```
브라우저 — Next.js 14 App Router (대시보드, ⌘K 커맨드 팔레트, 키보드 단축키)
   │
   ▼
Route Handlers (src/app/api/*, 26개)
   │  공통: 인증 확인 → Upstash 슬라이딩 윈도우 레이트리밋 → 입력 검증 (src/lib/api-utils.ts)
   │
   ├── src/lib/ai/router.ts      모든 AI 호출의 단일 진입점
   │      응답 캐시(Redis) → 사용자 설정 조회(5분 캐시) → BYOK / 플랫폼 키 선택
   │      → OpenAI · Anthropic · Gemini 호출 → 실패 시 플랫폼 gpt-4o-mini 로 폴백
   │      → 크레딧 차감 · 사용량/비용 로그
   ├── src/lib/crypto.ts         AES-256-GCM (Web Crypto) — BYOK 키·빌링키 암호화
   ├── src/lib/payments/toss.ts  빌링키 발급·청구, 웹훅 HMAC-SHA256 검증
   └── src/lib/email.ts          Resend 발송
   │
   ▼
Supabase Postgres + Auth — 15개 테이블, 전 테이블 RLS (supabase/migrations/001_initial.sql)
Vercel Cron — 매일 00:00 UTC 정기결제 · 다이제스트
```

## 기술적으로 집중한 문제

### 1. 여러 AI 제공자와 두 가지 과금 방식을 한 곳에서 처리
- **문제**: 기능마다 OpenAI·Anthropic·Gemini SDK 를 직접 부르면 키 관리, 크레딧 차감, 비용 기록, 장애 처리가 기능 수만큼 흩어집니다.
- **해결**: 모든 기능이 `callAI({ task, input, userId })` 하나만 호출하도록 `src/lib/ai/router.ts` 를 만들었습니다.
  - 사용자 모드가 BYOK 면 DB 에 암호화된 사용자 키를 복호화해 해당 제공자로 호출하고 크레딧을 차감하지 않습니다.
  - 플랫폼 모드면 선택 모델의 제공자를 골라 플랫폼 키로 호출한 뒤, 사용 토큰만큼 크레딧을 차감합니다.
  - 1순위 호출이 실패하면 플랫폼 `gpt-4o-mini` 로 재시도합니다.
  - 모델별 단가표로 원화 비용을 계산해 `ai_usage_logs` 에 비동기로 기록하고, 이를 분석 대시보드에 씁니다.
- **비용 방어**: 입력은 8,000자로 자르고(분석 API 는 본문 3,000자), 같은 작업·입력·모델 조합은 Redis 에 24시간 캐시합니다(문서 생성·일반 대화 제외).

### 2. 사용자 API 키와 결제 빌링키 보관
- BYOK 키와 토스 빌링키는 저장 전에 AES-256-GCM(랜덤 IV)으로 암호화하고, 복호화는 서버의 라우터·결제 크론에서만 합니다.
- 키 등록 시 `/api/ai/validate-key` 로 실제 호출이 되는지 먼저 확인합니다.
- `ENCRYPTION_KEY` 길이(64자리 hex)를 검증해 잘못된 키로 조용히 암호화되는 일을 막았습니다.

### 3. 정기결제 크론의 중복 청구 방지
- 당일 결제 대상 구독을 조회한 직후 전부 `processing` 상태로 바꾼 뒤 청구합니다. 크론이 겹쳐 실행돼도 같은 구독을 두 번 청구하지 않게 하려는 장치입니다.
- 성공하면 다음 결제일과 AI 크레딧을 갱신하고, 실패하면 `past_due` 로 바꾸고 결제 실패 메일을 보냅니다.
- 토스페이먼츠 웹훅은 HMAC-SHA256 서명을 검증한 뒤에만 처리합니다.

### 4. API 남용과 데이터 격리
- Upstash 슬라이딩 윈도우 레이트리밋(사용자당 분당 100회)을 공통 유틸로 적용하고, Redis 장애 시에는 서비스가 멈추지 않도록 통과(fail-open)시킵니다.
- 모든 테이블에 RLS 를 걸어 사용자는 자기 행만 접근하고, 크론·웹훅처럼 사용자 세션이 없는 작업만 서비스 롤 클라이언트를 씁니다.
- 알림 규칙 수정 API 는 허용 필드 화이트리스트로 Mass Assignment 를 막았습니다.

### 5. 과장 표현 정리
초기 랜딩 페이지에 있던 검증할 수 없는 사용자 수·만족도 수치와 가상 후기, 구현되지 않은 연동 기능 문구를 v1.2 에서 모두 걷어내고,
미구현 연동은 "준비 중"으로 표시하도록 바꿨습니다(커밋 `feat: v1.2 — 허위·과장 표현 제거 ...`).

## 품질 확인

- 자동화된 테스트 코드는 없습니다.
- `npm run build` 는 통과합니다. 다만 개발 중 설정으로 `next.config.mjs` 에서 빌드 시 타입·린트 오류를 무시하고 있으며,
  `npx tsc --noEmit` 과 `npm run lint` 에는 정리되지 않은 오류(미사용 변수, `any` 사용, Recharts 포매터 타입 등)가 남아 있습니다.

## 실행 방법

```bash
npm install
cp .env.example .env.local   # Supabase·AI 키 등 입력
npm run dev                  # http://localhost:3000
npm run build
```

DB 는 Supabase 프로젝트의 SQL Editor 에서 `supabase/migrations/001_initial.sql` 을 실행해 만듭니다(테이블·RLS·인덱스·트리거 포함).

## 설정

| 구분 | 환경변수 |
|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 플랫폼 AI 키 | `PLATFORM_OPENAI_API_KEY`, `PLATFORM_ANTHROPIC_API_KEY`, `PLATFORM_GOOGLE_AI_API_KEY` |
| 암호화 | `ENCRYPTION_KEY` (`openssl rand -hex 32`) |
| 레이트리밋·캐시 | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| 결제 | `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY`, `TOSS_PAYMENTS_SECRET_KEY`, `TOSS_PAYMENTS_WEBHOOK_SECRET` |
| 메일 | `RESEND_API_KEY` |
| 크론·앱 | `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` |

예시 값은 [`.env.example`](./.env.example) 에 있습니다. 크론 스케줄은 `vercel.json` 에 정의돼 있습니다.

## 개발 방식

Claude Code 와 함께 설계·구현했습니다.
