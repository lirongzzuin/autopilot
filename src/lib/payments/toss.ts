/**
 * 토스페이먼츠 빌링키 기반 정기결제 유틸리티
 * 공식 문서: https://docs.tosspayments.com/reference/billing
 */

const TOSS_API_BASE = 'https://api.tosspayments.com';

function getAuthHeader(): string {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY!;
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

/** 빌링키 발급 (카드 등록) */
export async function issueBillingKey(authKey: string, customerKey: string): Promise<{
  billingKey: string;
  customerKey: string;
  card: { company: string; number: string };
}> {
  const res = await fetch(`${TOSS_API_BASE}/v1/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authKey, customerKey }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`빌링키 발급 실패: ${err.message} (${err.code})`);
  }

  return res.json();
}

/** 정기결제 실행 */
export async function chargeSubscription(
  billingKey: string,
  params: {
    customerKey: string;
    amount: number;
    orderId: string;
    orderName: string;
    customerEmail: string;
    customerName: string;
  }
): Promise<{
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
}> {
  const res = await fetch(`${TOSS_API_BASE}/v1/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`정기결제 실패: ${err.message} (${err.code})`);
  }

  return res.json();
}

/** 결제 취소 (환불) */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
): Promise<void> {
  const body: Record<string, unknown> = { cancelReason };
  if (cancelAmount !== undefined) body.cancelAmount = cancelAmount;

  const res = await fetch(`${TOSS_API_BASE}/v1/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`환불 실패: ${err.message} (${err.code})`);
  }
}

/** 빌링키 삭제 (구독 해지 + 카드 정보 삭제) */
export async function deleteBillingKey(billingKey: string): Promise<void> {
  const res = await fetch(`${TOSS_API_BASE}/v1/billing/${billingKey}`, {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader() },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`빌링키 삭제 실패: ${err.message} (${err.code})`);
  }
}

/** 주문 ID 생성 (토스페이먼츠 형식) */
export function generateOrderId(userId: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 8);
  return `autopilot-${userId.slice(0, 8)}-${date}-${random}`;
}

/** 웹훅 시그니처 검증 */
export function verifyWebhookSignature(
  secret: string,
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  return expected === signature;
}

/** 플랜별 결제 금액 */
export const PLAN_PRICES: Record<string, number> = {
  starter_monthly: 9900,
  starter_yearly: 94800,
  pro_monthly: 24900,
  pro_yearly: 238800,
  team_monthly: 19900, // 인당
  team_yearly: 190800,
};
