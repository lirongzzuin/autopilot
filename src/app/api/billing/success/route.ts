import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { issueBillingKey, chargeSubscription, generateOrderId, PLAN_PRICES } from '@/lib/payments/toss';
import { encrypt } from '@/lib/crypto';
import { PLAN_LIMITS, type PlanType } from '@/types';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * 토스페이먼츠 빌링 인증 성공 콜백
 * GET /api/billing/success?plan=pro&cycle=monthly&authKey=...&customerKey=...
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const authKey = url.searchParams.get('authKey');
  const customerKey = url.searchParams.get('customerKey');
  const plan = url.searchParams.get('plan') as PlanType;
  const cycle = url.searchParams.get('cycle') ?? 'monthly';

  if (!authKey || !customerKey || !plan) {
    return NextResponse.redirect(new URL('/settings/billing?error=missing_params', request.url));
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 빌링키 발급
    const billingData = await issueBillingKey(authKey, customerKey);
    const encryptedBillingKey = await encrypt(billingData.billingKey);

    const priceKey = `${plan}_${cycle}` as keyof typeof PLAN_PRICES;
    const amount = PLAN_PRICES[priceKey];
    if (!amount) throw new Error('Invalid plan/cycle');

    const orderId = generateOrderId(user.id);

    // 첫 번째 결제 실행
    await chargeSubscription(billingData.billingKey, {
      customerKey,
      amount,
      orderId,
      orderName: `AutoPilot ${plan} 플랜 구독`,
      customerEmail: user.email ?? '',
      customerName: billingData.customerName ?? '사용자',
    });

    const adminClient = createAdminClient();
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const credits = PLAN_LIMITS[plan]?.ai_credits ?? 50000;

    // 구독 생성/업데이트 + 프로필 업데이트
    await Promise.all([
      adminClient.from('subscriptions').upsert({
        user_id: user.id,
        plan,
        status: 'active',
        billing_key: encryptedBillingKey,
        customer_key: customerKey,
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
        cancel_at_period_end: false,
      }, { onConflict: 'user_id' }),

      adminClient.from('user_profiles').update({
        plan,
        ai_credits_remaining: credits,
        ai_credits_total: credits,
      }).eq('id', user.id),

      adminClient.from('billing_history').insert({
        user_id: user.id,
        amount,
        currency: 'KRW',
        status: 'success',
        order_id: orderId,
        plan,
      }),
    ]);

    return NextResponse.redirect(new URL('/settings/billing?success=true', request.url));
  } catch (error) {
    console.error('[Billing Success] 결제 처리 실패:', error);
    return NextResponse.redirect(new URL('/settings/billing?error=payment_failed', request.url));
  }
}

export const dynamic = 'force-dynamic';
