import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - list user's snippets
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { data } = await supabase
    .from('email_snippets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ snippets: data ?? [] });
}

// POST - create snippet
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { title, content, shortcut } = await request.json();
  if (!title || !content) {
    return NextResponse.json({ error: '제목과 내용이 필요합니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('email_snippets')
    .insert({ user_id: user.id, title, content, shortcut })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ snippet: data });
}

// DELETE - delete snippet
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { id } = await request.json();
  await supabase.from('email_snippets').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';
