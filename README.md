# AutoPilot — AI 기반 업무 자동화 SaaS

> 이메일 분석, 문서 생성, 워크플로우 자동화를 하나의 플랫폼으로.
> 한국 중소기업과 개인 사업자를 위한 AI 업무 보조 서비스입니다.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## 목차

1. [서비스 개요](#서비스-개요)
2. [핵심 기능](#핵심-기능)
3. [기술 스택 및 아키텍처](#기술-스택-및-아키텍처)
4. [디렉터리 구조](#디렉터리-구조)
5. [데이터 흐름 및 주요 로직](#데이터-흐름-및-주요-로직)
6. [API 엔드포인트 목록](#api-엔드포인트-목록)
7. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
8. [Supabase DB 초기화](#supabase-db-초기화)
9. [환경변수 설정](#환경변수-설정)
10. [Vercel 배포](#vercel-배포)
11. [구독 플랜 및 가격](#구독-플랜-및-가격)
12. [보안 설계](#보안-설계)

---

## 서비스 개요

AutoPilot은 **이메일 AI 분석 + 워크플로우 자동화 + 문서 생성**을 통합한 한국 시장 대상 SaaS입니다.

**비교 대상 서비스**와의 차별점:

| 기능 | AutoPilot | Superhuman | SaneBox | Zapier |
|------|-----------|-----------|---------|--------|
| AI 이메일 분석 | ✅ | ✅ | ✅ | ❌ |
| Split Inbox (카테고리 분리) | ✅ | ✅ | ✅ | ❌ |
| Instant Reply (즉시 답장 3종) | ✅ | ✅ | ❌ | ❌ |
| Command Palette (⌘K) | ✅ | ✅ | ❌ | ❌ |
| 발신자 차단 (BlackHole) | ✅ | ❌ | ✅ | ❌ |
| Focus Mode / DND | ✅ | ❌ | ✅ | ❌ |
| 키보드 단축키 (12종) | ✅ | ✅ | ❌ | ❌ |
| 워크플로우 자동화 | ✅ | ❌ | ❌ | ✅ |
| 문서 AI 생성 | ✅ | ❌ | ❌ | ❌ |
| BYOK (내 API 키 사용) | ✅ | ❌ | ❌ | ❌ |
| 한국어 최적화 | ✅ | ❌ | ❌ | ❌ |
| 토스페이먼츠 결제 | ✅ | ❌ | ❌ | ❌ |
| 월 구독료 | ₩9,900~ | $30 | $7 | $20~ |

---

## 핵심 기능

### 1. AI 이메일 인박스 (Superhuman + SaneBox 급)

이메일을 연동하면 AI가 자동으로 분류·분석합니다.

- **Split Inbox**: 이메일을 중요 / 팀 / VIP / 뉴스레터 / 알림으로 자동 분류 (Superhuman 스타일)
- **우선순위 분류**: `urgent` / `important` / `normal` / `spam` 4단계
- **AI 요약**: 이메일 본문을 3줄 이내로 요약
- **액션 아이템 추출**: 답장 필요, 회의 수락 등 해야 할 일을 리스트로 추출
- **Instant Reply (즉시 답장 3종)**: 정중한 / 친근한 / 간결한 3가지 톤의 답장을 AI가 즉시 생성
- **답장 초안 생성**: 클릭 한 번으로 상세 비즈니스 답장 초안 작성
- **스누즈**: 1시간 후 / 3시간 후 / 오늘 저녁 / 내일 오전 / 다음 주 중 선택
- **별표 (Star)**: 중요 이메일을 별표로 즐겨찾기
- **발신자 차단**: 스팸 발신자를 원클릭 차단 (SaneBox BlackHole 방식)
- **Focus Mode**: 긴급/중요 이메일만 표시하는 집중 모드 (DND)
- **Inbox Zero**: 모든 이메일 처리 시 축하 화면 표시
- **스니펫**: 자주 쓰는 답장 문구를 `/thanks`, `/accept` 등 단축키로 저장
- **키보드 단축키 12종**: `j/k` 이동, `r` 답장, `i` 즉시 답장, `x` 별표, `b` 차단, `s` 스누즈, `e/u` 읽음 등
- **이메일 리마인더**: 팔로업이 필요한 이메일에 리마인더 설정

### 2. 워크플로우 자동화

코딩 없이 자동화 규칙을 만들 수 있습니다.

- **21가지 사전 제작 템플릿**: 이메일 알림, Slack 연동, 일정 관리 등
- **자연어 파싱**: "긴급 이메일 받으면 Slack DM 보내줘" → AI가 자동으로 워크플로우 생성
- **웹훅 수신**: 외부 도구(Zapier, Make 등)가 AutoPilot 자동화를 트리거 가능
- **실행 기록**: 자동화별 성공률, 평균 실행 시간, 오류 로그 추적

### 3. AI 문서 생성

보고서, 제안서, 이메일 등을 프롬프트로 즉시 생성합니다.

- 카테고리: `report` / `proposal` / `email` / `meeting_note` / `general`
- 생성된 문서는 DB에 자동 저장 (나중에 편집 가능)

### 4. 분석 대시보드

서비스 사용 현황을 시각화합니다.

- AI 비용 추이 (일별 AreaChart)
- 자동화 실행 현황 (BarChart)
- 이메일 우선순위 분포 (PieChart)
- 모델별 사용량 비교 (horizontal BarChart)
- ROI 계산: "절약된 시간 × 시급"으로 실제 가치 환산

### 5. 다중 AI 제공자 (Multi-Provider)

OpenAI, Anthropic, Google 중 선택하거나 직접 API 키를 등록할 수 있습니다.

- **Platform 모드**: AutoPilot의 AI 크레딧 소진 방식
- **BYOK 모드** (Bring Your Own Key): 본인 API 키를 AES-256 암호화 저장 후 사용
- 크레딧 부족 시 플랫폼 키로 자동 Fallback

### 6. 정기결제 (토스페이먼츠 빌링)

- 빌링키 기반 자동 결제 (카드 정보 저장 없이 안전하게 갱신)
- 매일 0시 KST 크론잡으로 당일 결제일 구독 자동 갱신
- 결제 실패 시 이메일 알림 + 3일 후 재시도 안내

### 7. 일일 이메일 다이제스트

매일 오전 9시 KST, 전날 받은 이메일 요약을 이메일로 발송합니다.

---

## 기술 스택 및 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   클라이언트 (브라우저)                   │
│  Next.js 14 App Router + Tailwind CSS + Radix UI        │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / Server Components
┌───────────────────────▼─────────────────────────────────┐
│                  Next.js API Routes                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  인박스  │  │  자동화  │  │  결제    │  ...        │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│  공통 레이어: api-utils.ts (Rate Limit / 검증 / 에러)    │
└─────┬─────────────┬──────────────┬───────────────────┘
      │             │              │
┌─────▼──────┐ ┌───▼──────┐ ┌────▼──────────────────┐
│  Supabase  │ │ Upstash  │ │  외부 AI API           │
│ PostgreSQL │ │  Redis   │ │  OpenAI / Anthropic   │
│  + Auth    │ │ (캐시/RL) │ │  / Google Gemini      │
│  + RLS     │ └──────────┘ └────────────────────────┘
└────────────┘
       │
┌──────▼───────────────────────────────────────────────┐
│  Vercel Cron (매일 00:00 UTC)                         │
│  - /api/cron/billing       (정기결제)                  │
│  - /api/cron/email-digest  (이메일 다이제스트 발송)    │
└──────────────────────────────────────────────────────┘
```

| 분류 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 14 App Router | SSR / API Routes / 라우팅 |
| 언어 | TypeScript 5 | 타입 안전성 |
| 스타일링 | Tailwind CSS + Radix UI | UI 컴포넌트 |
| 데이터베이스 | Supabase (PostgreSQL) | 주 데이터 저장소, Row-Level Security |
| 인증 | Supabase Auth | 이메일/소셜 로그인, 세션 관리 |
| 캐시 / Rate Limit | Upstash Redis | AI 응답 24h 캐시, 슬라이딩 윈도우 Rate Limit |
| AI | OpenAI / Anthropic / Google | 이메일 분석, 문서 생성, 채팅 |
| 이메일 발송 | Resend | 다이제스트, 결제 알림 이메일 |
| 결제 | 토스페이먼츠 | 빌링키 기반 정기결제 |
| 배포 | Vercel | 서버리스 배포 + Cron Jobs |
| 차트 | Recharts | 분석 대시보드 시각화 |
| 암호화 | Web Crypto API (AES-256-GCM) | API 키, 빌링키 암호화 |

---

## 디렉터리 구조

```
autopilot/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # 인증 관련 페이지 (레이아웃 분리)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   │
│   │   ├── (dashboard)/               # 로그인 후 대시보드 (레이아웃 공유)
│   │   │   ├── layout.tsx             # 사이드바 + 헤더 레이아웃
│   │   │   ├── loading.tsx            # 페이지 로딩 스켈레톤
│   │   │   ├── error.tsx              # 에러 바운더리
│   │   │   ├── dashboard/             # 홈 대시보드
│   │   │   ├── inbox/                 # AI 이메일 인박스
│   │   │   ├── automations/           # 자동화 목록 + 상세
│   │   │   │   └── [id]/              # 자동화 실행 기록 상세
│   │   │   ├── documents/             # AI 문서 생성
│   │   │   ├── analytics/             # 사용 분석 대시보드
│   │   │   ├── ai-models/             # AI 모델 설정
│   │   │   ├── alerts/                # 알림 규칙 설정
│   │   │   └── settings/
│   │   │       ├── billing/           # 구독/결제 관리
│   │   │       └── snippets/          # 이메일 스니펫 관리
│   │   │
│   │   ├── api/
│   │   │   ├── inbox/
│   │   │   │   ├── analyze/           # 이메일 AI 분석 (우선순위 + 요약)
│   │   │   │   ├── draft/             # 답장 초안 생성
│   │   │   │   ├── instant-replies/   # AI 즉시 답장 3종 (Superhuman 스타일)
│   │   │   │   ├── read/              # 읽음 처리
│   │   │   │   ├── snooze/            # 스누즈 설정
│   │   │   │   ├── star/              # 별표 토글
│   │   │   │   ├── block-sender/      # 발신자 차단 (SaneBox BlackHole)
│   │   │   │   ├── remind/            # 이메일 리마인더
│   │   │   │   ├── stats/             # 인박스 통계
│   │   │   │   └── snippets/          # 스니펫 CRUD
│   │   │   ├── alerts/                 # 스마트 알림 규칙 CRUD
│   │   │   ├── automations/
│   │   │   │   └── parse/             # 자연어 → 자동화 파싱
│   │   │   ├── documents/
│   │   │   │   └── generate/          # AI 문서 생성 + DB 저장
│   │   │   ├── ai/
│   │   │   │   ├── chat/              # AI 챗 어시스턴트
│   │   │   │   ├── settings/          # AI 모드/모델 설정
│   │   │   │   └── validate-key/      # BYOK API 키 유효성 검사
│   │   │   ├── billing/
│   │   │   │   ├── subscribe/         # 구독 시작 (빌링키 요청)
│   │   │   │   └── success/           # 빌링키 발급 콜백
│   │   │   ├── webhooks/
│   │   │   │   ├── tosspayments/      # 토스페이먼츠 이벤트 수신
│   │   │   │   └── receive/[userId]   # 외부 웹훅 수신
│   │   │   ├── cron/
│   │   │   │   ├── billing/           # 정기결제 크론
│   │   │   │   └── email-digest/      # 이메일 다이제스트 크론
│   │   │   ├── notifications/         # 알림 피드 조회
│   │   │   └── user/
│   │   │       ├── delete/            # 회원 탈퇴
│   │   │       └── focus-mode/        # 집중 모드 토글
│   │   │
│   │   └── page.tsx                   # 랜딩 페이지
│   │
│   ├── components/
│   │   ├── ui/                        # 재사용 UI (Button, Card, Badge 등)
│   │   ├── layout/
│   │   │   ├── Header.tsx             # 상단 헤더 + 알림센터
│   │   │   ├── Sidebar.tsx            # 좌측 네비게이션
│   │   │   └── NotificationCenter.tsx
│   │   ├── ai-chat/
│   │   │   └── AIChatWidget.tsx       # 플로팅 AI 챗 위젯
│   │   └── layout/
│   │       └── CommandPalette.tsx      # ⌘K 커맨드 팔레트 (Superhuman 스타일)
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   └── router.ts              # AI 멀티 프로바이더 라우터 (핵심)
│   │   ├── supabase/
│   │   │   ├── server.ts              # 서버 클라이언트 + 어드민 클라이언트
│   │   │   ├── client.ts              # 브라우저 클라이언트
│   │   │   └── middleware.ts          # 세션 갱신 미들웨어
│   │   ├── payments/
│   │   │   └── toss.ts                # 토스페이먼츠 API 래퍼
│   │   ├── api-utils.ts               # 공통 유틸 (Rate Limit, 에러, 검증)
│   │   ├── automation-templates.ts    # 21개 사전 제작 템플릿
│   │   ├── crypto.ts                  # AES-256-GCM 암호화/복호화
│   │   ├── email.ts                   # Resend 이메일 발송
│   │   └── redis.ts                   # Upstash Redis 클라이언트
│   │
│   ├── types/
│   │   └── index.ts                   # 전역 타입 + 플랜 한도 상수
│   │
│   └── middleware.ts                  # Supabase 세션 미들웨어 (전역)
│
├── supabase/
│   └── migrations/
│       └── 001_initial.sql            # 전체 DB 스키마 (테이블 + RLS + 인덱스)
│
└── vercel.json                        # Vercel Cron 스케줄 설정
```

---

## 데이터 흐름 및 주요 로직

### AI 라우터 (`src/lib/ai/router.ts`)

모든 AI 호출은 이 파일 하나를 통과합니다.

```
callAI(request) 호출
  │
  ├─ 1. Redis에서 사용자 AI 설정 조회 (5분 캐시)
  │       └─ 미스 시: Supabase에서 user_profiles + user_api_keys 병렬 조회
  │
  ├─ 2. 캐시 확인 (task + input 해시 키)
  │       └─ 24시간 내 동일 요청이면 캐시 응답 반환 (AI 비용 절감)
  │          단, document 생성 / general 태스크는 캐시 제외
  │
  ├─ 3. 입력 텍스트 8000자로 truncate (토큰 폭발 방지)
  │
  ├─ 4. AI 호출
  │       ├─ BYOK 모드: 사용자 API 키 복호화 후 호출
  │       └─ Platform 모드: AutoPilot 플랫폼 키 사용
  │
  ├─ 5. 크레딧 차감 + 사용량 로그 기록 (fire-and-forget)
  │
  └─ 6. 성공 응답 반환 + 결과 캐시 저장
```

### 이메일 분석 (`POST /api/inbox/analyze`)

```
요청: { emailIds: string[] }
  │
  ├─ Rate Limit 체크 (Upstash 슬라이딩 윈도우, 100req/min)
  │
  ├─ 이메일 ID 배열 검증 (최대 10개)
  │
  └─ 순차 처리 (병렬 X → AI Rate Limit 방지)
       └─ 각 이메일에 대해:
            ├─ 본문 3000자 truncate
            ├─ AI에게 JSON 형식 분석 요청
            │    (priority / summary / action_items / sentiment)
            └─ DB 업데이트 (ai_priority, ai_summary, ai_action_items)
```

### 정기결제 크론 (`POST /api/cron/billing`)

```
매일 0시 UTC (Vercel Cron)
  │
  ├─ Authorization: Bearer {CRON_SECRET} 헤더 검증
  │
  ├─ 당일 결제일인 active 구독 목록 조회
  │
  ├─ 대상 구독 전체를 'processing' 상태로 마킹
  │    (동시 실행 시 중복 결제 방지)
  │
  └─ 순차 처리:
       ├─ 빌링키 복호화 → 토스페이먼츠 API 청구
       ├─ 성공: 다음 결제일 갱신 + AI 크레딧 리셋
       └─ 실패: past_due 상태로 변경 + 결제 실패 이메일 발송
```

### 이메일 다이제스트 크론 (`POST /api/cron/email-digest`)

```
매일 0시 UTC (Vercel Cron)
  │
  ├─ 전체 활성 사용자를 50명씩 페이지네이션
  │
  └─ 각 페이지를 10명씩 병렬 처리:
       ├─ 당일 이메일 최대 20건 조회
       ├─ urgent 이메일 최대 5건 추출
       └─ Resend로 HTML 다이제스트 이메일 발송
```

### 웹훅 수신 (`POST /api/webhooks/receive/[userId]`)

외부 서비스(IFTTT, Make, 자체 스크립트)가 AutoPilot 자동화를 직접 트리거할 수 있습니다.

```bash
curl -X POST https://autopilot.kr/api/webhooks/receive/{YOUR_USER_ID} \
  -H "X-Webhook-Secret: {YOUR_WEBHOOK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"event": "new_order", "amount": 50000}'
```

---

## API 엔드포인트 목록

| Method | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/inbox/analyze` | 이메일 AI 분석 (최대 10개) | 필요 |
| POST | `/api/inbox/draft` | 답장 초안 생성 | 필요 |
| POST | `/api/inbox/instant-replies` | AI 즉시 답장 3종 생성 (정중/친근/간결) | 필요 |
| POST | `/api/inbox/read` | 읽음/안읽음 토글 | 필요 |
| POST | `/api/inbox/snooze` | 이메일 스누즈 설정 | 필요 |
| POST | `/api/inbox/star` | 이메일 별표 토글 | 필요 |
| GET/POST/DELETE | `/api/inbox/block-sender` | 발신자 차단/해제/목록 조회 | 필요 |
| POST/GET | `/api/inbox/remind` | 이메일 리마인더 설정/조회 | 필요 |
| GET | `/api/inbox/stats` | 인박스 통계 (카테고리, 우선순위, 볼륨) | 필요 |
| GET/POST/DELETE | `/api/inbox/snippets` | 스니펫 조회/생성/삭제 | 필요 |
| GET/POST/PUT/DELETE | `/api/alerts` | 스마트 알림 규칙 CRUD | 필요 |
| POST | `/api/automations/parse` | 자연어 → 자동화 파싱 | 필요 |
| POST | `/api/documents/generate` | AI 문서 생성 | 필요 |
| POST | `/api/ai/chat` | AI 채팅 | 필요 |
| POST | `/api/ai/settings` | AI 모드/키 설정 | 필요 |
| POST | `/api/ai/validate-key` | API 키 유효성 검사 | 필요 |
| POST | `/api/user/focus-mode` | 집중 모드 / DND 토글 | 필요 |
| POST | `/api/billing/subscribe` | 구독 시작 | 필요 |
| GET | `/api/billing/success` | 빌링키 발급 콜백 | 토스 리다이렉트 |
| GET | `/api/notifications` | 알림 피드 조회 | 필요 |
| DELETE | `/api/user/delete` | 회원 탈퇴 (전체 데이터 삭제) | 필요 |
| POST | `/api/webhooks/tosspayments` | 토스 결제 이벤트 수신 | HMAC 서명 |
| POST | `/api/webhooks/receive/[userId]` | 외부 웹훅 수신 | Webhook Secret |
| GET | `/api/webhooks/receive/[userId]` | 웹훅 엔드포인트 정보 조회 | 불필요 |
| POST | `/api/cron/billing` | 정기결제 실행 (크론) | CRON_SECRET |
| POST | `/api/cron/email-digest` | 이메일 다이제스트 발송 (크론) | CRON_SECRET |

---

## 로컬 개발 환경 설정

### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/lirongzzuin/autopilot.git
cd autopilot
npm install
```

### 2. `.env.local` 파일 생성

아래 [환경변수 설정](#환경변수-설정) 섹션을 참고해 `.env.local` 파일을 만드세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

### 4. 빌드 확인

```bash
npm run build
```

---

## Supabase DB 초기화

1. [Supabase](https://supabase.com) 프로젝트를 새로 생성합니다.
2. **SQL Editor**에서 `supabase/migrations/001_initial.sql` 전체 내용을 실행합니다.

이 파일 하나로 다음이 모두 설정됩니다:

- 전체 테이블 스키마 (15개 테이블)
- Row Level Security (RLS) 정책 — 사용자는 자신의 데이터만 접근 가능
- 인덱스 최적화 (14개)
- 신규 사용자 자동 프로필 생성 트리거
- `updated_at` 자동 갱신 트리거

**주요 테이블**:

| 테이블 | 설명 |
|--------|------|
| `user_profiles` | 사용자 프로필, 플랜, AI 크레딧, 집중 모드, 웹훅 시크릿 |
| `user_api_keys` | BYOK용 API 키 (AES-256 암호화) |
| `automations` | 자동화 규칙 (노드/엣지 JSONB) |
| `automation_logs` | 자동화 실행 기록 |
| `email_items` | 수신 이메일 + AI 분석 + 카테고리 + 별표 |
| `email_snippets` | 이메일 스니펫 템플릿 |
| `email_reminders` | 이메일 팔로업 리마인더 |
| `blocked_senders` | 차단된 발신자 목록 |
| `documents` | AI 생성 문서 |
| `subscriptions` | 구독 정보 + 토스 빌링키 (암호화) |
| `billing_history` | 결제 이력 |
| `ai_usage_logs` | AI 사용량 로그 (비용 추적) |
| `connected_services` | Gmail, Slack 등 OAuth 연결 정보 |
| `alerts` | 스마트 알림 규칙 |
| `email_classifications` | AI 분류 피드백 (학습 데이터) |

---

## 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 값을 채워주세요.

```bash
# ===== Supabase =====
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Service Role Key (서버에서만 사용)

# ===== AI 제공자 (Platform 모드용) =====
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...

# ===== 암호화 =====
# openssl rand -hex 32  명령으로 생성
ENCRYPTION_KEY=64자리_hex_문자열

# ===== Upstash Redis =====
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# ===== 토스페이먼츠 =====
TOSS_PAYMENTS_CLIENT_KEY=test_ck_...   # 프론트엔드용
TOSS_PAYMENTS_SECRET_KEY=test_sk_...   # 서버용 (절대 노출 금지)
TOSS_PAYMENTS_WEBHOOK_SECRET=...        # 웹훅 시그니처 검증용

# ===== Resend 이메일 =====
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@autopilot.kr

# ===== Cron 보안 =====
# openssl rand -hex 32  명령으로 생성
CRON_SECRET=랜덤_시크릿_값

# ===== 앱 URL =====
NEXT_PUBLIC_APP_URL=https://autopilot.kr    # 로컬: http://localhost:3000
```

**보안 주의사항**:
- `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_PAYMENTS_SECRET_KEY`, `ENCRYPTION_KEY`는 **절대 클라이언트에 노출되어서는 안 됩니다**.
- `NEXT_PUBLIC_` 접두사가 붙은 변수만 브라우저에서 접근 가능합니다.
- `.env.local`은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

---

## Vercel 배포

### 1. Vercel 프로젝트 연결

```bash
npm i -g vercel
vercel
```

### 2. 환경변수 등록

Vercel Dashboard → Project → Settings → Environment Variables에서 위의 환경변수를 모두 등록합니다.

### 3. Cron Jobs

`vercel.json`에 이미 설정되어 있습니다:

```json
{
  "crons": [
    { "path": "/api/cron/email-digest", "schedule": "0 0 * * *" },
    { "path": "/api/cron/billing",      "schedule": "0 0 * * *" }
  ]
}
```

- `0 0 * * *` = 매일 00:00 UTC = 한국 시간 오전 9시
- Vercel은 크론 실행 시 `Authorization: Bearer {CRON_SECRET}` 헤더를 자동으로 추가합니다.

### 4. 토스페이먼츠 웹훅 등록

[토스페이먼츠 개발자센터](https://developers.tosspayments.com) → 웹훅 설정에서 아래 URL을 등록하세요:

```
https://autopilot.kr/api/webhooks/tosspayments
```

---

## 구독 플랜 및 가격

| | Free | Starter | Pro | Team |
|--|------|---------|-----|------|
| **가격** | 무료 | ₩9,900/월 | ₩24,900/월 | ₩19,900/인·월 |
| **AI 크레딧** | 1,000 | 30,000 | 100,000 | 200,000 |
| **자동화 수** | 3개 | 20개 | 100개 | 무제한 |
| **이메일 처리** | 100건/월 | 1,000건/월 | 10,000건/월 | 무제한 |
| **웹훅 수신** | ❌ | ✅ | ✅ | ✅ |
| **BYOK 지원** | ❌ | ✅ | ✅ | ✅ |
| **우선 지원** | ❌ | ❌ | ✅ | ✅ |

---

## 보안 설계

### API 키 암호화

사용자 BYOK API 키와 토스 빌링키는 저장 전 **AES-256-GCM**으로 암호화됩니다.

```
평문 API 키
  → AES-256-GCM 암호화 (랜덤 IV 생성)
  → Base64 인코딩 (iv:ciphertext 형식)
  → DB 저장

복호화:
  Base64 디코딩 → IV 분리 → AES-256-GCM 복호화 → 평문 API 키
```

`ENCRYPTION_KEY`는 반드시 64자리 hex 문자열이어야 하며, 환경변수로만 관리됩니다.

### Row Level Security (RLS)

모든 테이블에 RLS 정책이 적용되어 있어 **사용자는 자신의 데이터만 읽고 쓸 수 있습니다**.
어드민 작업(크론, 웹훅)은 `SUPABASE_SERVICE_ROLE_KEY`를 사용하는 별도 어드민 클라이언트를 통해 수행됩니다.

### Rate Limiting

Upstash Redis 슬라이딩 윈도우 방식으로 API 남용을 방지합니다.

- 기본 한도: 100 요청/분 per 사용자
- AI 호출 라우트에는 별도 Rate Limit 키 (`draft:`, `chat:`, `doc:`, `parse:` 등) 적용
- Redis 연결 장애 시 fail-open 방식으로 서비스 가용성 유지

### 결제 중복 방지

정기결제 크론 실행 시, 청구 전 구독 상태를 `processing`으로 일괄 변경합니다.
동시에 여러 크론이 실행되더라도 같은 구독을 두 번 청구하지 않습니다.

### 웹훅 서명 검증

토스페이먼츠 웹훅은 **HMAC-SHA256 서명**을 검증한 후 처리합니다.
외부 웹훅 수신 엔드포인트는 사용자 지정 Webhook Secret 헤더로 인증합니다.

---

## 최근 개선 사항 (v1.1)

### 보안 강화
- **Alerts API PUT 입력 검증 화이트리스트**: 허용된 필드(name, is_active, conditions, channels)만 업데이트 가능하도록 제한하여 Mass Assignment 취약점 방지
- **Inbox API 입력 검증 강화**: `read`, `snooze` 엔드포인트에 타입 검증, ISO 날짜 유효성 검사, 과거 시점 스누즈 방지 로직 추가

### UX / 안정성 개선
- **키보드 단축키 버그 수정**: `?` 키가 input/textarea 내에서도 단축키 모달을 토글하던 문제 해결 — 입력 필드 체크를 우선 처리하도록 순서 변경
- **Optimistic UI 롤백**: 읽음 처리(`markAsRead`), 별표 토글(`toggleStar`)에서 API 실패 시 이전 상태로 자동 롤백 + 토스트 에러 메시지 표시
- **AI 기능 에러 핸들링**: `analyzeEmails`, `generateDraft`, `generateInstantReplies`에 try/catch + Rate Limit(429) 안내 + 네트워크 오류 피드백 추가
- **Toast variant 통일**: alerts 페이지의 `variant: 'destructive'`를 `variant: 'error'`로 수정 (toast 컴포넌트 지원 variant와 일치)
- **대시보드 이메일 링크 수정**: 존재하지 않는 `/inbox/[id]` 경로를 `/inbox`로 변경

### 기능 보완
- **문서 페이지 DB 연동**: 하드코딩된 예시 데이터를 Supabase 실시간 CRUD로 교체 — 생성, 저장, 복사, 삭제 모두 DB 반영
- **알림센터 읽음 상태 영속화**: `markAllRead` 시 읽은 알림 ID를 localStorage에 저장 (최근 100개), 재방문 시에도 읽음 상태 유지
- **Alerts RSS 소스 추가**: 알림 규칙의 소스 옵션에 `rss` (RSS 피드) 추가
- **결제 상태 `processing` 표시**: BillingClient의 statusBadge에 누락된 `processing` 상태 추가
- **CommandPalette 로그아웃 수정**: 미사용 `onSignOut` prop 제거, 컴포넌트 내에서 직접 Supabase signOut 호출로 변경

---

*AutoPilot — 반복 업무는 AI에게, 중요한 일에 집중하세요.*
