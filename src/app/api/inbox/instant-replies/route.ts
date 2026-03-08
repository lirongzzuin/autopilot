import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';
import { checkRateLimit, ApiError, truncateText, safeJsonParse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const allowed = await checkRateLimit(`reply:${user.id}`);
  if (!allowed) return ApiError.tooManyRequests();

  const { emailId } = await request.json();
  if (!emailId || typeof emailId !== 'string') return ApiError.badRequest('emailId가 필요합니다');

  const adminClient = createAdminClient();
  const { data: email } = await adminClient
    .from('email_items')
    .select('sender_name, subject, body, snippet')
    .eq('id', emailId)
    .eq('user_id', user.id)
    .single();

  if (!email) return ApiError.notFound('이메일을 찾을 수 없습니다');

  const emailBody = truncateText(email.body || email.snippet, 2000);

  const response = await callAI({
    task: 'email_instant_reply',
    userId: user.id,
    input: `발신자: ${email.sender_name}\n제목: ${email.subject}\n내용: ${emailBody}`,
    systemPrompt: `당신은 한국어 비즈니스 이메일 답장 생성기입니다. 주어진 이메일에 대해 3가지 서로 다른 톤의 짧은 답장을 생성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "replies": [
    { "tone": "formal", "label": "정중한 답장", "content": "..." },
    { "tone": "friendly", "label": "친근한 답장", "content": "..." },
    { "tone": "concise", "label": "간결한 답장", "content": "..." }
  ]
}

각 답장은 2-4문장으로 짧고 실용적이어야 합니다. 인사말 포함하세요.`,
    options: { maxTokens: 500, temperature: 0.7 },
  });

  const parsed = safeJsonParse<{ replies: Array<{ tone: string; label: string; content: string }> }>(
    response.content,
    { replies: [] }
  );

  return NextResponse.json({ replies: parsed.replies, model: response.model });
}
