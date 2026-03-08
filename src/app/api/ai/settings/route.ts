import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto';
import { checkRateLimit, ApiError, validateEnum } from '@/lib/api-utils';
import type { AIProvider } from '@/types';

const ALLOWED_MODES = ['platform', 'byok'] as const;
const ALLOWED_PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'google'];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const allowed = await checkRateLimit(`settings:${user.id}`);
  if (!allowed) return ApiError.tooManyRequests();

  const body = await request.json();
  const { aiMode, selectedModel, apiKeys } = body;

  if (!validateEnum(aiMode, [...ALLOWED_MODES])) {
    return ApiError.badRequest('유효하지 않은 AI 모드입니다');
  }

  if (selectedModel && typeof selectedModel !== 'string') {
    return ApiError.badRequest('유효하지 않은 모델명입니다');
  }

  await supabase.from('user_profiles').update({
    ai_mode: aiMode,
    selected_model: selectedModel,
  }).eq('id', user.id);

  if (aiMode === 'byok' && apiKeys && typeof apiKeys === 'object') {
    for (const [provider, key] of Object.entries(apiKeys)) {
      if (!key || typeof key !== 'string') continue;
      if (!ALLOWED_PROVIDERS.includes(provider as AIProvider)) continue;

      const encryptedKey = await encrypt(key);
      const providerStr = provider as AIProvider;

      await supabase.from('user_api_keys').upsert({
        user_id: user.id,
        provider: providerStr,
        encrypted_key: encryptedKey,
        model: selectedModel,
        is_active: true,
      }, { onConflict: 'user_id,provider' });
    }
  }

  return NextResponse.json({ success: true });
}
