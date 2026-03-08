'use client';

import { useState } from 'react';
import { CreditCard, Zap, CheckCircle, AlertCircle, Receipt, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_LIMITS, type PlanType } from '@/types';
import { formatKrw, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { UserProfile, Subscription, BillingHistory } from '@/types';

interface BillingClientProps {
  profile: UserProfile | null;
  subscription: Subscription | null;
  billingHistory: BillingHistory[];
  userId: string;
}

const PLAN_ORDER: PlanType[] = ['free', 'starter', 'pro', 'team'];

export function BillingClient({ profile, subscription, billingHistory, userId }: BillingClientProps) {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState<PlanType | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const currentPlan = (profile?.plan ?? 'free') as PlanType;
  const planInfo = PLAN_LIMITS[currentPlan];

  async function loadTossPaymentsSDK() {
    // 이미 로드된 경우 재사용
    if ((window as any).TossPayments) return (window as any).TossPayments;

    return new Promise<any>((resolve, reject) => {
      const existing = document.querySelector('script[src*="tosspayments"]');
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).TossPayments));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v2/standard';
      script.onload = () => resolve((window as any).TossPayments);
      script.onerror = () => reject(new Error('TossPayments SDK 로드 실패'));
      document.head.appendChild(script);
    });
  }

  async function handleUpgrade(plan: PlanType) {
    if (plan === 'free') return;
    setUpgrading(plan);
    try {
      const TossPayments = await loadTossPaymentsSDK();
      const tossPayments = TossPayments(process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY!);
      const payment = tossPayments.payment({ customerKey: userId });
      await payment.requestBillingAuth('카드', {
        successUrl: `${window.location.origin}/api/billing/success?plan=${plan}&cycle=${billingCycle}`,
        failUrl: `${window.location.origin}/settings/billing?error=payment_failed`,
        customerEmail: profile?.email ?? '',
        customerName: profile?.full_name ?? '사용자',
      });
    } catch (error) {
      toast({ title: '결제창을 열 수 없습니다', variant: 'error' });
    } finally {
      setUpgrading(null);
    }
  }

  async function handleCancel() {
    if (!confirm('정말 구독을 취소하시겠습니까? 현재 결제 주기 종료 후 Free 플랜으로 전환됩니다.')) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/billing/subscribe', { method: 'DELETE' });
      if (res.ok) {
        toast({ title: '구독이 취소되었습니다', description: '현재 기간 종료 후 Free 플랜으로 전환됩니다', variant: 'success' });
      }
    } finally {
      setCancelling(false);
    }
  }

  const statusBadge: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'default' }> = {
    active: { label: '활성', variant: 'success' },
    past_due: { label: '결제 실패', variant: 'error' },
    cancelled: { label: '취소됨', variant: 'warning' },
    trialing: { label: '체험 중', variant: 'default' },
    processing: { label: '처리 중', variant: 'warning' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">결제 & 구독</h1>

      {/* 현재 플랜 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            현재 구독
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white capitalize">{planInfo.name}</span>
                {subscription && (
                  <Badge variant={statusBadge[subscription.status]?.variant ?? 'default'}>
                    {statusBadge[subscription.status]?.label ?? subscription.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">
                {currentPlan === 'free'
                  ? '무료 플랜 사용 중'
                  : `₩${(billingCycle === 'monthly' ? planInfo.price_monthly : planInfo.price_yearly).toLocaleString()}/월`}
              </p>
              {subscription && (
                <p className="text-xs text-slate-400 mt-1">
                  다음 결제일: {formatDate(subscription.current_period_end)}
                </p>
              )}
            </div>
            {currentPlan !== 'free' && subscription && !subscription.cancel_at_period_end && (
              <Button variant="outline" size="sm" onClick={handleCancel} isLoading={cancelling}>
                구독 취소
              </Button>
            )}
          </div>

          {/* 사용량 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">AI 크레딧</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {profile?.ai_credits_remaining?.toLocaleString() ?? 0} / {profile?.ai_credits_total?.toLocaleString() ?? 0}
              </p>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${((profile?.ai_credits_remaining ?? 0) / (profile?.ai_credits_total ?? 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">자동화 한도</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {planInfo.automations === -1 ? '무제한' : `${planInfo.automations}개`}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">이메일 처리</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {planInfo.emails_per_month === -1 ? '무제한' : `${planInfo.emails_per_month.toLocaleString()}건/월`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 요금제 선택 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>요금제 변경</CardTitle>
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
              {(['monthly', 'yearly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    billingCycle === cycle ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'
                  }`}
                >
                  {cycle === 'monthly' ? '월간' : '연간'}
                  {cycle === 'yearly' && <span className="ml-1 text-xs text-green-500">-20%</span>}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {PLAN_ORDER.map((plan) => {
              const info = PLAN_LIMITS[plan];
              const isCurrent = plan === currentPlan;
              const isPro = plan === 'pro';
              const price = billingCycle === 'monthly' ? info.price_monthly : info.price_yearly;

              return (
                <div
                  key={plan}
                  className={`relative p-5 rounded-2xl border-2 flex flex-col ${
                    isPro
                      ? 'border-primary bg-primary text-white shadow-xl shadow-primary/30'
                      : isCurrent
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-primary text-xs font-black rounded-full shadow">
                      인기
                    </div>
                  )}
                  <h3 className={`font-black text-lg mb-1 capitalize ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {info.name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-3xl font-black ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {price === 0 ? '무료' : `₩${price.toLocaleString()}`}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm ${isPro ? 'text-white/70' : 'text-slate-400'}`}>/월</span>
                    )}
                  </div>
                  <ul className="space-y-2 mb-5 flex-1">
                    {info.features.slice(0, 4).map((feature) => (
                      <li key={feature} className={`flex items-start gap-2 text-xs ${isPro ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                        <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isPro ? 'text-white' : 'text-primary'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className={`text-center text-xs font-bold py-2 rounded-xl ${isPro ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                      현재 플랜
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant={isPro ? 'secondary' : 'outline'}
                      onClick={() => handleUpgrade(plan)}
                      isLoading={upgrading === plan}
                      disabled={plan === 'free'}
                      className={isPro ? 'bg-white text-primary hover:bg-white/90' : ''}
                    >
                      {plan === 'free' ? '현재 무료' : '이 플랜으로'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 결제 이력 */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              결제 이력
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {billingHistory.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {item.status === 'success'
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                      {PLAN_LIMITS[item.plan]?.name ?? item.plan} 플랜
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatKrw(item.amount)}</p>
                    <Badge variant={item.status === 'success' ? 'success' : 'error'} className="text-[10px]">
                      {item.status === 'success' ? '완료' : item.status === 'refunded' ? '환불' : '실패'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
