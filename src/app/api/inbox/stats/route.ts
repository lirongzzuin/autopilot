import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { data: emails },
    { data: blocked },
    { data: reminders },
  ] = await Promise.all([
    supabase
      .from('email_items')
      .select('ai_priority, ai_category, is_read, received_at')
      .eq('user_id', user.id)
      .gte('received_at', thirtyDaysAgo),
    supabase.from('blocked_senders').select('id').eq('user_id', user.id),
    supabase.from('email_reminders').select('id').eq('user_id', user.id).eq('is_completed', false),
  ]);

  const emailList = emails ?? [];

  // Daily email volume for last 7 days
  const dailyVolume: Record<string, number> = {};
  emailList.forEach(e => {
    const day = new Date(e.received_at).toISOString().split('T')[0];
    dailyVolume[day] = (dailyVolume[day] ?? 0) + 1;
  });

  // Category distribution
  const categories: Record<string, number> = {};
  emailList.forEach(e => {
    const cat = e.ai_category ?? 'other';
    categories[cat] = (categories[cat] ?? 0) + 1;
  });

  // Priority distribution
  const priorities: Record<string, number> = {};
  emailList.forEach(e => {
    const p = e.ai_priority ?? 'unanalyzed';
    priorities[p] = (priorities[p] ?? 0) + 1;
  });

  const readRate = emailList.length > 0
    ? emailList.filter(e => e.is_read).length / emailList.length
    : 0;

  return NextResponse.json({
    total: emailList.length,
    readRate: Math.round(readRate * 100),
    blockedSenders: blocked?.length ?? 0,
    activeReminders: reminders?.length ?? 0,
    dailyVolume,
    categories,
    priorities,
  });
}

export const dynamic = 'force-dynamic';
