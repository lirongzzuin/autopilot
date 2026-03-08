'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Chrome, CheckSquare, Square } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    age: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleConsent(key: keyof typeof consents) {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleAll() {
    const allChecked = Object.values(consents).every(Boolean);
    setConsents({ terms: !allChecked, privacy: !allChecked, age: !allChecked, marketing: !allChecked });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!consents.terms || !consents.privacy || !consents.age) {
      setError('필수 항목에 동의해주세요.');
      return;
    }
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: err, data } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName, marketing_consent: consents.marketing },
      },
    });

    if (err) {
      setError(err.message === 'User already registered' ? '이미 가입된 이메일입니다.' : '회원가입 중 오류가 발생했습니다.');
    } else {
      router.push('/onboarding');
    }
    setLoading(false);
  }

  const allChecked = Object.values(consents).every(Boolean);
  const ConsentCheckbox = ({ checked, onToggle, label, required }: { checked: boolean; onToggle: () => void; label: string; required?: boolean }) => (
    <button type="button" onClick={onToggle} className="flex items-start gap-3 text-left w-full">
      {checked ? (
        <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      ) : (
        <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
      )}
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {required && <span className="text-primary font-semibold">[필수] </span>}
        {!required && <span className="text-slate-400">[선택] </span>}
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* 왼쪽 브랜딩 */}
      <div className="hidden lg:flex flex-1 bg-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
            <Rocket className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white">14일 무료 체험</h1>
          <p className="text-white/70 text-lg">신용카드 없이 Pro 기능을 14일간 무료로 체험하세요.</p>
          <div className="space-y-3 text-left">
            {['무제한 자동화 생성', '스마트 이메일 분류 & 요약', 'AI 문서 생성 (Claude, GPT-4o)', '워크플로우 비주얼 빌더', '외부 서비스 연동 (Slack, Jira, Notion)'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 회원가입 폼 */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AutoPilot</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">무료로 시작하기 🚀</h2>
            <p className="text-slate-500 mt-1">14일 Pro 체험 · 카드 불필요</p>
          </div>

          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/api/auth/callback` },
              });
            }}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors mb-4"
          >
            <Chrome className="w-5 h-5" />
            Google로 가입하기
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 bg-white dark:bg-background-dark px-2">또는 이메일로</div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              required
            />
            <Input
              label="이메일"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              hint="영문, 숫자 조합 8자 이상"
              required
            />

            {/* 동의 */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
              <button type="button" onClick={toggleAll} className="flex items-center gap-3 w-full pb-3 border-b border-slate-200 dark:border-slate-700">
                {allChecked ? (
                  <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <span className="font-semibold text-sm text-slate-900 dark:text-white">전체 동의</span>
              </button>
              <ConsentCheckbox checked={consents.age} onToggle={() => toggleConsent('age')} label="만 14세 이상입니다" required />
              <ConsentCheckbox checked={consents.terms} onToggle={() => toggleConsent('terms')} label="이용약관 동의" required />
              <ConsentCheckbox checked={consents.privacy} onToggle={() => toggleConsent('privacy')} label="개인정보 수집·이용 동의" required />
              <ConsentCheckbox checked={consents.marketing} onToggle={() => toggleConsent('marketing')} label="마케팅 정보 수신 동의 (이메일)" />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full h-12" isLoading={loading}>
              무료 계정 만들기
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
