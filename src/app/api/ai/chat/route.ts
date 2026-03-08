import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';
import { ApiError, checkRateLimit, validateString, truncateText } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  if (!(await checkRateLimit(`chat:${user.id}`))) return ApiError.tooManyRequests();

  const body = await request.json().catch(() => ({}));
  const { message, history = [] } = body;

  if (!validateString(message, 1000)) {
    return ApiError.badRequest('메시지는 1000자 이하의 문자열이어야 합니다');
  }
  if (!Array.isArray(history)) {
    return ApiError.badRequest('history는 배열이어야 합니다');
  }

  const [
    { data: profile },
    { data: recentEmails },
    { data: automations },
    { data: usageLogs },
  ] = await Promise.all([
    supabase.from('user_profiles').select('plan, ai_credits_remaining, ai_credits_total, full_name').eq('id', user.id).single(),
    supabase.from('email_items').select('subject, sender_name, ai_priority').eq('user_id', user.id).order('received_at', { ascending: false }).limit(5),
    supabase.from('automations').select('name, is_active, run_count').eq('user_id', user.id).order('run_count', { ascending: false }).limit(5),
    supabase.from('ai_usage_logs').select('cost_krw').eq('user_id', user.id).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  const totalCost = (usageLogs ?? []).reduce((sum, l) => sum + (l.cost_krw ?? 0), 0);

  const systemPrompt = `당신은 AutoPilot의 AI 어시스턴트입니다. 사용자의 업무 자동화를 도와주는 친절하고 전문적인 AI입니다.

현재 사용자 정보:
- 이름: ${profile?.full_name ?? '사용자'}
- 플랜: ${profile?.plan ?? 'free'}
- AI 크레딧: ${profile?.ai_credits_remaining?.toLocaleString() ?? 0} / ${profile?.ai_credits_total?.toLocaleString() ?? 0}
- 이번 달 AI 비용: ₩${Math.round(totalCost).toLocaleString()}

최근 이메일:
${(recentEmails ?? []).map(e => `- [${e.ai_priority ?? '미분류'}] ${truncateText(e.subject, 50)} (from ${e.sender_name})`).join('\n') || '없음'}

활성 자동화:
${(automations ?? []).map(a => `- ${a.name} (${a.is_active ? '활성' : '중지'}, ${a.run_count}회)`).join('\n') || '없음'}

답변 지침: 한국어로 간결하게 (3-5문장). 자동화 생성 요청 시 /automations/new 안내. 마크다운 사용 가능.`;

  const recentHistory = (history as Array<{ role: string; content: string }>)
    .slice(-6)
    .map(h => `${h.role === 'user' ? '사용자' : 'AI'}: ${truncateText(h.content, 500)}`);

  const fullInput = recentHistory.length > 0
    ? [...recentHistory, `사용자: ${message}`].join('\n')
    : message;

  try {
    const response = await callAI({
      task: 'general',
      input: fullInput,
      userId: user.id,
      systemPrompt,
      options: { maxTokens: 600 },
    });
    return NextResponse.json({ reply: response.content, model: response.model });
  } catch (e) {
    console.error('[AI Chat] 오류:', e);
    return ApiError.internal('AI 응답 생성에 실패했습니다');
  }
}

export const dynamic = 'force-dynamic';
