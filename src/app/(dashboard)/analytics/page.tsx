import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Recharts는 무거우므로 동적 임포트로 번들 분리
const AnalyticsClient = dynamic(() => import('./AnalyticsClient').then(m => ({ default: m.AnalyticsClient })), {
  loading: () => <div className="flex items-center justify-center h-64 text-slate-400">분석 데이터 로딩 중...</div>,
});

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { data: profile },
    { data: usageLogs },
    { data: automationLogs },
    { data: emailStats },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('ai_usage_logs')
      .select('task, model, cost_krw, input_tokens, output_tokens, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
    supabase
      .from('automation_logs')
      .select('status, execution_time_ms, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
    supabase
      .from('email_items')
      .select('ai_priority, is_read, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo),
  ]);

  return (
    <AnalyticsClient
      profile={profile}
      usageLogs={usageLogs ?? []}
      automationLogs={automationLogs ?? []}
      emailStats={emailStats ?? []}
    />
  );
}
