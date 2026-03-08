'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Rocket,
  Mail,
  Zap,
  FileText,
  Brain,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  MessageCircle,
  Send,
  ArrowRight,
  HelpCircle,
  X,
} from 'lucide-react';

// ─── Types ───
interface GuideArticle {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: GuideSection[];
}

interface GuideSection {
  type: 'text' | 'steps' | 'tip' | 'warning' | 'shortcuts';
  title?: string;
  body?: string;
  items?: string[];
  shortcuts?: { key: string; description: string }[];
}

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  articles: GuideArticle[];
}

// ─── Data ───
const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    label: '시작하기',
    icon: Rocket,
    description: '회원가입부터 첫 자동화 설정까지, AutoPilot의 첫 걸음을 안내합니다.',
    articles: [
      {
        id: 'gs-1',
        title: '회원가입 및 초기 설정',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: 'AutoPilot에 가입하고 기본 프로필을 설정하는 방법을 안내합니다. 이메일과 비밀번호로 간편하게 가입할 수 있으며, 소셜 로그인(Google)도 지원합니다.',
          },
          {
            type: 'steps',
            title: '가입 절차',
            items: [
              '회원가입 페이지에서 이메일과 비밀번호를 입력합니다.',
              '이메일 인증 링크를 클릭하여 계정을 활성화합니다.',
              '온보딩 페이지에서 이름, 회사명, 사용 목적을 입력합니다.',
              'AI 제공자(OpenAI / Anthropic / Google)를 선택합니다.',
              '대시보드로 이동하여 서비스를 시작합니다.',
            ],
          },
          {
            type: 'tip',
            body: 'Free 플랜으로 시작해도 1,000 AI 크레딧과 3개의 자동화를 무료로 사용할 수 있습니다. 충분히 체험한 후 업그레이드를 결정하세요.',
          },
        ],
      },
      {
        id: 'gs-2',
        title: '대시보드 한눈에 보기',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: '대시보드는 AutoPilot의 홈 화면입니다. 주요 통계, 최근 자동화 실행 기록, 처리 대기 중인 이메일 등을 한눈에 확인할 수 있습니다.',
          },
          {
            type: 'steps',
            title: '대시보드 구성 요소',
            items: [
              '상단 통계 카드: 오늘 처리된 이메일, 실행된 자동화, 절약된 시간, AI 크레딧 현황',
              '주간 활동 차트: 최근 7일간 AI 사용량 추이를 시각적으로 확인',
              '최근 자동화: 마지막으로 실행된 자동화 워크플로우 목록',
              '미처리 이메일: 아직 읽지 않은 중요 이메일 미리보기',
            ],
          },
          {
            type: 'tip',
            body: '⌘K (Mac) 또는 Ctrl+K (Windows)를 누르면 어디서든 커맨드 팔레트를 열어 빠르게 페이지를 이동하거나 액션을 실행할 수 있습니다.',
          },
        ],
      },
      {
        id: 'gs-3',
        title: '키보드 단축키 마스터하기',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: 'AutoPilot은 키보드 중심 UX를 제공합니다. 마우스 없이도 대부분의 작업을 빠르게 수행할 수 있습니다.',
          },
          {
            type: 'shortcuts',
            title: '인박스 단축키',
            shortcuts: [
              { key: 'j / k', description: '이전/다음 이메일로 이동' },
              { key: 'r', description: '선택한 이메일에 답장 초안 생성' },
              { key: 'i', description: 'Instant Reply (즉시 답장 3종 생성)' },
              { key: 'e', description: '읽음/안읽음 토글' },
              { key: 'x', description: '별표(즐겨찾기) 토글' },
              { key: 's', description: '스누즈 메뉴 열기' },
              { key: 'b', description: '발신자 차단' },
              { key: '#', description: '삭제' },
              { key: '?', description: '단축키 도움말 열기/닫기' },
            ],
          },
          {
            type: 'shortcuts',
            title: '전역 단축키',
            shortcuts: [
              { key: '⌘K', description: '커맨드 팔레트 열기 (전체 검색 + 네비게이션)' },
              { key: 'Escape', description: '모달/팝업 닫기' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'inbox',
    label: '스마트 인박스',
    icon: Mail,
    description: 'AI가 이메일을 자동 분류하고, 즉시 답장을 생성하며, 스마트하게 관리합니다.',
    articles: [
      {
        id: 'inbox-1',
        title: 'AI 이메일 분석 사용법',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: '인박스에 이메일이 도착하면 AI가 자동으로 우선순위를 분류하고, 3줄 요약과 해야 할 일(Action Items)을 추출합니다.',
          },
          {
            type: 'steps',
            title: '이메일 분석하기',
            items: [
              '인박스 페이지로 이동합니다.',
              '분석할 이메일을 선택합니다 (최대 10개까지 동시 분석 가능).',
              '상단의 "AI 분석" 버튼을 클릭합니다.',
              'AI가 우선순위(긴급/중요/보통/스팸), 요약, 액션 아이템을 자동으로 생성합니다.',
              '결과는 이메일 카드에 즉시 반영됩니다.',
            ],
          },
          {
            type: 'tip',
            body: 'AI 분석은 한 번에 최대 10개 이메일까지 가능합니다. Rate Limit(분당 100건)이 적용되므로 대량 분석 시 잠시 기다려주세요.',
          },
        ],
      },
      {
        id: 'inbox-2',
        title: 'Split Inbox (카테고리 분류)',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: 'Superhuman 스타일의 Split Inbox로 이메일을 카테고리별로 분리하여 볼 수 있습니다. 중요한 이메일부터 집중해서 처리하세요.',
          },
          {
            type: 'steps',
            title: '카테고리 종류',
            items: [
              'Primary (중요): 직접 보낸 비즈니스 이메일',
              'Team (팀): 팀원/동료와의 커뮤니케이션',
              'VIP: VIP로 설정한 발신자의 이메일',
              'Newsletter (뉴스레터): 구독 중인 뉴스레터',
              'Notification (알림): 서비스 알림, 시스템 메시지',
            ],
          },
          {
            type: 'tip',
            body: 'Focus Mode를 활성화하면 긴급/중요 이메일만 표시됩니다. 집중해야 할 때 유용합니다.',
          },
        ],
      },
      {
        id: 'inbox-3',
        title: 'Instant Reply (즉시 답장)',
        level: 'intermediate',
        content: [
          {
            type: 'text',
            body: '이메일을 선택한 후 "i" 키를 누르면 AI가 3가지 톤의 답장을 즉시 생성합니다. 원하는 답장을 선택하고 필요 시 수정하여 바로 사용하세요.',
          },
          {
            type: 'steps',
            title: '답장 톤',
            items: [
              '정중한 톤 (Formal): 비즈니스 공식 답장에 적합',
              '친근한 톤 (Friendly): 팀원/친한 거래처에게 적합',
              '간결한 톤 (Concise): 핵심만 전달할 때 적합',
            ],
          },
          {
            type: 'warning',
            body: 'Instant Reply는 AI 크레딧을 소모합니다. Free 플랜에서는 하루 크레딧 한도에 주의하세요.',
          },
        ],
      },
      {
        id: 'inbox-4',
        title: '발신자 차단 및 스누즈',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: '원치 않는 발신자를 차단하거나, 나중에 처리할 이메일을 스누즈하여 원하는 시점에 다시 알림받을 수 있습니다.',
          },
          {
            type: 'steps',
            title: '발신자 차단 (BlackHole)',
            items: [
              '이메일을 선택한 후 "b" 키를 누르거나 더보기 메뉴에서 "차단"을 클릭합니다.',
              '확인 다이얼로그에서 차단을 승인합니다.',
              '차단된 발신자의 이메일은 자동으로 숨겨집니다.',
              '설정 > 차단 목록에서 언제든 차단을 해제할 수 있습니다.',
            ],
          },
          {
            type: 'steps',
            title: '스누즈 옵션',
            items: [
              '1시간 후',
              '3시간 후',
              '오늘 저녁 (18:00)',
              '내일 오전 (09:00)',
              '다음 주 월요일 (09:00)',
            ],
          },
        ],
      },
      {
        id: 'inbox-5',
        title: '스니펫 (자주 쓰는 답장)',
        level: 'intermediate',
        content: [
          {
            type: 'text',
            body: '자주 사용하는 답장 문구를 스니펫으로 저장하면 빠르게 답장을 작성할 수 있습니다. 설정 > 이메일 스니펫에서 관리합니다.',
          },
          {
            type: 'steps',
            title: '스니펫 사용법',
            items: [
              '설정 > 이메일 스니펫 메뉴로 이동합니다.',
              '"새 스니펫" 버튼을 클릭합니다.',
              '단축키(예: /thanks)와 내용을 입력합니다.',
              '답장 작성 시 단축키를 입력하면 자동으로 내용이 삽입됩니다.',
            ],
          },
          {
            type: 'tip',
            body: '스니펫 단축키는 / 로 시작하는 것을 권장합니다. 예: /thanks, /accept, /decline, /followup',
          },
        ],
      },
    ],
  },
  {
    id: 'automations',
    label: '워크플로우 자동화',
    icon: Zap,
    description: '코딩 없이 자동화 규칙을 만들고, 반복 업무를 AI에게 맡기세요.',
    articles: [
      {
        id: 'auto-1',
        title: '첫 자동화 만들기',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: 'AutoPilot의 자동화는 "언제(트리거)"와 "무엇을(액션)"으로 구성됩니다. 사전 제작된 21개 템플릿을 활용하거나 처음부터 직접 만들 수 있습니다.',
          },
          {
            type: 'steps',
            title: '자동화 생성 절차',
            items: [
              '좌측 사이드바에서 "자동화" 메뉴를 클릭합니다.',
              '"새 자동화 만들기" 버튼을 클릭합니다.',
              '템플릿을 선택하거나 "처음부터 만들기"를 선택합니다.',
              '자동화 이름, 트리거 조건, 실행할 액션을 설정합니다.',
              '"활성화" 스위치를 켜면 자동화가 시작됩니다.',
            ],
          },
          {
            type: 'tip',
            body: '자연어로 자동화를 만들 수도 있습니다. "긴급 이메일 받으면 Slack DM 보내줘"처럼 입력하면 AI가 자동으로 워크플로우를 생성합니다.',
          },
        ],
      },
      {
        id: 'auto-2',
        title: '트리거와 액션 이해하기',
        level: 'intermediate',
        content: [
          {
            type: 'text',
            body: '트리거는 자동화를 시작하는 이벤트이고, 액션은 그 결과로 수행되는 작업입니다.',
          },
          {
            type: 'steps',
            title: '사용 가능한 트리거',
            items: [
              'email_received: 새 이메일 수신 시',
              'email_urgent: 긴급 이메일 수신 시',
              'schedule: 정해진 시간에 자동 실행',
              'webhook: 외부 서비스에서 웹훅 수신 시',
              'keyword: 특정 키워드가 포함된 이메일 수신 시',
              'form_submit: 폼 제출 시',
            ],
          },
          {
            type: 'steps',
            title: '사용 가능한 액션',
            items: [
              'send_email: 이메일 발송',
              'send_slack: Slack 메시지 전송',
              'ai_summarize: AI 텍스트 요약',
              'ai_draft: AI 답장 초안 생성',
              'create_task: 작업 생성',
              'webhook: 외부 웹훅 호출',
              'generate_report: 보고서 생성',
              'notify: 알림 전송',
            ],
          },
        ],
      },
      {
        id: 'auto-3',
        title: '외부 웹훅 연동',
        level: 'advanced',
        content: [
          {
            type: 'text',
            body: 'AutoPilot은 외부 서비스(IFTTT, Make, Zapier, 자체 스크립트 등)로부터 웹훅을 수신하여 자동화를 트리거할 수 있습니다.',
          },
          {
            type: 'steps',
            title: '웹훅 설정 방법',
            items: [
              '설정 페이지에서 Webhook Secret을 확인합니다.',
              '외부 서비스에서 POST 요청을 보낼 URL을 설정합니다: /api/webhooks/receive/{userId}',
              '요청 헤더에 X-Webhook-Secret을 포함합니다.',
              'JSON 형식으로 payload를 전송합니다.',
            ],
          },
          {
            type: 'warning',
            body: 'Webhook Secret은 절대 공개하지 마세요. 노출 시 설정에서 즉시 재생성하세요. Free 플랜에서는 웹훅 수신이 지원되지 않습니다.',
          },
        ],
      },
    ],
  },
  {
    id: 'documents',
    label: '문서 자동화',
    icon: FileText,
    description: 'AI로 보고서, 회의록, 제안서를 자동으로 생성하고 관리합니다.',
    articles: [
      {
        id: 'doc-1',
        title: 'AI 문서 생성하기',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: '프롬프트만 입력하면 AI가 보고서, 회의록, 제안서, 이메일 템플릿, 인보이스 등 다양한 문서를 즉시 생성합니다.',
          },
          {
            type: 'steps',
            title: '문서 생성 절차',
            items: [
              '좌측 사이드바에서 "문서 자동화" 메뉴를 클릭합니다.',
              '"AI 문서 생성" 버튼을 클릭합니다.',
              '문서 유형을 선택합니다 (보고서, 회의록, 제안서, 이메일 템플릿, 인보이스).',
              '문서 내용을 설명하는 프롬프트를 입력합니다.',
              '"문서 생성하기" 버튼을 클릭합니다.',
              '생성된 문서를 확인하고, 복사 또는 저장합니다.',
            ],
          },
          {
            type: 'tip',
            body: '프롬프트를 구체적으로 작성할수록 더 좋은 결과를 얻을 수 있습니다. 예: "지난주 영업팀 주간 업무보고서. 매출 목표 대비 85% 달성, 신규 고객 3명 확보"',
          },
        ],
      },
      {
        id: 'doc-2',
        title: '문서 관리 및 편집',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: '생성된 문서는 DB에 자동 저장되며, 카테고리별로 분류하여 관리할 수 있습니다. 언제든 다시 확인하고 복사하거나 삭제할 수 있습니다.',
          },
          {
            type: 'steps',
            title: '문서 관리 기능',
            items: [
              '카테고리 필터: 전체/보고서/회의록/제안서/이메일 템플릿/인보이스별 필터링',
              '복사: 클립보드에 문서 내용 복사',
              '삭제: 불필요한 문서 영구 삭제',
              '검색: 문서 제목과 내용으로 검색 (준비 중)',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ai-models',
    label: 'AI 모델 설정',
    icon: Brain,
    description: 'AI 제공자를 선택하고, 직접 API 키를 등록하여 사용할 수 있습니다.',
    articles: [
      {
        id: 'ai-1',
        title: 'Platform 모드 vs BYOK 모드',
        level: 'intermediate',
        content: [
          {
            type: 'text',
            body: 'AutoPilot은 두 가지 AI 사용 모드를 지원합니다. 상황에 맞게 선택하세요.',
          },
          {
            type: 'steps',
            title: 'Platform 모드 (기본)',
            items: [
              'AutoPilot의 AI 크레딧을 사용하여 AI를 호출합니다.',
              '별도의 API 키 없이 즉시 사용 가능합니다.',
              '플랜에 포함된 크레딧이 소진되면 추가 구매가 필요합니다.',
              '모든 사용자에게 기본 제공됩니다.',
            ],
          },
          {
            type: 'steps',
            title: 'BYOK 모드 (Bring Your Own Key)',
            items: [
              '본인의 OpenAI / Anthropic / Google API 키를 등록합니다.',
              'API 키는 AES-256-GCM으로 암호화되어 안전하게 저장됩니다.',
              '직접 등록한 키로 AI를 호출하므로 플랫폼 크레딧이 차감되지 않습니다. 대신 사용량에 따라 해당 AI 제공사(OpenAI, Anthropic, Google)에 직접 요금이 청구됩니다.',
              '모든 플랜에서 BYOK를 지원합니다.',
            ],
          },
          {
            type: 'warning',
            body: 'BYOK 모드에서는 플랫폼 크레딧이 차감되지 않지만, AI 사용량에 따라 해당 AI 제공사(OpenAI, Anthropic, Google)에 직접 요금이 청구됩니다. API 키가 유효하지 않거나 잔액이 부족하면 자동으로 Platform 모드로 전환됩니다.',
          },
        ],
      },
      {
        id: 'ai-2',
        title: 'API 키 등록 및 관리',
        level: 'intermediate',
        content: [
          {
            type: 'text',
            body: 'BYOK 모드를 사용하려면 AI 제공자의 API 키를 등록해야 합니다.',
          },
          {
            type: 'steps',
            title: 'API 키 등록 절차',
            items: [
              '좌측 사이드바에서 "AI 모델" 메뉴로 이동합니다.',
              '"BYOK 모드"를 선택합니다.',
              '사용할 AI 제공자(OpenAI, Anthropic, Google)를 선택합니다.',
              'API 키를 입력하고 "키 검증" 버튼을 클릭합니다.',
              '검증이 성공하면 "저장" 버튼을 클릭합니다.',
            ],
          },
          {
            type: 'tip',
            body: 'API 키 발급 방법: OpenAI는 platform.openai.com, Anthropic은 console.anthropic.com, Google은 aistudio.google.com에서 발급받을 수 있습니다.',
          },
        ],
      },
    ],
  },
  {
    id: 'billing',
    label: '계정 및 결제',
    icon: CreditCard,
    description: '구독 플랜, 결제 수단, AI 크레딧 관리에 대해 안내합니다.',
    articles: [
      {
        id: 'bill-1',
        title: '구독 플랜 비교',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: 'AutoPilot은 4가지 플랜을 제공합니다. 무료 플랜으로 시작하여 필요에 따라 업그레이드하세요.',
          },
          {
            type: 'steps',
            title: '플랜별 주요 차이',
            items: [
              'Free (무료): AI 크레딧 1,000 / 자동화 2개 / 이메일 30건/월 / BYOK 지원',
              'Starter (₩9,900/월): AI 크레딧 30,000 / 자동화 15개 / 이메일 500건/월 / BYOK 지원',
              'Pro (₩24,900/월): AI 크레딧 200,000 / 무제한 자동화 / 무제한 이메일 / 전체 AI 모델 / 우선 지원',
              'Team (₩19,900/인·월): AI 크레딧 200,000 / 무제한 자동화 / 무제한 이메일 / 관리자 대시보드 / 전담 CS',
            ],
          },
        ],
      },
      {
        id: 'bill-2',
        title: '결제 및 구독 관리',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: 'AutoPilot은 토스페이먼츠 빌링키 기반 정기결제를 사용합니다. 카드 정보를 직접 저장하지 않으므로 안전합니다.',
          },
          {
            type: 'steps',
            title: '구독 시작 및 관리',
            items: [
              '설정 > 결제 메뉴로 이동합니다.',
              '원하는 플랜의 "구독하기" 버튼을 클릭합니다.',
              '토스페이먼츠 결제창에서 카드를 등록합니다.',
              '매월 자동으로 결제가 진행됩니다.',
              '언제든 구독을 취소하거나 플랜을 변경할 수 있습니다.',
            ],
          },
          {
            type: 'warning',
            body: '결제 실패 시 이메일로 알림이 발송됩니다. 3일 이내에 결제 수단을 업데이트하지 않으면 서비스가 Free 플랜으로 전환됩니다.',
          },
        ],
      },
      {
        id: 'bill-3',
        title: '회원 탈퇴',
        level: 'beginner',
        content: [
          {
            type: 'text',
            body: '설정 페이지에서 회원 탈퇴를 진행할 수 있습니다. 탈퇴 시 모든 데이터가 영구 삭제됩니다.',
          },
          {
            type: 'warning',
            body: '회원 탈퇴 시 이메일 데이터, 자동화 설정, 문서, 결제 이력 등 모든 데이터가 즉시 삭제되며 복구할 수 없습니다. 활성 구독이 있다면 먼저 구독을 취소하세요.',
          },
        ],
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'AutoPilot은 실제 이메일을 대신 보내나요?',
    a: '아니요. AutoPilot은 이메일 분석과 답장 초안 생성만 수행합니다. 실제 발송은 사용자가 직접 확인한 후 진행합니다.',
  },
  {
    q: 'API 키는 안전하게 저장되나요?',
    a: '네. BYOK 모드에서 등록된 모든 API 키는 AES-256-GCM 방식으로 암호화되어 저장됩니다. 서버에서도 평문으로 저장되지 않습니다.',
  },
  {
    q: 'Free 플랜에서 업그레이드하면 데이터가 유지되나요?',
    a: '네. 플랜 변경 시 기존 데이터(이메일 분석 결과, 자동화 설정, 문서 등)는 모두 유지됩니다.',
  },
  {
    q: 'AI 크레딧이 부족하면 어떻게 되나요?',
    a: '플랫폼 모드에서 AI 크레딧이 소진되면 AI 기능을 사용할 수 없습니다. 상위 플랜으로 업그레이드하거나, BYOK 모드로 전환하여 본인의 API 키로 계속 사용할 수 있습니다. BYOK 사용 시에는 해당 AI 제공사에 사용량 기반 요금이 별도로 청구됩니다.',
  },
  {
    q: '여러 AI 모델을 동시에 사용할 수 있나요?',
    a: '현재는 하나의 AI 제공자/모델을 선택하여 사용합니다. AI 모델 설정 페이지에서 언제든 변경할 수 있습니다.',
  },
  {
    q: '다크 모드를 지원하나요?',
    a: '네. 시스템 설정에 따라 자동으로 다크 모드가 적용됩니다.',
  },
];

