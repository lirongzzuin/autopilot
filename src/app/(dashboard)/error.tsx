'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 프로덕션에서는 Sentry에 오류 전송
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">페이지를 로드할 수 없습니다</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        {error.digest && <span className="block mt-1 text-xs font-mono text-slate-400">ID: {error.digest}</span>}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </Button>
        <Link href="/dashboard">
          <Button size="sm">
            <Home className="w-4 h-4" />
            대시보드로
          </Button>
        </Link>
      </div>
    </div>
  );
}
