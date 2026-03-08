import Link from 'next/link';
import { Check, Zap, Mail, FileText, Bell, Brain, Star, ChevronDown, Rocket, ArrowRight } from 'lucide-react';
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
    desc: '드래그 앤 드롭으로 자동화를 만들거나, 자연어로 설명하면 AI가 자동으로 워크플로우를 구성합니다.',
  },
  {
    icon: FileText,
    title: 'AI 문서 자동화',
    desc: '회의록, 주간보고서, 제안서를 AI가 자동으로 생성하고 Notion/Google Drive에 저장합니다.',
  },
  {
    icon: Bell,
    title: '스마트 알림 시스템',
    desc: '특정 키워드, 발신자, AI 감정 분석 조건에 맞는 알림만 받아 집중력을 유지하세요.',
  },
];

const TESTIMONIALS = [
  {
    name: '김민준',
    role: '마케팅 팀장 · 스타트업',
    text: '"AutoPilot 덕분에 이메일 확인하는 시간이 하루 2시간에서 20분으로 줄었습니다. 긴급한 메일만 바로 알림이 와서 업무 집중도가 높아졌어요."',
    rating: 5,
  },
  {
    name: '이서현',
    role: '프로젝트 매니저 · 대기업',
    text: '"BYOK 기능이 정말 좋아요. 이미 GPT 구독하고 있어서 API 키만 연결했더니 추가 비용 없이 무제한으로 쓸 수 있었습니다."',
    rating: 5,
  },
  {
    name: '박준혁',
    role: '영업 팀 · 중소기업',
    text: '"회의록 자동화가 킬러 기능입니다. 회의 끝나면 바로 Notion에 정리되고 참석자들한테 요약 메일이 가니까 팀원들 모두 만족해요."',
    rating: 5,
  },
];

