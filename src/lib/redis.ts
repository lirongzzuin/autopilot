import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/** AI 응답 캐시 (TTL: 24시간) */
export async function cacheAIResponse(key: string, response: string): Promise<void> {
  const r = getRedis();
  await r.setex(`ai:cache:${key}`, 86400, response);
}

export async function getCachedAIResponse(key: string): Promise<string | null> {
  const r = getRedis();
  return r.get<string>(`ai:cache:${key}`);
}

/** Rate Limiter - API 보호용 (lazy initialization) */
let _rateLimiter: Ratelimit | null = null;

export function getRateLimiter(): Ratelimit {
  if (!_rateLimiter) {
    _rateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      prefix: 'autopilot:rl',
    });
  }
  return _rateLimiter;
}

/** 세션 데이터 저장 */
export async function setSession(sessionId: string, data: Record<string, unknown>, ttlSeconds = 3600): Promise<void> {
  const r = getRedis();
  await r.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
}

export async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const r = getRedis();
  const data = await r.get<string>(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}
