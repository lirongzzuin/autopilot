'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Mail, FileText, Bell, Calendar, Database, Repeat,
  Rocket, Brain, Cpu, Zap, Check, ChevronRight,
  Chrome, MessageSquare, Layers, Cloud
} from 'lucide-react';

const STEPS = ['업무 선택', 'AI 모델', '서비스 연결', '추천 자동화'];

const WORK_TYPES = [
  { id: 'email', icon: Mail, label: '이메일 관리', desc: '자동 분류 & 요약' },
  { id: 'document', icon: FileText, label: '문서 작업', desc: '보고서, 회의록 자동 작성' },
  { id: 'alert', icon: Bell, label: '알림/모니터링', desc: '중요 알림 즉시 수신' },
  { id: 'calendar', icon: Calendar, label: '일정 관리', desc: '회의 자동 정리' },
  { id: 'data', icon: Database, label: '데이터 정리', desc: 'Sheets 자동화' },
  { id: 'repeat', icon: Repeat, label: '반복 작업', desc: '정기 리포트 생성' },
];

const AI_OPTIONS = [
  {
    id: 'platform',
    icon: Cpu,
    title: '플랫폼 AI 사용',
    desc: '구독에 포함된 AI 크레딧으로 즉시 사용 가능. 설정 없이 바로 시작.',
    badge: '추천',
    pros: ['설정 불필요', '월 크레딧 포함', '안정적인 품질'],
  },
  {
    id: 'byok',
    icon: Brain,
    title: '내 API 키 사용 (BYOK)',
    desc: 'Claude, GPT, Gemini API 키를 직접 연결. 크레딧 걱정 없이 무제한 사용.',
    badge: '절약',
    pros: ['무제한 사용', '최신 모델 선택', '직접 비용 관리'],
  },
];

const SERVICES = [
  { id: 'gmail', icon: Mail, label: 'Gmail', color: 'text-red-500' },
  { id: 'slack', icon: MessageSquare, label: 'Slack', color: 'text-purple-500' },
  { id: 'notion', icon: Layers, label: 'Notion', color: 'text-slate-700' },
  { id: 'jira', icon: Zap, label: 'Jira', color: 'text-blue-500' },
  { id: 'google_drive', icon: Cloud, label: 'Google Drive', color: 'text-yellow-500' },
  { id: 'google_sheets', icon: Database, label: 'Google Sheets', color: 'text-green-500' },
];

const RECOMMENDED_AUTOMATIONS = [
  {
    id: 'email_digest',
    icon: Mail,
    title: '이메일 일일 다이제스트',
    desc: '매일 오전 9시, 중요 이메일을 Slack으로 요약 발송',
    trigger: '매일 오전 9시',
    action: 'Slack 전송',
  },
  {
    id: 'urgent_alert',
    icon: Bell,
    title: '긴급 이메일 실시간 알림',
    desc: '긴급 이메일 수신 시 즉시 Slack DM으로 알림',
    trigger: '긴급 이메일 수신',
    action: 'Slack DM',
  },
  {
    id: 'meeting_notes',
    icon: FileText,
    title: '회의록 자동 생성',
    desc: 'Google Meet 종료 후 AI가 회의록을 Notion에 자동 저장',
    trigger: '회의 종료',
    action: 'Notion 저장',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [aiMode, setAiMode] = useState<'platform' | 'byok'>('platform');
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const [activatedAutomations, setActivatedAutomations] = useState<string[]>([]);
  const [completing, setCompleting] = useState(false);

  function toggleWork(id: string) {
    setSelectedWorks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleService(id: string) {
    setConnectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAutomation(id: string) {
    setActivatedAutomations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleComplete() {
    setCompleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_profiles').update({
        ai_mode: aiMode,
        onboarding_completed: true,
      }).eq('id', user.id);
    }
    router.push('/dashboard');
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">AutoPilot</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 0 && '어떤 업무를 자동화하고 싶으세요?'}
            {step === 1 && 'AI 모델을 선택하세요'}
            {step === 2 && '사용 중인 도구를 연결하세요'}
            {step === 3 && '추천 자동화를 활성화하세요'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            단계 {step + 1} / {STEPS.length}
          </p>
        </div>

        {/* 진행률 */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 1: 업무 선택 */}
        {step === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WORK_TYPES.map((work) => {
              const selected = selectedWorks.includes(work.id);
              const Icon = work.icon;
              return (
                <button
                  key={work.id}
                  onClick={() => toggleWork(work.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <Icon className={`w-7 h-7 mb-2 ${selected ? 'text-primary' : 'text-slate-400'}`} />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{work.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{work.desc}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: AI 모델 */}
        {step === 1 && (
          <div className="space-y-4">
            {AI_OPTIONS.map((option) => {
              const selected = aiMode === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setAiMode(option.id as 'platform' | 'byok')}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{option.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${selected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                          {option.badge}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{option.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.pros.map((pro) => (
                          <span key={pro} className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-2 py-1 text-slate-600 dark:text-slate-300">
                            ✓ {pro}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: 서비스 연결 */}
        {step === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVICES.map((service) => {
              const connected = connectedServices.includes(service.id);
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-5 rounded-2xl border-2 text-center transition-all ${
                    connected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${service.color}`} />
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{service.label}</div>
                  {connected && (
                    <div className="mt-2 text-xs text-primary font-semibold">연결됨 ✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 4: 추천 자동화 */}
        {step === 3 && (
          <div className="space-y-4">
            {RECOMMENDED_AUTOMATIONS.map((auto) => {
              const activated = activatedAutomations.includes(auto.id);
              const Icon = auto.icon;
              return (
                <div
                  key={auto.id}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    activated
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{auto.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{auto.desc}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-1">⚡ {auto.trigger}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-1">→ {auto.action}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAutomation(auto.id)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        activated
                          ? 'bg-primary text-white'
                          : 'border border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      {activated ? '활성화됨' : '활성화'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              ← 이전
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 0 && selectedWorks.length === 0}>
              다음 <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} isLoading={completing}>
              <Rocket className="w-4 h-4" />
              시작하기!
            </Button>
          )}
        </div>

        {step < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setStep(step + 1)}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              건너뛰기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
