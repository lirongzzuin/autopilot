import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 이메일 스누즈 (나중에 다시 알림)
 * POST /api/inbox/snooze
 * Body: { emailId: string, snoozeUntil: string (ISO) }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { emailId, snoozeUntil } = await request.json();
  if (!emailId || !snoozeUntil) {
    return NextResponse.json({ error: '필수 파라미터가 없습니다' }, { status: 400 });
  }

  const { error } = await supabase
    .from('email_items')
    .update({ snoozed_until: snoozeUntil, is_read: true })
    .eq('id', emailId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: '스누즈 설정 실패' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';
