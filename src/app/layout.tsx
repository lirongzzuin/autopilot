import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AutoPilot — AI 업무 자동화 플랫폼',
  description: '이메일 자동 분류, 워크플로우 자동화, 문서 생성까지. 사무직 전용 AI 업무 자동화 플랫폼으로 매주 5시간 이상 절약하세요.',
  keywords: ['업무자동화', 'AI', '이메일자동화', '워크플로우', '생산성', 'ChatGPT', 'Claude', 'Gemini'],
  authors: [{ name: 'AutoPilot' }],
  openGraph: {
    title: 'AutoPilot — AI 업무 자동화 플랫폼',
    description: '이메일 정리에 하루 2시간? AI가 3분에 끝냅니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
