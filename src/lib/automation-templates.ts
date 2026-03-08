// 자동화 템플릿 라이브러리 - 카테고리별 20개 이상의 사전 빌드 템플릿
import type { TriggerType, ActionType } from '@/types';

export interface AutomationTemplate {
  id: string;
  title: string;
  description: string;
  category: '이메일' | '일정 관리' | '팀 협업' | '데이터 관리' | '알림' | 'AI 자동화';
  icon: string;
  trigger: string;
  action: string;
  tags: string[];
  popular?: boolean;
  nodes: Array<{
    id: string;
    type: 'trigger' | 'action' | 'condition';
    nodeType: TriggerType | ActionType | 'if_else' | 'keyword_match' | 'ai_classify';
    config: Record<string, unknown>;
    position: { x: number; y: number };
  }>;
  edges: Array<{ id: string; source: string; target: string; label?: string }>;
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  // === 이메일 카테고리 ===
  {
    id: 'urgent_email_slack',
    title: '긴급 이메일 → Slack 즉시 알림',
    description: 'AI가 긴급으로 분류한 이메일을 즉시 Slack DM으로 전달합니다',
    category: '이메일',
    icon: '🚨',
    trigger: '긴급 이메일 수신',
    action: 'Slack DM 전송',
    tags: ['이메일', 'Slack', '긴급'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: { priority_filter: 'urgent' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'slack_message', config: { channel: '@me', message: '🚨 긴급 이메일: {{email.subject}} from {{email.sender}}' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'email_daily_digest',
    title: '매일 오전 이메일 다이제스트',
    description: '매일 오전 9시에 AI 요약된 이메일 리포트를 받아보세요',
    category: '이메일',
    icon: '📬',
    trigger: '매일 오전 9시',
    action: '이메일 다이제스트 발송',
    tags: ['이메일', '스케줄', '요약'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { cron: '0 9 * * *' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'send_email', config: { template: 'daily_digest' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'email_to_jira',
    title: '이메일 → Jira 이슈 자동 생성',
    description: '특정 키워드가 포함된 이메일 수신 시 Jira 이슈를 자동으로 생성합니다',
    category: '이메일',
    icon: '🎯',
    trigger: '키워드 이메일 수신',
    action: 'Jira 이슈 생성',
    tags: ['이메일', 'Jira', '이슈 트래킹'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'condition', nodeType: 'keyword_match', config: { keywords: ['버그', '오류', '에러', 'bug', 'error'] }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'create_jira_issue', config: { project: 'AUTO', type: 'Bug', summary: '{{email.subject}}' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3', label: '매칭' },
    ],
  },
  {
    id: 'email_to_notion',
    title: '이메일 → Notion 데이터베이스 저장',
    description: '중요한 이메일을 Notion 데이터베이스에 자동으로 저장합니다',
    category: '이메일',
    icon: '📚',
    trigger: '중요 이메일 수신',
    action: 'Notion 페이지 생성',
    tags: ['이메일', 'Notion', '아카이브'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: { priority_filter: 'important' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'create_notion_page', config: { database: '이메일 아카이브', title: '{{email.subject}}' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'email_vip_alert',
    title: 'VIP 발신자 알림',
    description: '특정 VIP 발신자의 이메일을 즉시 전화/SMS로 알립니다',
    category: '이메일',
    icon: '⭐',
    trigger: 'VIP 이메일 수신',
    action: '즉시 알림',
    tags: ['이메일', '알림', 'VIP'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: { sender_filter: ['boss@company.com', 'ceo@company.com'] }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'slack_message', config: { channel: '@me', urgent: true }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },

  // === 일정 관리 카테고리 ===
  {
    id: 'meeting_notes_notion',
    title: '회의 종료 → 회의록 Notion 저장',
    description: 'Google Meet/Zoom 회의 종료 후 AI 회의록을 Notion에 자동 저장합니다',
    category: '일정 관리',
    icon: '📝',
    trigger: '회의 종료',
    action: 'Notion 저장',
    tags: ['회의', 'Notion', '회의록'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { event_type: 'meeting_end' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: '회의 내용을 요약하고 Action Item을 추출하세요' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'create_notion_page', config: { database: '회의록', template: 'meeting_notes' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },
  {
    id: 'daily_standup',
    title: '매일 오전 스탠드업 리마인더',
    description: '매일 오전 9시 30분에 팀 스탠드업 리마인더를 Slack에 발송합니다',
    category: '일정 관리',
    icon: '🌅',
    trigger: '매일 오전 9시 30분',
    action: 'Slack 채널 메시지',
    tags: ['스탠드업', 'Slack', '스케줄'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { cron: '30 9 * * 1-5' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'slack_message', config: { channel: '#daily-standup', message: '📢 스탠드업 시간입니다! 오늘의 진행상황을 공유해주세요.' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'weekly_report',
    title: '주간 업무 리포트 자동 생성',
    description: '매주 금요일 오후 5시 지난 주 업무를 AI가 자동으로 요약하여 리포트를 생성합니다',
    category: '일정 관리',
    icon: '📊',
    trigger: '매주 금요일',
    action: '이메일 발송',
    tags: ['리포트', '주간', 'AI 요약'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { cron: '0 17 * * 5' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { scope: 'weekly', include: ['emails', 'tasks', 'automations'] }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'send_email', config: { subject: '📊 주간 업무 리포트', template: 'weekly_report' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },

  // === 팀 협업 카테고리 ===
  {
    id: 'slack_to_jira',
    title: 'Slack 메시지 → Jira 태스크 생성',
    description: 'Slack에서 특정 이모지(📌)를 붙인 메시지를 자동으로 Jira 태스크로 생성합니다',
    category: '팀 협업',
    icon: '📌',
    trigger: 'Slack 반응 추가',
    action: 'Jira 태스크 생성',
    tags: ['Slack', 'Jira', '태스크'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'slack_message', config: { reaction: 'pushpin' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'create_jira_issue', config: { type: 'Task', summary: '{{message.text}}', assignee: '{{message.author}}' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'pr_review_slack',
    title: 'GitHub PR 리뷰 요청 → Slack 알림',
    description: 'PR 리뷰 요청이 오면 담당자에게 Slack으로 즉시 알림을 보냅니다',
    category: '팀 협업',
    icon: '🔄',
    trigger: 'Webhook (GitHub)',
    action: 'Slack 알림',
    tags: ['GitHub', 'PR', 'Slack'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'webhook', config: { source: 'github', event: 'pull_request.review_requested' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'slack_message', config: { channel: '#engineering', message: '👀 PR 리뷰 요청: {{pr.title}} by {{pr.author}}' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'customer_feedback_tracker',
    title: '고객 피드백 자동 분류 및 트래킹',
    description: '고객 피드백 이메일을 AI가 자동 분류하고 Notion 피드백 DB에 저장합니다',
    category: '팀 협업',
    icon: '💬',
    trigger: '이메일 수신',
    action: 'AI 분류 + Notion 저장',
    tags: ['고객', '피드백', 'Notion'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: { from_domain: '@customer.com' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: '피드백 유형을 분류하고 핵심 내용을 추출하세요' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'create_notion_page', config: { database: '고객 피드백', category: '{{ai.category}}' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },

  // === 데이터 관리 카테고리 ===
  {
    id: 'email_to_sheets',
    title: '이메일 데이터 → Google Sheets 자동 정리',
    description: '특정 이메일의 데이터를 파싱하여 Google Sheets에 자동으로 행을 추가합니다',
    category: '데이터 관리',
    icon: '📈',
    trigger: '이메일 수신',
    action: 'Google Sheets 행 추가',
    tags: ['이메일', 'Sheets', '데이터'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: '이메일에서 날짜, 금액, 담당자 정보를 JSON으로 추출하세요' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'add_sheets_row', config: { spreadsheet: '업무 데이터', sheet: 'Sheet1' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },
  {
    id: 'sheets_to_email',
    title: 'Google Sheets 신규 행 → 이메일 발송',
    description: 'Google Sheets에 새 데이터가 추가되면 자동으로 관련자에게 이메일을 발송합니다',
    category: '데이터 관리',
    icon: '📧',
    trigger: 'Sheets 새 행 추가',
    action: '이메일 발송',
    tags: ['Sheets', '이메일', '알림'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'sheets_row_added', config: { spreadsheet_id: '', sheet: 'Sheet1' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'send_email', config: { to: '{{row.email}}', subject: '새 데이터 알림', template: 'data_notification' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'monthly_kpi_report',
    title: '월간 KPI 자동 리포트',
    description: '매월 1일 전월 데이터를 Google Sheets에서 집계하여 KPI 리포트를 자동 생성합니다',
    category: '데이터 관리',
    icon: '📉',
    trigger: '매월 1일',
    action: 'KPI 리포트 이메일',
    tags: ['KPI', '월간', '리포트'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { cron: '0 9 1 * *' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: '월간 KPI를 분석하고 주요 인사이트를 제공하세요' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'send_email', config: { subject: '📊 월간 KPI 리포트', template: 'kpi_report' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },

  // === 알림 카테고리 ===
  {
    id: 'server_down_alert',
    title: '서버 다운 즉시 알림',
    description: 'Webhook으로 서버 상태 변화를 감지하고 즉시 팀에 알림을 보냅니다',
    category: '알림',
    icon: '🔴',
    trigger: 'Webhook (모니터링)',
    action: 'Slack + 이메일 동시 발송',
    tags: ['서버', '모니터링', '긴급'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'webhook', config: { source: 'monitoring', event: 'server_down' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'slack_message', config: { channel: '#alerts', message: '🔴 서버 다운 감지: {{payload.server_name}}' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'send_email', config: { to: 'devops@company.com', subject: '🚨 서버 다운 알림', priority: 'urgent' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
    ],
  },
  {
    id: 'credit_low_alert',
    title: 'AI 크레딧 부족 알림',
    description: 'AI 크레딧이 20% 이하로 떨어지면 즉시 알림을 발송합니다',
    category: '알림',
    icon: '⚡',
    trigger: '크레딧 임계값 도달',
    action: '이메일 알림',
    tags: ['크레딧', '알림', '시스템'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { cron: '0 * * * *' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'condition', nodeType: 'if_else', config: { condition: 'ai_credits_remaining < ai_credits_total * 0.2' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'send_email', config: { subject: '⚡ AI 크레딧 부족 알림', template: 'credit_low' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3', label: '조건 충족' },
    ],
  },

  // === AI 자동화 카테고리 ===
  {
    id: 'ai_email_triage',
    title: 'AI 이메일 자동 트리아지',
    description: 'AI가 모든 수신 이메일을 자동 분류하고 우선순위별로 정리합니다',
    category: 'AI 자동화',
    icon: '🤖',
    trigger: '새 이메일 수신',
    action: 'AI 분류 + 태그 부여',
    tags: ['AI', '이메일', '자동분류'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: 'email_classify' }, position: { x: 0, y: 120 } },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
  {
    id: 'ai_document_generator',
    title: 'AI 자동 계약서 초안 생성',
    description: '이메일 요청을 받으면 AI가 자동으로 계약서 초안을 생성하여 Google Drive에 저장합니다',
    category: 'AI 자동화',
    icon: '✍️',
    trigger: '계약 요청 이메일',
    action: 'AI 문서 생성 + Drive 저장',
    tags: ['AI', '계약서', '문서'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: { keywords: ['계약', '계약서', 'contract'] }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: 'document_generate', doc_type: 'contract' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'webhook_call', config: { service: 'google_drive', action: 'create_doc' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },
  {
    id: 'ai_sentiment_analysis',
    title: 'AI 고객 감성 분석 & 대응',
    description: '고객 이메일의 감성을 AI가 분석하여 부정적 피드백에 즉시 대응합니다',
    category: 'AI 자동화',
    icon: '😊',
    trigger: '고객 이메일 수신',
    action: 'AI 감성 분석 + 조건 처리',
    tags: ['AI', '감성분석', 'CX'],
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'new_email', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: 'sentiment_analysis' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'condition', nodeType: 'if_else', config: { condition: 'sentiment == negative' }, position: { x: 0, y: 240 } },
      { id: '4', type: 'action', nodeType: 'slack_message', config: { channel: '#cx-alerts', message: '⚠️ 부정 피드백 감지: {{email.subject}}' }, position: { x: 0, y: 360 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', label: '부정' },
    ],
  },
  {
    id: 'ai_meeting_prep',
    title: 'AI 회의 준비 브리핑',
    description: '회의 30분 전 AI가 관련 자료를 자동 수집하고 브리핑 문서를 생성합니다',
    category: 'AI 자동화',
    icon: '🗓️',
    trigger: '회의 30분 전',
    action: 'AI 브리핑 생성 + Slack 발송',
    tags: ['AI', '회의', '브리핑'],
    popular: true,
    nodes: [
      { id: '1', type: 'trigger', nodeType: 'schedule', config: { before_event_minutes: 30 }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', nodeType: 'ai_summarize', config: { task: '회의 참가자 및 의제를 기반으로 브리핑을 작성하세요' }, position: { x: 0, y: 120 } },
      { id: '3', type: 'action', nodeType: 'slack_message', config: { channel: '@me', message: '📋 {{meeting.title}} 브리핑이 준비되었습니다:\n{{ai.result}}' }, position: { x: 0, y: 240 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },
];

export const TEMPLATE_CATEGORIES = ['전체', '이메일', '일정 관리', '팀 협업', '데이터 관리', '알림', 'AI 자동화'] as const;
export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];
