import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { emailId, isStarred } = await request.json();
  if (!emailId || typeof emailId !== 'string') return ApiError.badRequest('emailId가 필요합니다');

  const { error } = await supabase
    .from('email_items')
    .update({ is_starred: !!isStarred })
    .eq('id', emailId)
    .eq('user_id', user.id);

  if (error) return ApiError.internal('별표 실패');
  return NextResponse.json({ success: true });
}
