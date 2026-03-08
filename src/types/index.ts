// ============================
// 사용자 & 인증 타입
// ============================

export type PlanType = 'free' | 'starter' | 'pro' | 'team';
export type AIProvider = 'openai' | 'anthropic' | 'google';
export type AIMode = 'platform' | 'byok';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  job_title: string | null;
  timezone: string;
  avatar_url: string | null;
  plan: PlanType;
  ai_mode: AIMode;
  selected_provider: AIProvider;
  selected_model: string;
  ai_credits_remaining: number;
  ai_credits_total: number;
  onboarding_completed: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

// ============================
// AI 관련 타입
// ============================

export type AIModel =
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'claude-haiku-4-5-20251001'
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-6'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro';

export interface AIRequest {
  task: 'email_summary' | 'email_classify' | 'email_draft' | 'document_generate' | 'workflow_parse' | 'translate' | 'general';
  input: string;
  userId: string;
  systemPrompt?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: AIModel;
  };
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costKrw: number;
  };
}

export interface UserApiKey {
  id: string;
  user_id: string;
  provider: AIProvider;
  encrypted_key: string;
  model: AIModel;
  is_active: boolean;
  created_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  task: string;
  model: string;
  provider: AIProvider;
  input_tokens: number;
  output_tokens: number;
  cost_krw: number;
  created_at: string;
}

// ============================
// 자동화 관련 타입
// ============================

export type TriggerType =
  | 'new_email'
  | 'schedule'
  | 'slack_message'
  | 'webhook'
  | 'manual'
  | 'sheets_row_added';

export type ActionType =
  | 'send_email'
  | 'slack_message'
  | 'create_jira_issue'
  | 'create_notion_page'
  | 'add_sheets_row'
  | 'ai_summarize'
  | 'webhook_call'
  | 'delay';

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  nodeType: TriggerType | ActionType | 'if_else' | 'keyword_match' | 'sender_filter' | 'ai_classify';
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  status: 'success' | 'failed' | 'running';
  error_message: string | null;
  execution_time_ms: number;
  created_at: string;
}

// ============================
// 이메일 관련 타입
// ============================

export type EmailPriority = 'urgent' | 'important' | 'normal' | 'spam';

export interface EmailItem {
  id: string;
  user_id: string;
  external_id: string;
  provider: 'gmail' | 'outlook';
  subject: string;
  sender_name: string;
  sender_email: string;
  snippet: string;
  body: string;
  ai_summary: string | null;
  ai_priority: EmailPriority | null;
  ai_action_items: string[];
  ai_draft_reply: string | null;
  is_read: boolean;
  snoozed_until: string | null;
  received_at: string;
  created_at: string;
}

// ============================
// 구독/결제 관련 타입
// ============================

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  billing_key: string | null;
  customer_key: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: 'KRW';
  status: 'success' | 'failed' | 'refunded';
  order_id: string;
  payment_key: string | null;
  plan: PlanType;
  created_at: string;
}

// ============================
// 요금제 정의
// ============================

export const PLAN_LIMITS = {
  free: {
    name: '무료',
    price_monthly: 0,
    price_yearly: 0,
    automations: 2,
    emails_per_month: 30,
    ai_credits: 1000,
    models: ['gpt-4o-mini', 'gemini-2.5-flash'] as AIModel[],
    features: ['자동화 2개', '이메일 30건/월', 'AI 크레딧 1,000', 'BYOK 지원', '기본 이메일 분류'],
  },
  starter: {
    name: 'Starter',
    price_monthly: 9900,
    price_yearly: 7900,
    automations: 15,
    emails_per_month: 500,
    ai_credits: 30000,
    models: ['gpt-4o-mini', 'gemini-2.5-flash', 'claude-haiku-4-5-20251001'] as AIModel[],
    features: ['자동화 15개', '이메일 500건/월', 'AI 크레딧 30,000', 'BYOK 지원', '이메일 스누즈', '일일 다이제스트'],
  },
  pro: {
    name: 'Pro',
    price_monthly: 24900,
    price_yearly: 19900,
    automations: -1, // unlimited
    emails_per_month: -1,
    ai_credits: 200000,
    models: ['gpt-4o-mini', 'gpt-4o', 'gemini-2.5-flash', 'gemini-2.5-pro', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-6'] as AIModel[],
    features: ['무제한 자동화', '무제한 이메일', 'AI 크레딧 200,000', '전체 AI 모델 (GPT-4o, Sonnet)', '문서 AI 생성', '사용량 분석', '우선 지원'],
  },
  team: {
    name: 'Team',
    price_monthly: 19900,
    price_yearly: 15900,
    automations: -1,
    emails_per_month: -1,
    ai_credits: 200000,
    models: ['gpt-4o-mini', 'gpt-4o', 'gemini-2.5-flash', 'gemini-2.5-pro', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-6'] as AIModel[],
    features: ['Pro 전체 기능 (인당)', '팀 공유 자동화', '관리자 대시보드', '팀 사용량 분석', 'SSO (SAML)', '감사 로그', '전담 CS'],
  },
} as const;

export const AI_MODEL_INFO: Record<AIModel, { name: string; provider: AIProvider; tier: 'basic' | 'advanced' | 'premium'; costPer1MInput: number; costPer1MOutput: number }> = {
  'gpt-4o-mini': { name: 'GPT-4o mini', provider: 'openai', tier: 'basic', costPer1MInput: 0.15, costPer1MOutput: 0.60 },
  'gpt-4o': { name: 'GPT-4o', provider: 'openai', tier: 'advanced', costPer1MInput: 2.50, costPer1MOutput: 10.00 },
  'claude-haiku-4-5-20251001': { name: 'Claude Haiku 4.5', provider: 'anthropic', tier: 'basic', costPer1MInput: 1.00, costPer1MOutput: 5.00 },
  'claude-sonnet-4-6': { name: 'Claude Sonnet 4.6', provider: 'anthropic', tier: 'advanced', costPer1MInput: 3.00, costPer1MOutput: 15.00 },
  'claude-opus-4-6': { name: 'Claude Opus 4.6', provider: 'anthropic', tier: 'premium', costPer1MInput: 15.00, costPer1MOutput: 75.00 },
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', provider: 'google', tier: 'basic', costPer1MInput: 0.15, costPer1MOutput: 0.60 },
  'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', provider: 'google', tier: 'advanced', costPer1MInput: 1.25, costPer1MOutput: 10.00 },
};

// ============================
// 알림 관련 타입
// ============================

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  source: 'email' | 'slack' | 'jira' | 'website' | 'rss';
  conditions: AlertCondition[];
  channels: AlertChannel[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface AlertCondition {
  type: 'keyword' | 'sender' | 'threshold' | 'ai_sentiment' | 'time_based';
  value: string | number;
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than';
}

export interface AlertChannel {
  type: 'in_app' | 'email' | 'slack' | 'browser_push';
  config: Record<string, string>;
}

// ============================
// 연결된 서비스 타입
// ============================

export type ConnectedServiceType = 'gmail' | 'outlook' | 'slack' | 'teams' | 'jira' | 'notion' | 'google_drive' | 'google_sheets' | 'google_calendar';

export interface ConnectedService {
  id: string;
  user_id: string;
  service: ConnectedServiceType;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  account_email: string | null;
  account_name: string | null;
  is_active: boolean;
  created_at: string;
}