const LEVEL_BADGE: Record<string, { label: string; color: string }> = {
  beginner: { label: '초급', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  intermediate: { label: '중급', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  advanced: { label: '고급', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ─── Components ───

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="가이드, 기능, 질문을 검색하세요..."
        className="block w-full pl-12 pr-16 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-base shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-slate-400"
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1">
        {value ? (
          <button onClick={() => onChange('')} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-400">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  isActive,
  onClick,
  matchCount,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  matchCount?: number;
}) {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 md:p-6 rounded-2xl border transition-all group ${
        isActive
          ? 'bg-primary/5 border-primary/30 shadow-md shadow-primary/5'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary/20'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
          isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{category.label}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{category.description}</p>
      <span className="text-xs font-semibold text-primary">
        {matchCount !== undefined ? `${matchCount}개 결과` : `${category.articles.length}개 가이드`}
      </span>
    </button>
  );
}

function GuideContent({ section }: { section: GuideSection }) {
  if (section.type === 'text') {
    return <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.body}</p>;
  }

  if (section.type === 'steps') {
    return (
      <div className="mt-3">
        {section.title && (
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{section.title}</h4>
        )}
        <ul className="space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.type === 'tip') {
    return (
      <div className="flex items-start gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-xl p-4 mt-3">
        <div className="p-1 bg-primary rounded-md shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-primary mb-0.5">PRO TIP</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{section.body}</p>
        </div>
      </div>
    );
  }

  if (section.type === 'warning') {
    return (
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 mt-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">주의</p>
          <p className="text-sm text-amber-800 dark:text-amber-300">{section.body}</p>
        </div>
      </div>
    );
  }

  if (section.type === 'shortcuts') {
    return (
      <div className="mt-3">
        {section.title && (
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{section.title}</h4>
        )}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {section.shortcuts?.map((sc, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{sc.description}</td>
                  <td className="px-4 py-2.5 text-right">
                    {sc.key.split(' / ').map((k, ki) => (
                      <span key={ki}>
                        {ki > 0 && <span className="text-slate-300 mx-1">/</span>}
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {k.trim()}
                        </kbd>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

function ArticleAccordion({ article }: { article: GuideArticle }) {
  const [open, setOpen] = useState(false);
  const badge = LEVEL_BADGE[article.level];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex-shrink-0">
          {open ? (
            <ChevronDown className="w-4 h-4 text-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">{article.title}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>{badge.label}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-white dark:bg-slate-800 space-y-4 border-t border-slate-100 dark:border-slate-700">
          {article.content.map((section, i) => (
            <GuideContent key={i} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">{q}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-7">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ───
export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Search filtering
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.content.some(
            (s) =>
              s.body?.toLowerCase().includes(q) ||
              s.items?.some((item) => item.toLowerCase().includes(q)) ||
              s.shortcuts?.some(
                (sc) => sc.description.toLowerCase().includes(q) || sc.key.toLowerCase().includes(q)
              )
          )
      ),
    })).filter((cat) => cat.articles.length > 0);
  }, [search]);

  const filteredFAQ = useMemo(() => {
    if (!search.trim()) return FAQ_ITEMS;
    const q = search.toLowerCase();
    return FAQ_ITEMS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [search]);

  const activeData = activeCategory
    ? filteredCategories.find((c) => c.id === activeCategory)
    : null;

  const popularSearches = ['이메일 분석', 'API 키 등록', '키보드 단축키', '자동화 만들기', '결제 수단'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-indigo-600 to-violet-600 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-indigo-100 mb-8 text-sm md:text-base">
            AutoPilot 사용법, 기능 가이드, FAQ를 검색하세요.
          </p>
          <SearchBar value={search} onChange={setSearch} />
          {!search && (
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <span className="text-indigo-200 text-xs">인기 검색어:</span>
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search result indicator */}
      {search && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-slate-500">
            &quot;{search}&quot; 검색 결과:
            {' '}
            <strong className="text-slate-900 dark:text-white">
              {filteredCategories.reduce((sum, c) => sum + c.articles.length, 0)}개 가이드
            </strong>
            {filteredFAQ.length > 0 && (
              <>, <strong className="text-slate-900 dark:text-white">{filteredFAQ.length}개 FAQ</strong></>
            )}
          </span>
        </div>
      )}

      {/* Category Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-10">
        {(search ? filteredCategories : CATEGORIES).map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isActive={activeCategory === cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            matchCount={search ? cat.articles.length : undefined}
          />
        ))}
      </section>

      {/* Guide Articles */}
      <section className="mb-12">
        {activeData ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveCategory(null)}
                className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
                전체 카테고리
              </button>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {(() => { const Icon = activeData.icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                {activeData.label}
              </h2>
            </div>
            <div className="space-y-3">
              {activeData.articles.map((article) => (
                <ArticleAccordion key={article.id} article={article} />
              ))}
            </div>
          </div>
        ) : (
          <div>
            {(search ? filteredCategories : CATEGORIES).map((cat) => (
              <div key={cat.id} className="mb-8">
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-2 mb-4 group"
                >
                  {(() => { const Icon = cat.icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {cat.label}
                  </h2>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
                <div className="space-y-3">
                  {cat.articles.slice(0, search ? cat.articles.length : 2).map((article) => (
                    <ArticleAccordion key={article.id} article={article} />
                  ))}
                  {!search && cat.articles.length > 2 && (
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className="text-sm text-primary hover:underline font-medium ml-1"
                    >
                      +{cat.articles.length - 2}개 더 보기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      {filteredFAQ.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {filteredFAQ.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>
      )}

      {/* Support Banner */}
      <section className="bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-2xl p-8 md:p-12 text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          원하는 답변을 찾지 못하셨나요?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-md mx-auto">
          AI 채팅 어시스턴트에게 질문하거나 이메일로 문의해 주세요. 빠르게 도와드리겠습니다.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => {
              const chatBtn = document.querySelector('[data-chat-toggle]') as HTMLButtonElement | null;
              chatBtn?.click();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            <MessageCircle className="w-4 h-4" />
            AI 채팅으로 질문하기
          </button>
          <a
            href="mailto:support@autopilot.kr"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-semibold rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            이메일 문의
          </a>
        </div>
      </section>
    </div>
  );
}
