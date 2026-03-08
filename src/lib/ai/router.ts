/**
 * AI 멀티 프로바이더 라우터
 * - 사용자 설정에 따라 OpenAI / Anthropic / Google 자동 선택
 * - 폴백: 1순위 실패 시 → 플랫폼 기본 모델로 전환
 * - BYOK: 사용자 API 키 사용 시 크레딧 미차감
 * - 캐싱: 동일 입력 24h 캐시 (Upstash Redis)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRequest, AIResponse, AI_MODEL_INFO } from '@/types';
import { cacheAIResponse, getCachedAIResponse, getRedis } from '@/lib/redis';
import { decrypt } from '@/lib/crypto';
import { createAdminClient } from '@/lib/supabase/server';
import { truncateText } from '@/lib/api-utils';
import crypto from 'crypto';

/** 캐시 키 생성 */
function makeCacheKey(req: AIRequest): string {
  const hash = crypto.createHash('sha256')
    .update(`${req.task}:${req.input}:${req.options?.model ?? 'default'}`)
    .digest('hex')
    .slice(0, 32);
  return hash;
}

/** 비용 계산 (KRW, 1 USD = 1,450 KRW) */
function calcCostKrw(model: string, inputTokens: number, outputTokens: number): number {
  const info = AI_MODEL_INFO[model as keyof typeof AI_MODEL_INFO];
  if (!info) return 0;
  const usd = (info.costPer1MInput * inputTokens + info.costPer1MOutput * outputTokens) / 1_000_000;
  return Math.ceil(usd * 1450);
}

/** 사용자 AI 설정 조회 (Redis 캐시 5분) */
async function getUserAIConfig(userId: string) {
  const cacheKey = `ai_config:${userId}`;
  try {
    const cached = await getRedis().get<string>(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* Redis 불가 시 DB 직접 조회 */ }

  const supabase = createAdminClient();
  const [{ data: profile }, { data: byokKey }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('ai_mode, selected_provider, selected_model, ai_credits_remaining')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const config = { profile, byokKey };
  try {
    await getRedis().setex(cacheKey, 300, JSON.stringify(config)); // 5분 캐시
  } catch { /* 캐시 저장 실패 무시 */ }

  return config;
}

/** OpenAI 호출 */
async function callOpenAI(apiKey: string, model: string, req: AIRequest): Promise<AIResponse> {
  const client = new OpenAI({ apiKey });
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  messages.push({ role: 'user', content: req.input });

  const res = await client.chat.completions.create({
    model,
    messages,
    max_tokens: req.options?.maxTokens ?? 1000,
    temperature: req.options?.temperature ?? 0.3,
  });

  const content = res.choices[0]?.message?.content ?? '';
  const inputTokens = res.usage?.prompt_tokens ?? 0;
  const outputTokens = res.usage?.completion_tokens ?? 0;

  return {
    content,
    model,
    provider: 'openai',
    usage: { inputTokens, outputTokens, costKrw: calcCostKrw(model, inputTokens, outputTokens) },
  };
}

/** Anthropic 호출 */
async function callAnthropic(apiKey: string, model: string, req: AIRequest): Promise<AIResponse> {
  const client = new Anthropic({ apiKey });

  const res = await client.messages.create({
    model,
    max_tokens: req.options?.maxTokens ?? 1000,
    system: req.systemPrompt,
    messages: [{ role: 'user', content: req.input }],
  });

  const content = res.content[0]?.type === 'text' ? res.content[0].text : '';
  const inputTokens = res.usage.input_tokens;
  const outputTokens = res.usage.output_tokens;

  return {
    content,
    model,
    provider: 'anthropic',
    usage: { inputTokens, outputTokens, costKrw: calcCostKrw(model, inputTokens, outputTokens) },
  };
}

/** Google AI 호출 */
async function callGoogle(apiKey: string, model: string, req: AIRequest): Promise<AIResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });
  const prompt = req.systemPrompt ? `${req.systemPrompt}\n\n${req.input}` : req.input;

  const result = await genModel.generateContent(prompt);
  const content = result.response.text();

  // Google AI는 정확한 토큰 수를 추정
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(content.length / 4);

  return {
    content,
    model,
    provider: 'google',
    usage: { inputTokens, outputTokens, costKrw: calcCostKrw(model, inputTokens, outputTokens) },
  };
}

/** 사용량 로그 기록 */
async function logUsage(userId: string, task: string, response: AIResponse): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      task,
      model: response.model,
      provider: response.provider,
      input_tokens: response.usage.inputTokens,
      output_tokens: response.usage.outputTokens,
      cost_krw: response.usage.costKrw,
    });
  } catch (e) {
    console.error('[AI Router] 사용량 로그 기록 실패:', e);
  }
}

