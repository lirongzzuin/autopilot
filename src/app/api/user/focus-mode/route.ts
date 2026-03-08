import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { focusMode, dndUntil } = await request.json();

  await supabase.from('user_profiles').update({
    focus_mode: !!focusMode,
    dnd_until: dndUntil ?? null,
  }).eq('id', user.id);

  return NextResponse.json({ success: true });
}
