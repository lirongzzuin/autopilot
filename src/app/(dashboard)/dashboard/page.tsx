import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, automationsRes, emailsRes, logsRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('automations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('email_items').select('*').eq('user_id', user.id).order('received_at', { ascending: false }).limit(10),
    supabase.from('ai_usage_logs').select('*').eq('user_id', user.id).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const stats = {
    emailsToday: emailsRes.data?.filter(e => new Date(e.received_at).toDateString() === new Date().toDateString()).length ?? 0,
    urgentEmails: emailsRes.data?.filter(e => e.ai_priority === 'urgent').length ?? 0,
    automationsRun: logsRes.data?.length ?? 0,
    timeSavedMinutes: (logsRes.data?.length ?? 0) * 3, // 자동화 1건당 3분 절약 추정
  };

  return (
    <DashboardClient
      profile={profileRes.data}
      recentAutomations={automationsRes.data ?? []}
      recentEmails={emailsRes.data ?? []}
      weeklyUsageLogs={logsRes.data ?? []}
      stats={stats}
    />
  );
}
