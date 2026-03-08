import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

/**
 * 이메일 스누즈 (나중에 다시 알림)
 * POST /api/inbox/snooze
 * Body: { emailId: string, snoozeUntil: string (ISO) }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { emailId, snoozeUntil } = await request.json();
  if (!emailId || typeof emailId !== 'string') return ApiError.badRequest('emailId가 필요합니다');
  if (!snoozeUntil || typeof snoozeUntil !== 'string') return ApiError.badRequest('snoozeUntil이 필요합니다');

  // Validate ISO date
  const date = new Date(snoozeUntil);
  if (isNaN(date.getTime())) return ApiError.badRequest('유효하지 않은 날짜입니다');
  if (date <= new Date()) return ApiError.badRequest('과거 시점으로 스누즈할 수 없습니다');

  const { error } = await supabase
    .from('email_items')
    .update({ snoozed_until: snoozeUntil, is_read: true })
    .eq('id', emailId)
    .eq('user_id', user.id);

  if (error) return ApiError.internal('스누즈 설정 실패');
  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';
