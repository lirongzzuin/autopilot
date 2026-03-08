'use client';

import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Mail, Clock, TrendingUp, Cpu, CircleDollarSign } from 'lucide-react';
import { formatKrw } from '@/lib/utils';
import type { UserProfile } from '@/types';

interface Props {
  profile: UserProfile | null;
  usageLogs: Array<{ task: string; model: string; cost_krw: number; input_tokens: number; output_tokens: number; created_at: string }>;
  automationLogs: Array<{ status: string; execution_time_ms: number; created_at: string }>;
  emailStats: Array<{ ai_priority: string | null; is_read: boolean; created_at: string }>;
}

const COLORS = ['#5048e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function groupByDay(items: Array<{ created_at: string }>, getValue?: (item: any) => number) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const day = item.created_at.split('T')[0];
    const value = getValue ? getValue(item) : 1;
    map.set(day, (map.get(day) ?? 0) + value);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date: date.slice(5), value }));
}

export function AnalyticsClient({ profile, usageLogs, automationLogs, emailStats }: Props) {
  const totalCostKrw = useMemo(() => usageLogs.reduce((sum, l) => sum + l.cost_krw, 0), [usageLogs]);
  const totalTokens = useMemo(() => usageLogs.reduce((sum, l) => sum + l.input_tokens + l.output_tokens, 0), [usageLogs]);
  const automationSuccessRate = useMemo(() => {
    if (!automationLogs.length) return 0;
    const succeeded = automationLogs.filter(l => l.status === 'success').length;
    return Math.round((succeeded / automationLogs.length) * 100);
  }, [automationLogs]);

  // AI 사용량 일별 추이
  const dailyAiCost = groupByDay(usageLogs, (l) => l.cost_krw);

  // 자동화 일별 실행 수
  const dailyAutomations = groupByDay(automationLogs);

  // 이메일 우선순위 분포
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { urgent: 0, important: 0, normal: 0, spam: 0, 미분류: 0 };
    emailStats.forEach(e => {
      const p = e.ai_priority ?? '미분류';
      counts[p] = (counts[p] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [emailStats]);

  // AI 모델별 사용량
  const modelData = useMemo(() => {
    const counts: Record<string, number> = {};
    usageLogs.forEach(l => {
      counts[l.model] = (counts[l.model] ?? 0) + l.input_tokens + l.output_tokens;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name: name.split('-').slice(0, 2).join('-'), value }));
  }, [usageLogs]);

  // 절약된 시간 추정 (자동화 1회 = 평균 5분 절약)
  const timeSavedHours = Math.round(automationLogs.filter(l => l.status === 'success').length * 5 / 60 * 10) / 10;

  const stats = [
    { label: 'AI 사용 비용 (30일)', value: formatKrw(Math.round(totalCostKrw)), icon: CircleDollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: '총 토큰 사용량', value: `${(totalTokens / 1000).toFixed(1)}K`, icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: '자동화 성공률', value: `${automationSuccessRate}%`, icon: Zap, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: '절약된 시간', value: `${timeSavedHours}시간`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: '처리된 이메일', value: `${emailStats.length}건`, icon: Mail, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'ROI 추정', value: `₩${Math.round(timeSavedHours * 15000).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', hint: '시간당 ₩15,000 기준' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">사용량 분석</h1>
        <p className="text-sm text-slate-500 mt-1">최근 30일 AutoPilot 활용 현황</p>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, hint }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
              {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI 비용 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 비용 일별 추이</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyAiCost.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyAiCost}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5048e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5048e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₩${v.toFixed(0)}`} />
                  <Tooltip formatter={(v: number) => [`₩${v.toFixed(2)}`, 'AI 비용']} />
                  <Area type="monotone" dataKey="value" stroke="#5048e5" fill="url(#colorCost)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">데이터가 없습니다</div>
            )}
          </CardContent>
        </Card>

        {/* 자동화 실행 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">자동화 실행 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyAutomations.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyAutomations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [v, '실행 수']} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">자동화 실행 내역이 없습니다</div>
            )}
          </CardContent>
        </Card>

        {/* 이메일 우선순위 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">이메일 우선순위 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {priorityData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">이메일 데이터가 없습니다</div>
            )}
          </CardContent>
        </Card>

        {/* AI 모델별 사용량 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 모델별 토큰 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            {modelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={(v: number) => [`${(v / 1000).toFixed(1)}K 토큰`, '사용량']} />
                  <Bar dataKey="value" fill="#5048e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">AI 사용 내역이 없습니다</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 비용 절감 인사이트 */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">이번 달 AutoPilot ROI</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {timeSavedHours}시간 절약 × 시간당 ₩15,000 = <strong className="text-primary">₩{Math.round(timeSavedHours * 15000).toLocaleString()}</strong> 가치 창출
                {profile?.plan && profile.plan !== 'free' && ` — 구독료 대비 ${Math.round((timeSavedHours * 15000 / (profile.plan === 'starter' ? 9900 : 24900)) * 10) / 10}배 ROI`}
              </p>
              <p className="text-xs text-slate-400 mt-1">AI 분류가 이메일당 평균 3분, 자동화 실행이 작업당 평균 5분을 절약합니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
