import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, buildDocumentPrompt } from '@/lib/ai/router';
import { ApiError, checkRateLimit, validateEnum, validateString } from '@/lib/api-utils';

const VALID_CATEGORIES = ['report', 'meeting', 'proposal', 'email', 'invoice', 'general'] as const;
const DOC_TYPE_MAP: Record<string, string> = {
  report: '업무 보고서',
  meeting: '회의록',
  proposal: '제안서',
  email: '이메일 템플릿',
  invoice: '인보이스',
  general: '비즈니스 문서',
};

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  // Rate limiting
  if (!(await checkRateLimit(`doc:${user.id}`))) return ApiError.tooManyRequests();

  const body = await request.json().catch(() => ({}));
  const { prompt, category } = body;

  // 입력 검증
  if (!validateString(prompt, 2000)) {
    return ApiError.badRequest('prompt는 2000자 이하의 문자열이어야 합니다');
  }
  if (!validateEnum(category, [...VALID_CATEGORIES])) {
    return ApiError.badRequest(`category는 ${VALID_CATEGORIES.join(', ')} 중 하나여야 합니다`);
  }

  const docType = DOC_TYPE_MAP[category];

  try {
    const response = await callAI({
      task: 'document_generate',
      userId: user.id,
      input: buildDocumentPrompt(docType, prompt),
      options: { maxTokens: 2000, temperature: 0.4 },
    });

    // 생성된 문서 DB 저장
    const adminClient = (await import('@/lib/supabase/server')).createAdminClient();
    await adminClient.from('documents').insert({
      user_id: user.id,
      title: `${docType} - ${new Date().toLocaleDateString('ko-KR')}`,
      category,
      content: response.content,
    }).catch(() => {}); // 저장 실패해도 응답은 반환

    return NextResponse.json({ content: response.content, model: response.model });
  } catch (e) {
    console.error('[Documents] 생성 실패:', e);
    return ApiError.internal('문서 생성에 실패했습니다');
  }
}

export const dynamic = 'force-dynamic';
