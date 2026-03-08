-- AutoPilot 초기 DB 스키마
-- Supabase PostgreSQL 기반

-- 사용자 프로필 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  job_title TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'team')),
  ai_mode TEXT DEFAULT 'platform' CHECK (ai_mode IN ('platform', 'byok')),
  selected_provider TEXT DEFAULT 'openai' CHECK (selected_provider IN ('openai', 'anthropic', 'google')),
  selected_model TEXT DEFAULT 'gpt-4o-mini',
  ai_credits_remaining INTEGER DEFAULT 1000,
  ai_credits_total INTEGER DEFAULT 1000,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  focus_mode BOOLEAN DEFAULT FALSE,
  dnd_until TIMESTAMPTZ,
  webhook_secret TEXT, -- 외부 웹훅 수신용 시크릿 키
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 AI API 키 (암호화 저장)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google')),
  encrypted_key TEXT NOT NULL,
  model TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- 자동화 규칙
CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 자동화 실행 로그
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 연결된 외부 서비스 (OAuth 토큰 암호화 저장)
CREATE TABLE IF NOT EXISTS connected_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('gmail', 'outlook', 'slack', 'teams', 'jira', 'notion', 'google_drive', 'google_sheets', 'google_calendar')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  account_email TEXT,
  account_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- 이메일 아이템 (AI 분석 결과 포함)
CREATE TABLE IF NOT EXISTS email_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  subject TEXT NOT NULL DEFAULT '',
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  snippet TEXT DEFAULT '',
  body TEXT DEFAULT '',
  ai_summary TEXT,
  ai_priority TEXT CHECK (ai_priority IN ('urgent', 'important', 'normal', 'spam')),
  ai_action_items JSONB DEFAULT '[]',
  ai_draft_reply TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  snoozed_until TIMESTAMPTZ,
  ai_category TEXT DEFAULT 'other' CHECK (ai_category IN ('team', 'vip', 'newsletter', 'notification', 'other')),
  is_starred BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, external_id)
);

-- 이메일 분류 학습 데이터 (few-shot learning)
CREATE TABLE IF NOT EXISTS email_classifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  email_id UUID REFERENCES email_items(id) ON DELETE CASCADE,
  original_priority TEXT,
  corrected_priority TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 문서 템플릿
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  content TEXT DEFAULT '',
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 규칙
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('email', 'slack', 'jira', 'website', 'rss')),
  conditions JSONB DEFAULT '[]',
  channels JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구독 정보 (토스페이먼츠 빌링키 포함)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'team')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'processing')),
  billing_key TEXT, -- AES-256 암호화
  customer_key TEXT NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 이력
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'refunded')),
  order_id TEXT NOT NULL UNIQUE,
  payment_key TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이메일 스니펫 (자주 쓰는 답장 템플릿)
CREATE TABLE IF NOT EXISTS email_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shortcut TEXT, -- /greet, /thanks 등
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 차단된 발신자
CREATE TABLE IF NOT EXISTS blocked_senders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  reason TEXT, -- 'manual' | 'spam'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sender_email)
);

-- 이메일 리마인더
CREATE TABLE IF NOT EXISTS email_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  email_id UUID REFERENCES email_items(id) ON DELETE CASCADE NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 사용량 로그
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  task TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_krw INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;

-- user_profiles RLS
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- user_api_keys RLS
CREATE POLICY "users_own_api_keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- automations RLS
CREATE POLICY "users_own_automations" ON automations
  FOR ALL USING (auth.uid() = user_id);

-- automation_logs RLS
CREATE POLICY "users_own_automation_logs" ON automation_logs
  FOR ALL USING (auth.uid() = user_id);

-- connected_services RLS
CREATE POLICY "users_own_services" ON connected_services
  FOR ALL USING (auth.uid() = user_id);

-- email_items RLS
CREATE POLICY "users_own_emails" ON email_items
  FOR ALL USING (auth.uid() = user_id);

-- email_classifications RLS
CREATE POLICY "users_own_classifications" ON email_classifications
  FOR ALL USING (auth.uid() = user_id);

-- documents RLS (공개 문서는 전체 읽기 허용)
CREATE POLICY "users_own_documents" ON documents
  FOR ALL USING (auth.uid() = user_id OR is_public = TRUE);

-- alerts RLS
CREATE POLICY "users_own_alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- subscriptions RLS
CREATE POLICY "users_own_subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- billing_history RLS
CREATE POLICY "users_own_billing" ON billing_history
  FOR ALL USING (auth.uid() = user_id);

-- ai_usage_logs RLS
CREATE POLICY "users_own_ai_logs" ON ai_usage_logs
  FOR ALL USING (auth.uid() = user_id);

-- email_snippets RLS
CREATE POLICY "users_own_snippets" ON email_snippets
  FOR ALL USING (auth.uid() = user_id);

-- blocked_senders RLS
CREATE POLICY "users_own_blocked_senders" ON blocked_senders
  FOR ALL USING (auth.uid() = user_id);

-- email_reminders RLS
CREATE POLICY "users_own_reminders" ON email_reminders
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- 인덱스
-- =====================

CREATE INDEX IF NOT EXISTS idx_email_items_user_priority ON email_items(user_id, ai_priority);
CREATE INDEX IF NOT EXISTS idx_email_items_received ON email_items(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_items_snoozed ON email_items(user_id, snoozed_until) WHERE snoozed_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_automations_user_active ON automations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automation_logs_user_date ON automation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation ON automation_logs(automation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_date ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_user ON billing_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status) WHERE status IN ('active', 'processing');
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_blocked_senders_user ON blocked_senders(user_id);
CREATE INDEX IF NOT EXISTS idx_email_reminders_user_date ON email_reminders(user_id, remind_at) WHERE is_completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_email_items_category ON email_items(user_id, ai_category);
CREATE INDEX IF NOT EXISTS idx_email_items_starred ON email_items(user_id) WHERE is_starred = TRUE;

-- =====================
-- 함수: 신규 사용자 프로필 자동 생성
-- =====================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, marketing_consent)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'marketing_consent')::BOOLEAN
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- 함수: updated_at 자동 갱신
-- =====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
