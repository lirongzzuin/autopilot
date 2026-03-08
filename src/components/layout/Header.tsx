'use client';

import { Bell, Search, Menu, Zap } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  onMenuToggle?: () => void;
  userCredits?: number;
  totalCredits?: number;
  userName?: string;
  userId?: string;
}

export function Header({ onMenuToggle, userCredits = 0, totalCredits = 1000, userName, userId = '' }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const creditPercent = totalCredits > 0 ? Math.round((userCredits / totalCredits) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 lg:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
      {/* 모바일 메뉴 */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 검색바 */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="자동화, 이메일, 문서 검색..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* AI 크레딧 */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Zap className="w-4 h-4 text-primary" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {userCredits.toLocaleString()}
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  creditPercent < 20 ? 'bg-red-500' : creditPercent < 50 ? 'bg-yellow-500' : 'bg-primary'
                }`}
                style={{ width: `${creditPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">크레딧</span>
          </div>
        </div>

        {/* 알림 */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(prev => !prev)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <NotificationCenter
            userId={userId}
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
          />
        </div>

        {/* 업그레이드 버튼 */}
        <Link
          href="/settings/billing"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-bold text-primary"
        >
          <Zap className="w-3.5 h-3.5" />
          업그레이드
        </Link>
      </div>
    </header>
  );
}
