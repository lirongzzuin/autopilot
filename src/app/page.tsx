import Link from 'next/link';
import { Check, Zap, Mail, FileText, Bell, Brain, ChevronDown, Rocket, ArrowRight } from 'lucide-react';
import { PLAN_LIMITS } from '@/types';

const FEATURES = [
  {
    icon: Mail,
    title: '스마트 이메일 인박스',
    desc: 'AI가 이메일을 긴급/중요/일반으로 분류하고 3줄 요약을 제공합니다. 매일 오전 다이제스트 이메일도 자동 발송.',
  },
  {
    icon: Zap,
    title: '워크플로우 자동화 빌더',
    desc: '자연어로 설명하면 AI가 자동으로 워크플로우를 구성하거나, 21개 템플릿으로 빠르게 자동화를 시작할 수 있습니다.',
  },
  {
    icon: FileText,
    title: 'AI 문서 자동화',
    desc: '보고서, 회의록, 제안서를 프롬프트만으로 AI가 생성합니다. 생성된 문서는 저장·복사·관리까지 한 곳에서.',
  },
  {
    icon: Bell,
    title: '스마트 알림 시스템',
    desc: '특정 키워드, 발신자, 소스 조건에 맞는 알림 규칙을 설정하여 중요한 것만 놓치지 않게 합니다.',
  },
];

const USE_CASES = [
  {
    icon: '📧',
    title: '이메일 우선순위 자동 분류',
    desc: '매일 수십 통의 이메일을 AI가 긴급/중요/일반으로 분류하고, 3줄 요약과 해야 할 일을 추출합니다.',
    benefit: '이메일 확인 시간 단축',
  },
  {
    icon: '📝',
    title: 'AI 답장 초안 생성',
    desc: '이메일 내용을 분석해 정중한/친근한/간결한 3가지 톤의 답장을 즉시 생성합니다.',
    benefit: '답장 작성 시간 단축',
  },
  {
    icon: '📊',
    title: '보고서 자동 생성',
    desc: '주간 업무보고, 회의록, 제안서를 프롬프트만 입력하면 AI가 문서 형태로 작성합니다.',
    benefit: '문서 작성 자동화',
  },
];

