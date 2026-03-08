import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notifications: [] });

  // Get recent automation logs (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { data: automationLogs },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('automation_logs')
      .select('id, status, error_message, created_at, automations(name)')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('user_profiles').select('ai_credits_remaining, ai_credits_total').eq('id', user.id).single(),
  ]);

  const notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    created_at: string;
    is_read: boolean;
  }> = [];

  // Credit warning
  if (profile && profile.ai_credits_total > 0) {
    const pct = profile.ai_credits_remaining / profile.ai_credits_total;
    if (pct < 0.15) {
      notifications.push({
        id: 'credit_warning',
        type: 'credit_low',
        title: 'AI 크레딧 부족',
        body: `남은 크레딧이 ${profile.ai_credits_remaining.toLocaleString()}개입니다. 플랜을 업그레이드하세요.`,
        created_at: new Date().toISOString(),
        is_read: false,
      });
    }
  }

  // Automation logs
  (automationLogs ?? []).forEach((log: any) => {
    const automationName = log.automations?.name ?? '자동화';
    notifications.push({
      id: log.id,
      type: log.status === 'success' ? 'automation_success' : 'automation_failed',
      title: log.status === 'success' ? `${automationName} 실행 완료` : `${automationName} 실행 실패`,
      body: log.status === 'success' ? '자동화가 성공적으로 실행되었습니다.' : (log.error_message ?? '오류가 발생했습니다.'),
      created_at: log.created_at,
      is_read: false,
    });
  });

  // Sort by date
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ notifications: notifications.slice(0, 15) });
}

export const dynamic = 'force-dynamic';
