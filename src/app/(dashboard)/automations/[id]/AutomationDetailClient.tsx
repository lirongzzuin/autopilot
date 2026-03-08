'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, Zap, Activity, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo, formatDateTime } from '@/lib/utils';
import type { Automation, AutomationLog } from '@/types';

interface AutomationDetailClientProps {
  automation: Automation;
  logs: AutomationLog[];
}

function formatExecTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AutomationDetailClient({ automation, logs }: AutomationDetailClientProps) {
  const successCount = logs.filter((l) => l.status === 'success').length;
  const failureCount = logs.filter((l) => l.status === 'failed').length;
  const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0;
  const avgExecTime =
    logs.length > 0
      ? Math.round(logs.reduce((sum, l) => sum + (l.execution_time_ms ?? 0), 0) / logs.length)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 뒤로가기 + 헤더 */}
      <div>
        <Link href="/automations">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            자동화 목록
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${automation.is_active ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
              <Zap className={`w-5 h-5 ${automation.is_active ? 'text-primary' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{automation.name}</h1>
                <Badge variant={automation.is_active ? 'success' : 'outline'}>
                  {automation.is_active ? '활성' : '중지'}
                </Badge>
              </div>
              {automation.description && (
                <p className="text-slate-500 text-sm mt-1">{automation.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1 text-slate-500">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">총 실행 횟수</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{automation.run_count}</p>
            <p className="text-xs text-slate-400 mt-0.5">전체 누적</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1 text-slate-500">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">성공률</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{logs.length > 0 ? `${successRate}%` : '—'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {logs.length > 0 ? `${successCount}성공 / ${failureCount}실패` : '실행 기록 없음'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">평균 실행시간</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {logs.length > 0 ? formatExecTime(avgExecTime) : '—'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">최근 {logs.length}회 기준</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1 text-slate-500">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">마지막 실행</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {automation.last_run_at ? timeAgo(automation.last_run_at) : '없음'}
            </p>
            {automation.last_run_at && (
              <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(automation.last_run_at)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 성공률 프로그레스 바 */}
      {logs.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">성공률</span>
              <span className="text-sm font-bold text-green-600">{successRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{successCount}회 성공</span>
              <span>{failureCount}회 실패</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 실행 로그 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            실행 로그
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <AlertCircle className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
              <p className="font-semibold text-slate-500 dark:text-slate-400">아직 실행 기록이 없습니다</p>
              <p className="text-sm text-slate-400 mt-1">자동화가 실행되면 여기에 기록이 표시됩니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  {/* 상태 아이콘 */}
                  <div className="shrink-0 mt-0.5">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          log.status === 'success'
                            ? 'success'
                            : log.status === 'failed'
                            ? 'error'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {log.status === 'success' ? '성공' : log.status === 'failed' ? '실패' : '실행 중'}
                      </Badge>
                      <span className="text-xs text-slate-500">{formatDateTime(log.created_at)}</span>
                      <span className="text-xs text-slate-400">{timeAgo(log.created_at)}</span>
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-red-500 mt-1 truncate">{log.error_message}</p>
                    )}
                  </div>

                  {/* 실행 시간 */}
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono text-slate-400">
                      {formatExecTime(log.execution_time_ms ?? 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
