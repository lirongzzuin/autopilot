import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, ApiError, validateEnum } from '@/lib/api-utils';

const ALLOWED_PROVIDERS = ['openai', 'anthropic', 'google'] as const;
type Provider = typeof ALLOWED_PROVIDERS[number];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const allowed = await checkRateLimit(`validate-key:${user.id}`);
  if (!allowed) return ApiError.tooManyRequests();

  const body = await request.json();
  const { provider, apiKey } = body;

  if (!validateEnum(provider, [...ALLOWED_PROVIDERS])) {
    return ApiError.badRequest('지원하지 않는 AI 제공자입니다');
  }

  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    return ApiError.badRequest('유효하지 않은 API 키 형식입니다');
  }

  try {
    let valid = false;
    const p = provider as Provider;

    if (p === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      valid = res.ok;
    } else if (p === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      valid = res.ok;
    } else if (p === 'google') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      valid = res.ok;
    }

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