/** 메인 AI 라우터 */
export async function callAI(req: AIRequest): Promise<AIResponse> {
  // 캐시 확인
  const cacheKey = makeCacheKey(req);
  const cached = await getCachedAIResponse(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached) as AIResponse;
  }

  const { profile, byokKey } = await getUserAIConfig(req.userId);
  const aiMode = profile?.ai_mode ?? 'platform';

  let response: AIResponse;

  // 입력 길이 제한 (토큰 폭발 방지)
  const safeInput = truncateText(req.input, 8000);
  const safeReq = { ...req, input: safeInput };

  try {
    if (aiMode === 'byok' && byokKey) {
      // BYOK: 사용자 자체 API 키 사용
      const decryptedKey = await decrypt(byokKey.encrypted_key);
      const model = safeReq.options?.model ?? byokKey.model;

      if (byokKey.provider === 'openai') {
        response = await callOpenAI(decryptedKey, model, safeReq);
      } else if (byokKey.provider === 'anthropic') {
        response = await callAnthropic(decryptedKey, model, safeReq);
      } else {
        response = await callGoogle(decryptedKey, model, safeReq);
      }
    } else {
      // 플랫폼 제공 AI
      const model = safeReq.options?.model ?? profile?.selected_model ?? 'gpt-4o-mini';
      const modelInfo = AI_MODEL_INFO[model as keyof typeof AI_MODEL_INFO];
      const provider = modelInfo?.provider ?? 'openai';

      if (provider === 'openai') {
        response = await callOpenAI(process.env.PLATFORM_OPENAI_API_KEY!, model, safeReq);
      } else if (provider === 'anthropic') {
        response = await callAnthropic(process.env.PLATFORM_ANTHROPIC_API_KEY!, model, safeReq);
      } else {
        response = await callGoogle(process.env.PLATFORM_GOOGLE_AI_API_KEY!, model, safeReq);
      }

      // 크레딧 차감
      const creditsUsed = response.usage.inputTokens + response.usage.outputTokens;
      const supabase = createAdminClient();
      await supabase
        .from('user_profiles')
        .update({ ai_credits_remaining: Math.max(0, (profile?.ai_credits_remaining ?? 0) - creditsUsed) })
        .eq('id', req.userId);

      // 캐시에서 크레딧 정보도 무효화
      await getRedis().del(`ai_config:${req.userId}`).catch(() => {});
    }
  } catch (primaryError) {
    console.error('[AI Router] 1순위 AI 호출 실패, 폴백 시도:', primaryError);
    // 폴백: GPT-4o mini 플랫폼 키로 재시도
    const fallbackKey = process.env.PLATFORM_OPENAI_API_KEY;
    if (!fallbackKey) throw new Error('플랫폼 AI 키가 설정되지 않았습니다');
    response = await callOpenAI(fallbackKey, 'gpt-4o-mini', safeReq);
  }

  // 결과 캐시 저장 (일반 작업만 캐시, document/chat은 캐시 제외)
  if (!['document_generate', 'general'].includes(req.task)) {
    await cacheAIResponse(cacheKey, JSON.stringify(response)).catch((e) =>
      console.warn('[Cache] 저장 실패:', e.message)
    );
  }
  // 비동기 사용량 로그 (응답 지연 없이)
  logUsage(req.userId, req.task, response).catch(() => {});

  return response;
}

/** 이메일 분류 프롬프트 */
export const EMAIL_CLASSIFY_PROMPT = `당신은 이메일 중요도를 분류하는 AI 어시스턴트입니다.
다음 이메일을 분석하여 아래 JSON 형식으로만 응답하세요:

{
  "priority": "urgent|important|normal|spam",
  "summary": "3줄 요약 (각 줄은 • 로 시작)",
  "action_items": ["액션아이템1", "액션아이템2"],
  "reason": "분류 이유 한 줄 설명"
}

분류 기준:
- urgent(긴급): 마감일 언급, 상사/CEO에서 온 메일, "즉시", "오늘까지" 등
- important(중요): 클라이언트, 계약/결제 관련, 업무 요청
- normal(일반): 일반 동료 소통, 안내 메일
- spam(스팸): 프로모션, 뉴스레터, 광고`;

/** 문서 생성 프롬프트 빌더 */
export function buildDocumentPrompt(docType: string, context: string): string {
  return `당신은 전문적인 비즈니스 문서 작성 AI입니다.
다음 정보를 바탕으로 ${docType}를 한국어로 작성해주세요.

요청 내용:
${context}

작성 지침:
- 전문적이고 명확한 언어 사용
- 구조화된 형식 (제목, 소제목, 본문)
- 구체적인 수치와 날짜 포함
- 마크다운 형식으로 작성`;
}
