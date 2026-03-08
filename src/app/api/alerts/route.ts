import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError, validateString } from '@/lib/api-utils';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ alerts: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const body = await request.json();
  const { name, source, conditions, channels } = body;

  if (!validateString(name, 100)) return ApiError.badRequest('이름을 입력해주세요');

  const validSources = ['email', 'slack', 'jira', 'website', 'rss'];
  if (!validSources.includes(source)) return ApiError.badRequest('유효하지 않은 소스입니다');

  const { data, error } = await supabase.from('alerts').insert({
    user_id: user.id,
    name,
    source,
    conditions: conditions ?? [],
    channels: channels ?? [],
  }).select().single();

  if (error) return ApiError.internal('알림 생성 실패');
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return ApiError.badRequest('id가 필요합니다');

  const { error } = await supabase.from('alerts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return ApiError.internal('알림 수정 실패');
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const { id } = await request.json();
  if (!id) return ApiError.badRequest('id가 필요합니다');

  await supabase.from('alerts').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