const FAQS = [
  {
    q: '내 API 키(BYOK)는 안전하게 보관되나요?',
    a: '네, 모든 API 키는 AES-256 암호화로 저장되며 서버 사이드에서만 복호화됩니다. 클라이언트에는 절대 노출되지 않습니다.',
  },
  {
    q: 'BYOK를 사용하면 어떤 장점이 있나요?',
    a: 'OpenAI, Anthropic, Google AI API 키를 직접 연결하면 플랫폼 AI 크레딧을 소모하지 않고 무제한으로 사용할 수 있습니다.',
  },
  {
    q: 'Gmail 연동은 안전한가요?',
    a: 'Gmail API OAuth2를 통해 연동되며, 읽기 권한만 요청합니다. 토큰은 AES-256으로 암호화 저장되며 언제든지 연결 해제할 수 있습니다.',
  },
  {
    q: '14일 무료 체험 후 자동 결제되나요?',
    a: '아니요. 무료 체험 중 카드 정보를 입력하지 않으면 자동으로 Free 플랜으로 전환됩니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '결제 후 7일 이내에는 전액 환불이 가능합니다. 이후에는 잔여 기간을 일할 계산하여 환불해 드립니다. support@autopilot.kr로 문의하세요.',
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
            {[['#features', '기능'], ['#pricing', '요금제'], ['#reviews', '후기'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#5048e5] transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-bold px-3 sm:px-5 py-2 rounded-lg hover:bg-[#5048e5]/5 transition-colors">로그인</Link>
            <Link href="/signup" className="bg-[#5048e5] text-white text-sm font-bold px-4 sm:px-6 py-2.5 rounded-xl hover:bg-[#5048e5]/90 shadow-lg shadow-[#5048e5]/20 transition-all">무료 시작</Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24 pb-12 sm:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5048e5]/10 border border-[#5048e5]/20">
              <Zap className="w-3.5 h-3.5 text-[#5048e5]" />
              <span className="text-xs font-bold text-[#5048e5] tracking-wide">내 AI API 키로 무제한 사용 (BYOK)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
              이메일 정리에<br />하루 2시간?<br />
              <span className="text-[#5048e5]">AI가 3분에 끝냅니다.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
              이메일 자동 분류, 워크플로우 자동화, 문서 생성까지. 사무직 전용 AI 업무 자동화 플랫폼.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-4 bg-[#5048e5] text-white font-bold rounded-xl shadow-xl shadow-[#5048e5]/30 hover:-translate-y-0.5 transition-transform text-sm sm:text-base">
                14일 무료 시작하기 <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm sm:text-base">
                기능 살펴보기
              </a>
            </div>
            <p className="text-sm text-slate-400">신용카드 불필요 · 언제든 취소 가능</p>
            <div>
              <p className="text-xs text-slate-400 mb-3">다음과 연동됩니다</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['Gmail', 'Slack', 'Notion', 'Jira', 'Google Drive', 'Claude', 'GPT-4o', 'Gemini'].map((s) => (
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
                  <span className="font-bold text-sm text-slate-900 dark:text-white">오늘의 요약</span>
                  <span className="text-xs text-slate-400">2026년 3월 8일</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '처리된 이메일', value: '142건', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
                    { label: '실행된 자동화', value: '38건', bg: 'bg-[#5048e5]/10', color: 'text-[#5048e5]' },
                    { label: '절약한 시간', value: '2.4h', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-600' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">📬 긴급 이메일 (2)</p>
                  {[
                    { sender: '김대표', subject: '[긴급] 내일 오전 미팅 확정 건', time: '5분 전' },
                    { sender: '박클라이언트', subject: '계약서 검토 요청 - 오늘 EOD', time: '23분 전' },
                  ].map((email) => (
                    <div key={email.subject} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                      <span>🔴</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{email.sender}</p>
                        <p className="text-[10px] text-slate-500 truncate">{email.subject}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{email.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 소셜 프루프 */}
      <div className="bg-white dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">5,000+ 사무직 직장인이 사용 중</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {['매주 평균 5시간 절약', '이메일 분류 정확도 98%', '자동화 설정 3분', '24/7 AI 처리'].map((stat) => (
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
          <p className="text-slate-600 dark:text-slate-400">AI 기반 업무 자동화로 반복 업무를 제거하고 중요한 일에 집중하세요.</p>
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
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">원하는 AI 모델 자유롭게 선택</h3>
            <p className="text-slate-500 mt-2">Claude, GPT-4o, Gemini — 업무에 맞는 최적의 AI를 고르세요</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-900 dark:text-white">비교 항목</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-500">플랫폼 AI</th>
                  <th className="px-6 py-4 text-center font-bold text-[#5048e5]">BYOK (내 키 사용)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[
                  ['월 비용', '구독 크레딧 포함', '실제 API 단가 (저렴)'],
                  ['사용량', '플랜별 크레딧 제한', '무제한 (API 한도 내)'],
                  ['모델 선택', '플랜별 제공 모델', 'Claude/GPT/Gemini 자유 선택'],
                  ['데이터 제어', '표준 암호화', 'API 직접 제어'],
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
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">합리적인 요금제</h2>
            <p className="text-slate-500">시작은 무료로, 필요할 때 업그레이드하세요</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(Object.entries(PLAN_LIMITS) as [string, typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS]][]).map(([key, plan]) => {
              const isPro = key === 'pro';
              return (
                <div key={key} className={`relative p-6 sm:p-8 rounded-2xl flex flex-col ${isPro ? 'bg-[#5048e5] text-white shadow-2xl shadow-[#5048e5]/30 scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                  {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-[#5048e5] text-xs font-black rounded-full shadow-md">가장 인기</div>}
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
                    {key === 'free' ? '무료 시작' : '14일 무료 체험'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 후기 */}
      <section id="reviews" className="py-20 sm:py-24 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center mb-16">
            {[{ value: '98%', label: '사용자 만족도' }, { value: '5시간+', label: '주당 평균 절약' }, { value: '5,000+', label: '사용 직장인' }].map((s) => (
              <div key={s.label}>
                <div className="text-4xl sm:text-5xl font-black text-[#5048e5] mb-2">{s.value}</div>
                <p className="text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
          <h2 className="text-3xl font-black text-center text-white mb-10">직장인들의 실제 후기</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-700">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-300 italic mb-6 leading-relaxed">{t.text}</p>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
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
            <p className="text-white/80 text-lg max-w-xl mx-auto">5,000+ 직장인이 AutoPilot으로 주당 5시간을 되찾았습니다.</p>
            <Link href="/signup" className="inline-block px-10 py-4 bg-white text-[#5048e5] font-black rounded-xl text-base hover:shadow-xl hover:-translate-y-0.5 transition-all">
              14일 무료 시작하기
            </Link>
            <p className="text-sm text-white/60">신용카드 불필요 · 언제든 취소 · 무료 플랜 영구 제공</p>
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
              <p className="text-sm text-slate-500">AI 기반 업무 자동화 플랫폼. 사무직 직장인을 위한 최고의 생산성 도구.</p>
            </div>
            {[
              { title: '제품', links: ['기능', '요금제', '통합 서비스', '업데이트'] },
              { title: '회사', links: ['소개', '블로그', '채용', '문의'] },
              { title: '법적 고지', links: ['이용약관', '개인정보처리방침', '쿠키 정책'] },
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
            <p>© 2026 AutoPilot. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <span>사업자등록번호: 000-00-00000</span>
              <span>통신판매업신고: 제2026-서울-00000호</span>
            </div>
            <a href="mailto:support@autopilot.kr">support@autopilot.kr</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
