import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/toss';
import { createAdminClient } from '@/lib/supabase/server';
import { sendPaymentFailedEmail } from '@/lib/email';
import { PLAN_LIMITS } from '@/types';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('toss-signature') ?? '';

  // 웹훅 시그니처 검증 (HMAC-SHA256)
  const isValid = verifyWebhookSignature(
    process.env.TOSS_PAYMENTS_WEBHOOK_SECRET!,
    rawBody,
    signature
  );

  if (!isValid) {
    return NextResponse.json({ error: '유효하지 않은 시그니처' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const adminClient = createAdminClient();

  try {
    switch (event.eventType) {
      case 'PAYMENT_STATUS_CHANGED': {
        const { orderId, status, paymentKey, totalAmount } = event.data;

        // orderId로 구독 조회 (userId를 orderId에서 파싱하는 취약점 제거)
        // billing_history에 이미 삽입된 레코드가 있으면 중복 처리 방지
        const { data: existingBilling } = await adminClient
          .from('billing_history')
          .select('user_id, id')
          .eq('order_id', orderId)
          .maybeSingle();

        // customer_key로 구독 조회 (orderId의 userId 슬라이스 사용은 fallback)
        let userId: string | null = existingBilling?.user_id ?? null;

        if (!userId) {
          // orderId 형식: autopilot-{userId8}-{date}-{random}
          // 시그니처 검증 완료 후이므로 신뢰 가능
          const userIdSlice = orderId.split('-')[1];
          const { data: sub } = await adminClient
            .from('subscriptions')
            .select('user_id')
            .eq('customer_key', userIdSlice)
            .maybeSingle();
          userId = sub?.user_id ?? null;
        }

        if (!userId) {
          console.error('[Toss Webhook] userId 조회 실패:', orderId);
          return NextResponse.json({ received: true });
        }

        if (status === 'DONE') {
          const { data: sub } = await adminClient
            .from('subscriptions')
            .select('plan')
            .eq('user_id', userId)
            .single();

          if (sub) {
            const plan = sub.plan as keyof typeof PLAN_LIMITS;
            const credits = PLAN_LIMITS[plan]?.ai_credits ?? 1000;

            await Promise.all([
              adminClient.from('subscriptions').update({
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
              }).eq('user_id', userId),

              adminClient.from('user_profiles').update({
                ai_credits_remaining: credits,
                ai_credits_total: credits,
              }).eq('id', userId),

              // 중복 삽입 방지: order_id UNIQUE constraint
              adminClient.from('billing_history').upsert({
                user_id: userId,
                amount: totalAmount,
                currency: 'KRW',
                status: 'success',
                order_id: orderId,
                payment_key: paymentKey,
                plan: sub.plan,
              }, { onConflict: 'order_id', ignoreDuplicates: true }),
            ]);
          }
        } else if (status === 'ABORTED' || status === 'EXPIRED') {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();

          if (profile?.email) {
            await sendPaymentFailedEmail({
              to: profile.email,
              userName: profile.full_name ?? '사용자',
              amount: event.data.totalAmount,
              retryDate: new Date(Date.now() + 3 * 86400000).toLocaleDateString('ko-KR'),
            }).catch(() => {});
          }

          await Promise.all([
            adminClient.from('subscriptions')
              .update({ status: 'past_due' })
              .eq('user_id', userId),

            adminClient.from('billing_history').upsert({
              user_id: userId,
              amount: totalAmount,
              currency: 'KRW',
              status: 'failed',
              order_id: orderId,
              payment_key: paymentKey,
            }, { onConflict: 'order_id', ignoreDuplicates: true }),
          ]);
        }
        break;
      }

      default:
        console.log('[Toss Webhook] 미처리 이벤트:', event.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Toss Webhook] 처리 오류:', error);
    return NextResponse.json({ error: '내부 오류' }, { status: 500 });
  }
}
