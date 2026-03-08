'use client';

import { Bell, Menu, Zap, Command } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
  onMenuToggle?: () => void;
  userCredits?: number;
  totalCredits?: number;
  userName?: string;
  userId?: string;
}

export function Header({ onMenuToggle, userCredits = 0, totalCredits = 1000, userName, userId = '' }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const creditPercent = totalCredits > 0 ? Math.round((userCredits / totalCredits) * 100) : 0;

  return (
    <>
      <CommandPalette />

      <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 lg:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        {/* 모바일 메뉴 */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Cmd+K 검색 트리거 */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="flex-1 max-w-md hidden md:flex items-center gap-3 h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Command className="w-4 h-4" />
          <span>검색 및 명령어...</span>
          <kbd className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

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
    </>
  );
}
