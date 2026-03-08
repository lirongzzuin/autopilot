import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { issueBillingKey, generateOrderId, chargeSubscription, PLAN_PRICES } from '@/lib/payments/toss';
import { encrypt } from '@/lib/crypto';
import type { PlanType } from '@/types';

/**
 * 빌링키 발급 및 최초 결제
 * POST /api/billing/subscribe
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { authKey, customerKey, plan, billingCycle } = await request.json();

  try {
    // 빌링키 발급
    const billing = await issueBillingKey(authKey, customerKey);
    const encryptedBillingKey = await encrypt(billing.billingKey);

    // 결제 금액 결정 (서버 사이드 검증)
    const priceKey = `${plan}_${billingCycle}` as keyof typeof PLAN_PRICES;
    const amount = PLAN_PRICES[priceKey];
    if (!amount) return NextResponse.json({ error: '올바르지 않은 플랜' }, { status: 400 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    // 최초 결제
    const orderId = generateOrderId(user.id);
    await chargeSubscription(billing.billingKey, {
      customerKey,
      amount,
      orderId,
      orderName: `AutoPilot ${plan} 플랜 (${billingCycle === 'monthly' ? '월간' : '연간'})`,
      customerEmail: profile?.email ?? user.email ?? '',
      customerName: profile?.full_name ?? '사용자',
    });

    // 구독 정보 저장
    await adminClient.from('subscriptions').upsert({
      user_id: user.id,
      plan: plan as PlanType,
      status: 'active',
      billing_key: encryptedBillingKey,
      customer_key: customerKey,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString(),
    }, { onConflict: 'user_id' });

    // 프로필 플랜 업데이트
    await adminClient.from('user_profiles').update({ plan: plan as PlanType }).eq('id', user.id);

    return NextResponse.json({ success: true, plan, amount });
  } catch (error) {
    console.error('[결제] 구독 오류:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * 구독 취소
 * DELETE /api/billing/subscribe
 */
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const adminClient = createAdminClient();
  await adminClient.from('subscriptions').update({
    cancel_at_period_end: true,
    status: 'cancelled',
  }).eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
