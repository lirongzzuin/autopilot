'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AIChatWidget } from '@/components/ai-chat/AIChatWidget';

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  userId: string;
  userPlan: string;
  userName: string;
  userEmail: string;
  userCredits: number;
  totalCredits: number;
}

export function DashboardClientLayout({
  children,
  userId,
  userPlan,
  userName,
  userEmail,
  userCredits,
  totalCredits,
}: DashboardClientLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* 모바일 오버레이 */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed lg:relative z-50 lg:z-auto h-full transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          userPlan={userPlan}
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          userCredits={userCredits}
          totalCredits={totalCredits}
          userName={userName}
          userId={userId}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* AI Chat Widget - 전역 플로팅 */}
      <AIChatWidget />
    </div>
  );
}
