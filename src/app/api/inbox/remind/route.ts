import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { emailId, remindAt } = await request.json();
  if (!emailId || typeof emailId !== 'string') return ApiError.badRequest('emailId가 필요합니다');
  if (!remindAt) return ApiError.badRequest('remindAt이 필요합니다');

  const { error } = await supabase.from('email_reminders').insert({
    user_id: user.id,
    email_id: emailId,
    remind_at: remindAt,
  });

  if (error) return ApiError.internal('리마인더 설정 실패');
  return NextResponse.json({ success: true });
}

// GET: Get active reminders
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { data } = await supabase
    .from('email_reminders')
    .select('*, email_items(subject, sender_name)')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .lte('remind_at', new Date().toISOString())
    .order('remind_at', { ascending: true });

  return NextResponse.json({ reminders: data ?? [] });
}
