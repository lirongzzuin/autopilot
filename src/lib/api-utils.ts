/**
 * API 라우트 공통 유틸리티
 * - 일관된 에러 응답
 * - 입력 검증
 * - Rate limiting 적용
 */

import { NextResponse } from 'next/server';
import { getRateLimiter } from '@/lib/redis';

// =====================
// 표준 에러 응답
// =====================
export const ApiError = {
  unauthorized: () => NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: '권한이 없습니다' }, { status: 403 }),
  badRequest: (msg = '잘못된 요청입니다') => NextResponse.json({ error: msg }, { status: 400 }),
  notFound: (msg = '리소스를 찾을 수 없습니다') => NextResponse.json({ error: msg }, { status: 404 }),
  tooManyRequests: () => NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 }),
  internal: (msg = '서버 오류가 발생했습니다') => NextResponse.json({ error: msg }, { status: 500 }),
};

// =====================
// Rate Limiting
// =====================
export async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const limiter = getRateLimiter();
    const { success } = await limiter.limit(userId);
    return success;
  } catch {
    // Redis 연결 실패 시 통과 (fail-open)
    console.warn('[RateLimit] Redis 연결 실패, 요청 허용');
    return true;
  }
}

// =====================
// 입력 검증 헬퍼
// =====================
export function validateString(value: unknown, maxLength = 10000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function validateEnum<T extends string>(value: unknown, allowed: T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// =====================
// JSON 파싱 헬퍼 (안전)
// =====================
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) return fallback;
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}
