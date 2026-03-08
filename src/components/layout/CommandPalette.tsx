'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Mail, Zap, FileText, Bell, Brain, Settings,
  BarChart3, CreditCard, MessageSquare, Moon, Sun,
  Keyboard, Plus, LogOut, Home, X, Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  onSignOut?: () => void;
}

export function CommandPalette({ onSignOut }: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    // 네비게이션
    { id: 'nav-dashboard', label: '대시보드', description: '홈 대시보드로 이동', icon: <Home className="w-4 h-4" />, category: '이동', action: () => router.push('/dashboard'), keywords: ['home', '홈'] },
    { id: 'nav-inbox', label: '스마트 인박스', description: '이메일 관리', icon: <Mail className="w-4 h-4" />, category: '이동', action: () => router.push('/inbox'), keywords: ['email', '이메일', '메일'] },
    { id: 'nav-automations', label: '자동화', description: '워크플로우 자동화', icon: <Zap className="w-4 h-4" />, category: '이동', action: () => router.push('/automations'), keywords: ['workflow', '워크플로우'] },
    { id: 'nav-documents', label: '문서 자동화', description: 'AI 문서 생성', icon: <FileText className="w-4 h-4" />, category: '이동', action: () => router.push('/documents'), keywords: ['docs', '보고서', '문서'] },
    { id: 'nav-alerts', label: '스마트 알림', description: '알림 규칙 관리', icon: <Bell className="w-4 h-4" />, category: '이동', action: () => router.push('/alerts'), keywords: ['notification', '알림'] },
    { id: 'nav-analytics', label: '사용량 분석', description: 'AI 사용량 및 비용 분석', icon: <BarChart3 className="w-4 h-4" />, category: '이동', action: () => router.push('/analytics'), keywords: ['analytics', '분석', '통계'] },
    { id: 'nav-ai', label: 'AI 모델 설정', description: 'AI 제공자 및 모델 선택', icon: <Brain className="w-4 h-4" />, category: '이동', action: () => router.push('/ai-models'), keywords: ['ai', 'model', '모델'] },
    { id: 'nav-settings', label: '설정', description: '프로필 및 환경 설정', icon: <Settings className="w-4 h-4" />, category: '이동', action: () => router.push('/settings'), keywords: ['profile', '프로필'] },
    { id: 'nav-billing', label: '결제 관리', description: '구독 및 결제', icon: <CreditCard className="w-4 h-4" />, category: '이동', action: () => router.push('/settings/billing'), keywords: ['billing', '결제', '구독', 'plan'] },
    { id: 'nav-snippets', label: '이메일 스니펫', description: '빠른 답장 템플릿', icon: <MessageSquare className="w-4 h-4" />, category: '이동', action: () => router.push('/settings/snippets'), keywords: ['snippet', '템플릿', '답장'] },

    // 빠른 액션
    { id: 'action-new-automation', label: '새 자동화 만들기', description: '자연어로 자동화 생성', icon: <Plus className="w-4 h-4" />, category: '액션', action: () => router.push('/automations/new'), keywords: ['create', 'new', '새로', '만들기'] },
    { id: 'action-new-document', label: '새 문서 작성', description: 'AI로 문서 생성', icon: <FileText className="w-4 h-4" />, category: '액션', action: () => router.push('/documents'), keywords: ['write', '작성', '생성'] },
    { id: 'action-signout', label: '로그아웃', description: '계정에서 로그아웃', icon: <LogOut className="w-4 h-4" />, category: '액션', action: () => onSignOut?.(), keywords: ['logout', '로그아웃'] },
  ];

  const filteredCommands = query.trim()
    ? commands.filter(cmd => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some(k => k.toLowerCase().includes(q))
        );
      })
    : commands;

  // Group by category
  const grouped = filteredCommands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const flatList = filteredCommands;

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
    }
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatList[selectedIndex]) {
          flatList[selectedIndex].action();
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [flatList, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="명령어를 입력하세요..."
            className="flex-1 h-14 bg-transparent border-0 text-base placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
            ESC
          </kbd>
        </div>

        {/* 결과 목록 */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatList.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              검색 결과가 없습니다
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((cmd) => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-index={idx}
                      onClick={() => { cmd.action(); setIsOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        selectedIndex === idx
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedIndex === idx ? 'bg-primary/20' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* 하단 힌트 */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">↑↓</kbd>
            이동
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">Enter</kbd>
            선택
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">Esc</kbd>
            닫기
          </span>
        </div>
      </div>
    </div>
  );
}
