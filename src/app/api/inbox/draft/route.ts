import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';
import { checkRateLimit, ApiError, truncateText } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const allowed = await checkRateLimit(`draft:${user.id}`);
  if (!allowed) return ApiError.tooManyRequests();

  const body = await request.json();
  const { emailId } = body;

  if (!emailId || typeof emailId !== 'string') {
    return ApiError.badRequest('emailId가 필요합니다');
  }

  const adminClient = createAdminClient();
  const { data: email } = await adminClient
    .from('email_items')
    .select('sender_name, subject, body, snippet')
    .eq('id', emailId)
    .eq('user_id', user.id)
    .single();

  if (!email) return ApiError.notFound('이메일을 찾을 수 없습니다');

  const emailBody = truncateText(email.body || email.snippet, 3000);

  const response = await callAI({
    task: 'email_draft',
    userId: user.id,
    input: `다음 이메일에 대한 한국어 답장 초안을 작성해주세요.\n\n발신자: ${email.sender_name}\n제목: ${email.subject}\n내용: ${emailBody}`,
    systemPrompt: '당신은 전문적인 비즈니스 이메일 작성 AI입니다. 정중하고 명확한 한국어 비즈니스 답장을 작성하세요. 제목 없이 본문만 작성하세요.',
    options: { maxTokens: 500, temperature: 0.5 },
  });

  await adminClient
    .from('email_items')
    .update({ ai_draft_reply: response.content })
    .eq('id', emailId);

  return NextResponse.json({ draft: response.content, model: response.model });
}
