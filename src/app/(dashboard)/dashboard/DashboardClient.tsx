'use client';

import Link from 'next/link';
import { Mail, Zap, Clock, AlertTriangle, TrendingUp, Plus, ChevronRight, Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo, formatKrw } from '@/lib/utils';
import type { UserProfile, Automation, EmailItem, AIUsageLog } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardClientProps {
  profile: UserProfile | null;
  recentAutomations: Automation[];
  recentEmails: EmailItem[];
  weeklyUsageLogs: AIUsageLog[];
  stats: {
    emailsToday: number;
    urgentEmails: number;
    automationsRun: number;
    timeSavedMinutes: number;
  };
}

function buildWeeklyChartData(logs: AIUsageLog[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
  });

  return days.map((day) => ({
    date: day,
    건수: logs.filter((l) => new Date(l.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) === day).length,
  }));
}

const PRIORITY_BADGE: Record<string, { label: string; variant: 'urgent' | 'important' | 'normal' | 'spam' }> = {
  urgent: { label: '🔴 긴급', variant: 'urgent' },
  important: { label: '🟡 중요', variant: 'important' },
  normal: { label: '🟢 일반', variant: 'normal' },
  spam: { label: '⚪ 스팸', variant: 'spam' },
};

export function DashboardClient({ profile, recentAutomations, recentEmails, weeklyUsageLogs, stats }: DashboardClientProps) {
  const chartData = buildWeeklyChartData(weeklyUsageLogs);
  const timeSavedHours = Math.floor(stats.timeSavedMinutes / 60);
  const timeSavedMins = stats.timeSavedMinutes % 60;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 환영 메시지 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            안녕하세요, {profile?.full_name ?? '사용자'}님! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">오늘도 AutoPilot이 당신의 업무를 도와드립니다.</p>
        </div>
        <Link href="/automations/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            새 자동화
          </Button>
        </Link>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Mail,
            label: '오늘 처리된 이메일',
            value: stats.emailsToday,
            sub: `긴급 ${stats.urgentEmails}건`,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            icon: Zap,
            label: '이번 주 자동화 실행',
            value: stats.automationsRun,
            sub: '성공률 98%',
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            icon: Clock,
            label: '절약된 시간',
            value: timeSavedHours > 0 ? `${timeSavedHours}h ${timeSavedMins}m` : `${stats.timeSavedMinutes}분`,
            sub: '이번 주 누적',
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            icon: Brain,
            label: 'AI 크레딧 잔여',
            value: profile?.ai_credits_remaining?.toLocaleString() ?? '0',
            sub: `/ ${profile?.ai_credits_total?.toLocaleString() ?? '0'} 크레딧`,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</div>
                <div className="text-xs text-slate-500 mt-1">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI 사용량 차트 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                주간 AI 사용량
              </CardTitle>
              <span className="text-xs text-slate-400">최근 7일</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5048e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#5048e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  labelFormatter={(label) => `날짜: ${label}`}
                  formatter={(value) => [`${value}건`, 'AI 호출']}
                />
                <Area type="monotone" dataKey="건수" stroke="#5048e5" strokeWidth={2} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 최근 이메일 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                최근 이메일
              </CardTitle>
              <Link href="/inbox" className="text-xs text-primary hover:underline">전체 보기</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentEmails.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  이메일이 없습니다<br />
                  <Link href="/settings" className="text-primary text-xs">Gmail 연결하기 →</Link>
                </div>
              ) : (
                recentEmails.slice(0, 5).map((email) => {
                  const priority = email.ai_priority ? PRIORITY_BADGE[email.ai_priority] : null;
                  return (
                    <Link
                      key={email.id}
                      href="/inbox"
                      className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{email.sender_name}</span>
                          {priority && <Badge variant={priority.variant} className="text-[10px] px-1.5 py-0">{priority.label}</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{email.subject}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{timeAgo(email.received_at)}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 자동화 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                내 자동화
              </CardTitle>
              <Link href="/automations" className="text-xs text-primary hover:underline">관리하기</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentAutomations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-400 text-sm mb-3">아직 자동화가 없습니다</p>
                <Link href="/automations/new">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                    첫 자동화 만들기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentAutomations.map((auto) => (
                  <div key={auto.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${auto.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{auto.name}</p>
                      <p className="text-xs text-slate-400">실행 {auto.run_count}회 · {auto.last_run_at ? timeAgo(auto.last_run_at) : '미실행'}</p>
                    </div>
                    <Badge variant={auto.is_active ? 'success' : 'outline'} className="text-[10px]">
                      {auto.is_active ? '활성' : '중지'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 절약 효과 */}
        <Card className="bg-gradient-to-br from-primary to-violet-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm font-semibold">이번 달 성과</span>
            </div>
            <div className="text-4xl font-black mb-2">
              {timeSavedHours}시간 {timeSavedMins}분
            </div>
            <p className="text-white/70 text-sm mb-6">
              AutoPilot이 절약해 드린 시간입니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-black">{stats.automationsRun}건</div>
                <div className="text-xs text-white/60 mt-0.5">자동화 실행</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-black">{stats.emailsToday}건</div>
                <div className="text-xs text-white/60 mt-0.5">처리된 이메일</div>
              </div>
            </div>
            <Link href="/automations/new" className="block mt-4">
              <button className="w-full py-2.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                자동화 추가하기
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
