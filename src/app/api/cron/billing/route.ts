import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { chargeSubscription, generateOrderId } from '@/lib/payments/toss';
import { decrypt } from '@/lib/crypto';
import { sendPaymentFailedEmail } from '@/lib/email';
import { PLAN_PRICES } from '@/lib/payments/toss';
import { PLAN_LIMITS } from '@/types';

/**
 * 정기결제 크론잡
 * POST /api/cron/billing
 * Vercel Cron: 매일 오전 0시 KST
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  // 오늘 결제일인 구독 조회 (processing 상태로 먼저 마킹해서 중복 결제 방지)
  const { data: subs } = await adminClient
    .from('subscriptions')
    .select('*, user_profiles(email, full_name)')
    .eq('status', 'active')
    .eq('cancel_at_period_end', false)
    .lte('current_period_end', today + 'T23:59:59Z')
    .neq('plan', 'free');

  if (!subs || subs.length === 0) return NextResponse.json({ processed: 0 });

  // 처리 중으로 마킹 (중복 결제 방지)
  const subIds = subs.map((s: any) => s.id);
  await adminClient
    .from('subscriptions')
    .update({ status: 'processing' as any })
    .in('id', subIds)
    .catch(() => {});

  // subs는 위에서 이미 null 체크됨

  let succeeded = 0, failed = 0;

  for (const sub of subs) {
    try {
      if (!sub.billing_key) continue;

      const billingKey = await decrypt(sub.billing_key);
      const priceKey = `${sub.plan}_monthly` as keyof typeof PLAN_PRICES;
      const amount = PLAN_PRICES[priceKey];
      if (!amount) continue;

      const profile = (sub as any).user_profiles;

      await chargeSubscription(billingKey, {
        customerKey: sub.customer_key,
        amount,
        orderId: generateOrderId(sub.user_id),
        orderName: `AutoPilot ${sub.plan} 플랜 구독`,
        customerEmail: profile?.email ?? '',
        customerName: profile?.full_name ?? '사용자',
      });

      // 다음 결제 기간 업데이트
      const nextPeriodEnd = new Date(sub.current_period_end);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      // AI 크레딧 리셋
      const plan = sub.plan as keyof typeof PLAN_LIMITS;
      const credits = PLAN_LIMITS[plan]?.ai_credits ?? 30000;

      await Promise.all([
        adminClient.from('subscriptions').update({
          current_period_start: sub.current_period_end,
          current_period_end: nextPeriodEnd.toISOString(),
        }).eq('id', sub.id),

        adminClient.from('user_profiles').update({
          ai_credits_remaining: credits,
          ai_credits_total: credits,
        }).eq('id', sub.user_id),
      ]);

      succeeded++;
    } catch (error) {
      console.error(`[Billing] 결제 실패 - 구독 ${sub.id}:`, error);
      failed++;

      // 결제 실패 이메일 발송
      const profile = (sub as any).user_profiles;
      if (profile?.email) {
        const priceKey = `${sub.plan}_monthly` as keyof typeof PLAN_PRICES;
        await sendPaymentFailedEmail({
          to: profile.email,
          userName: profile.full_name ?? '사용자',
          amount: PLAN_PRICES[priceKey] ?? 0,
          retryDate: new Date(Date.now() + 3 * 86400000).toLocaleDateString('ko-KR'),
        }).catch(() => {});
      }

      await adminClient.from('subscriptions').update({ status: 'past_due' }).eq('id', sub.id);
    }
  }

  return NextResponse.json({ processed: subs.length, succeeded, failed });
}

export const dynamic = 'force-dynamic';
