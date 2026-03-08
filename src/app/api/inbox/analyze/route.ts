import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { callAI, EMAIL_CLASSIFY_PROMPT } from '@/lib/ai/router';
import { ApiError, checkRateLimit, safeJsonParse, truncateText } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  // Rate limiting
  if (!(await checkRateLimit(user.id))) return ApiError.tooManyRequests();

  const body = await request.json().catch(() => ({}));
  const { emailId } = body;

  // emailId가 있으면 string 타입 검증
  if (emailId !== undefined && (typeof emailId !== 'string' || emailId.length > 100)) {
    return ApiError.badRequest('유효하지 않은 emailId입니다');
  }

  const adminClient = createAdminClient();

  // 이메일 조회 (RLS 우회, user_id로 소유권 검증)
  let query = adminClient
    .from('email_items')
    .select('id, subject, sender_name, sender_email, body, snippet')
    .eq('user_id', user.id);

  if (emailId) {
    query = query.eq('id', emailId);
  } else {
    // 미분석 이메일만, 한 번에 최대 10개 처리 (타임아웃 방지)
    query = query.is('ai_summary', null).limit(10);
  }

  const { data: emails, error } = await query;
  if (error || !emails) return ApiError.internal('이메일 조회 실패');
  if (emails.length === 0) return NextResponse.json({ analyzed: 0, total: 0 });

  // 순차 처리 (병렬 AI 호출 시 rate limit 초과 방지)
  let succeeded = 0;
  for (const email of emails) {
    try {
      const bodyText = truncateText(email.body || email.snippet, 3000);
      const response = await callAI({
        task: 'email_classify',
        userId: user.id,
        input: `제목: ${email.subject}\n발신자: ${email.sender_name} <${email.sender_email}>\n내용:\n${bodyText}`,
        systemPrompt: EMAIL_CLASSIFY_PROMPT,
        options: { maxTokens: 500 },
      });

      const parsed = safeJsonParse<{
        priority?: string;
        summary?: string;
        action_items?: string[];
      }>(response.content, {});

      await adminClient.from('email_items').update({
        ai_priority: (['urgent', 'important', 'normal', 'spam'].includes(parsed.priority ?? '') ? parsed.priority : 'normal'),
        ai_summary: parsed.summary ?? '',
        ai_action_items: Array.isArray(parsed.action_items) ? parsed.action_items.slice(0, 5) : [],
      }).eq('id', email.id);

      succeeded++;
    } catch (e) {
      console.error(`[Inbox Analyze] 이메일 ${email.id} 분석 실패:`, e);
    }
  }

  return NextResponse.json({ analyzed: succeeded, total: emails.length });
}

export const dynamic = 'force-dynamic';