const FAQS = [
  {
    q: 'BYOK(내 API 키 사용)란 무엇인가요?',
    a: 'BYOK는 OpenAI, Anthropic, Google 등 AI 제공사에서 발급받은 본인의 API 키를 AutoPilot에 등록하여 사용하는 방식입니다. AutoPilot의 크레딧을 사용하지 않고, 본인의 API 사용량에 따라 해당 AI 제공사에 직접 요금을 납부합니다. API 키는 AES-256-GCM으로 암호화 저장되며 클라이언트에 노출되지 않습니다.',
  },
  {
    q: 'BYOK와 플랫폼 모드의 차이점은 무엇인가요?',
    a: '플랫폼 모드는 AutoPilot이 제공하는 AI 크레딧을 소모하여 사용합니다. BYOK 모드는 본인의 API 키로 직접 AI를 호출하므로 크레딧이 차감되지 않지만, AI 제공사에서 사용량에 따라 별도로 요금이 청구됩니다. 어떤 모드든 기능은 동일합니다.',
  },
  {
    q: '비용은 어떻게 발생하나요?',
    a: 'AutoPilot 자체 구독료(Free 플랜은 무료)와 AI 사용 비용이 있습니다. 플랫폼 모드에서는 플랜에 포함된 AI 크레딧을 사용하고, BYOK 모드에서는 본인의 API 키에 연결된 계정으로 사용량에 따라 AI 제공사에 직접 결제됩니다.',
  },
  {
    q: '무료 플랜에서도 BYOK를 사용할 수 있나요?',
    a: '네. 모든 플랜에서 BYOK를 지원합니다. 본인의 API 키를 등록하면 AI 크레딧 소모 없이 AI 기능을 사용할 수 있으며, 사용량에 따른 비용은 해당 AI 제공사에 직접 청구됩니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '유료 구독 결제 후 7일 이내에는 전액 환불이 가능합니다. 이후에는 잔여 기간을 일할 계산하여 환불해 드립니다. support@autopilot.kr로 문의하세요.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#121121] font-sans">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-[#f6f6f8]/80 dark:bg-[#121121]/80 backdrop-blur-md border-b border-[#5048e5]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#5048e5] flex items-center justify-center">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">AutoPilot</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['#features', '기능'], ['#pricing', '요금제'], ['#how-it-works', '사용 사례'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#5048e5] transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-bold px-3 sm:px-5 py-2 rounded-lg hover:bg-[#5048e5]/5 transition-colors">로그인</Link>
            <Link href="/signup" className="bg-[#5048e5] text-white text-sm font-bold px-4 sm:px-6 py-2.5 rounded-xl hover:bg-[#5048e5]/90 shadow-lg shadow-[#5048e5]/20 transition-all">무료로 시작</Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24 pb-12 sm:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5048e5]/10 border border-[#5048e5]/20">
              <Zap className="w-3.5 h-3.5 text-[#5048e5]" />
              <span className="text-xs font-bold text-[#5048e5] tracking-wide">내 AI API 키 연결 · 사용한 만큼만 결제 (BYOK)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
              반복되는 업무,<br />
              <span className="text-[#5048e5]">AI에게 맡기세요.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
              이메일 분류, 답장 초안, 문서 생성, 워크플로우 자동화까지.
              원하는 AI 모델을 연결하고, 사용한 만큼만 투명하게 결제하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-4 bg-[#5048e5] text-white font-bold rounded-xl shadow-xl shadow-[#5048e5]/30 hover:-translate-y-0.5 transition-transform text-sm sm:text-base">
                무료로 시작하기 <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm sm:text-base">
                기능 살펴보기
              </a>
            </div>
            <p className="text-sm text-slate-400">Free 플랜 무료 · BYOK 시 사용량 기반 과금 · 언제든 취소 가능</p>
            <div>
              <p className="text-xs text-slate-400 mb-3">지원하는 AI 모델</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['GPT-4o', 'GPT-4o mini', 'Claude Sonnet', 'Claude Haiku', 'Gemini Pro', 'Gemini Flash'].map((s) => (
                  <span key={s} className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 대시보드 미리보기 */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-1.5">
                  {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => <div key={c} className={`w-3 h-3 rounded-full ${c}`} />)}
                </div>
                <div className="flex-1 h-5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] flex items-center justify-center text-slate-400">autopilot.kr/dashboard</div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">대시보드 미리보기</span>
                  <span className="text-xs text-slate-400">예시 화면</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '이메일 분류', value: 'AI 자동', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
                    { label: '자동화 설정', value: '템플릿', bg: 'bg-[#5048e5]/10', color: 'text-[#5048e5]' },
                    { label: 'AI 답장', value: '3종 생성', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-600' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">📬 이메일 AI 분류 예시</p>
                  {[
                    { sender: '김대표', subject: '[긴급] 내일 오전 미팅 확정 건', badge: '긴급', color: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' },
                    { sender: '박클라이언트', subject: '계약서 검토 요청 - 오늘 EOD', badge: '중요', color: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20' },
                  ].map((email) => (
                    <div key={email.subject} className={`flex items-center gap-3 p-3 ${email.color} rounded-xl border`}>
                      <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">{email.badge}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{email.sender}</p>
                        <p className="text-[10px] text-slate-500 truncate">{email.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 가치 */}
      <div className="bg-white dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">AutoPilot이 제공하는 가치</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {['내 AI 키로 투명한 비용 관리', 'AES-256 암호화 키 보관', '원하는 AI 모델 자유 선택', '24/7 자동화 처리'].map((stat) => (
              <div key={stat} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <Check className="w-4 h-4 text-[#5048e5]" />
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 기능 */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">핵심 기능</h2>
          <p className="text-slate-600 dark:text-slate-400">AI 기반 업무 자동화로 반복 업무를 줄이고 중요한 일에 집중하세요.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-[#5048e5]/40 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#5048e5]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-[#5048e5]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* AI 모델 비교표 */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700 text-center">
            <Brain className="w-8 h-8 text-[#5048e5] mx-auto mb-3" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">원하는 AI 모델, 투명한 비용</h3>
            <p className="text-slate-500 mt-2">내 API 키를 연결하면 사용한 만큼만 해당 AI 제공사에 직접 결제됩니다</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-900 dark:text-white">비교 항목</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-500">플랫폼 AI (크레딧)</th>
                  <th className="px-6 py-4 text-center font-bold text-[#5048e5]">BYOK (내 키 연결)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[
                  ['비용 구조', '구독 플랜에 포함된 크레딧 사용', '사용량에 따라 AI 제공사에 직접 결제'],
                  ['사용량', '플랜별 크레딧 한도', 'API 한도 내 자유 사용'],
                  ['모델 선택', '플랜별 제공 모델', 'Claude / GPT / Gemini 자유 선택'],
                  ['비용 투명성', '크레딧 단위 과금', '실제 API 단가 그대로 적용'],
                ].map(([feature, platform, byok]) => (
                  <tr key={feature}>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{feature}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{platform}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900 dark:text-white">{byok}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 요금제 */}
      <section id="pricing" className="py-20 sm:py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">합리적인 요금제</h2>
            <p className="text-slate-500">Free 플랜으로 시작하고, 필요에 따라 업그레이드하세요</p>
          </div>
          <p className="text-center text-sm text-slate-400 mb-14 max-w-2xl mx-auto">
            모든 플랜에서 BYOK(내 API 키 연결)를 지원합니다. BYOK 사용 시 AI 크레딧과 별개로 해당 AI 제공사에 사용량 기반 요금이 발생합니다.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(Object.entries(PLAN_LIMITS) as [string, typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS]][]).map(([key, plan]) => {
              const isPro = key === 'pro';
              return (
                <div key={key} className={`relative p-6 sm:p-8 rounded-2xl flex flex-col ${isPro ? 'bg-[#5048e5] text-white shadow-2xl shadow-[#5048e5]/30 scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                  {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-[#5048e5] text-xs font-black rounded-full shadow-md">추천</div>}
                  <h3 className={`font-black text-lg mb-1 ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                  <div className="mb-5">
                    <span className={`text-4xl font-black ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.price_monthly === 0 ? '₩0' : `₩${plan.price_monthly.toLocaleString()}`}
                    </span>
                    {plan.price_monthly > 0 && <span className={`text-sm ${isPro ? 'text-white/70' : 'text-slate-400'}`}>/월</span>}
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-start gap-2 text-sm ${isPro ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPro ? 'text-white' : 'text-[#5048e5]'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${isPro ? 'bg-white text-[#5048e5] hover:bg-white/90' : 'border border-[#5048e5] text-[#5048e5] hover:bg-[#5048e5] hover:text-white'}`}>
                    {key === 'free' ? '무료로 시작' : '구독하기'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 사용 사례 */}
      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">이런 업무에 활용하세요</h2>
            <p className="text-slate-500">AutoPilot으로 자동화할 수 있는 실제 업무 예시입니다</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <span className="text-3xl mb-4 block">{uc.icon}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{uc.desc}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#5048e5]">
                  <Zap className="w-4 h-4" />
                  {uc.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-12">자주 묻는 질문</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors list-none">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
              </summary>
              <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-20 sm:pb-24">
        <div className="bg-[#5048e5] rounded-[2rem] sm:rounded-[2.5rem] px-8 sm:px-12 py-14 sm:py-20 text-center text-white relative overflow-hidden shadow-2xl shadow-[#5048e5]/40">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,1),transparent)]" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">지금 바로 자동화 시작하기</h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">내 AI API 키를 연결하고, 사용한 만큼만 투명하게 결제하세요.</p>
            <Link href="/signup" className="inline-block px-10 py-4 bg-white text-[#5048e5] font-black rounded-xl text-base hover:shadow-xl hover:-translate-y-0.5 transition-all">
              무료로 시작하기
            </Link>
            <p className="text-sm text-white/60">Free 플랜 영구 무료 · BYOK 사용 시 AI 제공사 과금 · 언제든 취소</p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#5048e5] flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">AutoPilot</span>
              </div>
              <p className="text-sm text-slate-500">AI 기반 업무 자동화 플랫폼. 내 API 키로 투명하게 사용하는 AI 도구.</p>
            </div>
            {[
              { title: '제품', links: ['기능', '요금제', '업데이트'] },
              { title: '회사', links: ['소개', '블로그', '문의'] },
              { title: '법적 고지', links: ['이용약관', '개인정보처리방침'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-slate-500 hover:text-[#5048e5] transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; 2026 AutoPilot. All rights reserved.</p>
            <a href="mailto:support@autopilot.kr">support@autopilot.kr</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
