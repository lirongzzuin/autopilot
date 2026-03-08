import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 이메일 읽음/읽지 않음 표시
 * POST /api/inbox/read
 * Body: { emailId: string, isRead: boolean }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { emailId, isRead } = await request.json();

  const { error } = await supabase
    .from('email_items')
    .update({ is_read: isRead })
    .eq('id', emailId)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: '업데이트 실패' }, { status: 500 });
  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';
