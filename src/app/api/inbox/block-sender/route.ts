import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

// GET: List blocked senders
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { data } = await supabase
    .from('blocked_senders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ blockedSenders: data ?? [] });
}

// POST: Block a sender
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { senderEmail, senderName, reason } = await request.json();
  if (!senderEmail || typeof senderEmail !== 'string') return ApiError.badRequest('senderEmail이 필요합니다');

  const { error } = await supabase.from('blocked_senders').upsert({
    user_id: user.id,
    sender_email: senderEmail.toLowerCase().trim(),
    sender_name: senderName ?? null,
    reason: reason ?? 'manual',
  }, { onConflict: 'user_id,sender_email' });

  if (error) return ApiError.internal('차단 실패');

  return NextResponse.json({ success: true });
}

// DELETE: Unblock a sender
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { senderEmail } = await request.json();
  if (!senderEmail) return ApiError.badRequest('senderEmail이 필요합니다');

  await supabase.from('blocked_senders')
    .delete()
    .eq('user_id', user.id)
    .eq('sender_email', senderEmail.toLowerCase().trim());

  return NextResponse.json({ success: true });
}
