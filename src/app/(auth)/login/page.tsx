'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Mail, Lock, Chrome } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  async function handleKakaoLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* 왼쪽 브랜딩 (데스크탑) */}
      <div className="hidden lg:flex flex-1 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">AutoPilot</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-black text-white leading-tight">
            이메일 정리에<br />하루 2시간?<br />
            <span className="text-white/70">AI가 3분에 끝냅니다.</span>
          </h1>
          <p className="text-white/70 text-lg">
            매일 반복하는 업무를 AI에게 맡기고<br />당신은 더 중요한 일에 집중하세요.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '5시간', label: '주당 절약 시간' },
              { value: '98%', label: '분류 정확도' },
              { value: '5,000+', label: '사용 직장인' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/40 text-sm relative z-10">
          © 2026 AutoPilot. All rights reserved.
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* 모바일 로고 */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AutoPilot</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">다시 오셨군요! 👋</h2>
            <p className="text-slate-500 mt-1">계정에 로그인하세요</p>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Chrome className="w-5 h-5" />
              Google로 계속하기
            </button>
            <button
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-[#FEE500] font-semibold text-sm text-[#3B1B1B] hover:bg-[#FDD800] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.72 1.44 5.12 3.66 6.6L4.8 21l4.32-2.52C9.66 18.78 10.8 19 12 19c5.52 0 10-3.48 10-8.2C22 6.48 17.52 3 12 3z"/>
              </svg>
              카카오로 계속하기
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 bg-white dark:bg-background-dark px-2">또는</div>
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={error}
            />
            <div className="flex justify-end">
              <Link href="/reset-password" className="text-sm text-primary hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Button type="submit" className="w-full h-12" isLoading={loading}>
              로그인
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              무료로 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
