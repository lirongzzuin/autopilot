'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail, Search, RefreshCw, Sparkles, Clock, AlertTriangle, CheckCircle, Inbox, Bell,
  Keyboard, X, Star, Ban, Eye, EyeOff, Users, Crown, Newspaper, BellRing, MoreHorizontal,
  PartyPopper, Shield, Copy, ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { EmailItem, EmailPriority } from '@/types';

interface InboxClientProps {
  emails: EmailItem[];
  userId: string;
  focusMode?: boolean;
}

// Split Inbox 탭 (Superhuman 스타일)
const SPLIT_TABS = [
  { id: 'important', label: '중요', icon: AlertTriangle, description: '사람이 보낸 중요 이메일' },
  { id: 'team', label: '팀', icon: Users, description: '내부 팀 이메일' },
  { id: 'vip', label: 'VIP', icon: Crown, description: 'VIP 발신자' },
  { id: 'newsletter', label: '뉴스레터', icon: Newspaper, description: '구독 뉴스레터' },
  { id: 'notification', label: '알림', icon: BellRing, description: '자동 알림' },
  { id: 'all', label: '전체', icon: Inbox, description: '모든 이메일' },
];

const PRIORITY_CONFIG: Record<EmailPriority, { label: string; variant: 'urgent' | 'important' | 'normal' | 'spam'; dot: string }> = {
  urgent: { label: '긴급', variant: 'urgent', dot: 'bg-red-500' },
  important: { label: '중요', variant: 'important', dot: 'bg-yellow-500' },
  normal: { label: '일반', variant: 'normal', dot: 'bg-green-500' },
  spam: { label: '스팸', variant: 'spam', dot: 'bg-slate-300' },
};

const SNOOZE_OPTIONS = [
  { label: '1시간 후', hours: 1 },
  { label: '3시간 후', hours: 3 },
  { label: '오늘 저녁 6시', hours: null, getDate: () => { const d = new Date(); d.setHours(18, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); return d; } },
  { label: '내일 오전 9시', hours: null, getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; } },
  { label: '다음 주 월요일', hours: null, getDate: () => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (8 - day) % 7 || 7); d.setHours(9, 0, 0, 0); return d; } },
];

const KEYBOARD_SHORTCUTS = [
  { key: 'j / ↓', desc: '다음 이메일' },
  { key: 'k / ↑', desc: '이전 이메일' },
  { key: 'r', desc: 'AI 답장 초안 생성' },
  { key: 'i', desc: 'AI 즉시 답장 3종' },
  { key: 'e', desc: '읽음으로 표시' },
  { key: 'u', desc: '읽지 않음으로 표시' },
  { key: 's', desc: '스누즈 메뉴 열기' },
  { key: 'x', desc: '별표 토글' },
  { key: 'b', desc: '발신자 차단' },
  { key: '/', desc: '검색 포커스' },
  { key: '?', desc: '단축키 도움말' },
  { key: 'Esc', desc: '선택 해제 / 닫기' },
];

interface InstantReply {
  tone: string;
  label: string;
  content: string;
}

export function InboxClient({ emails: initialEmails, userId, focusMode: initialFocusMode = false }: InboxClientProps) {
  const { toast } = useToast();
  const [emails, setEmails] = useState(initialEmails);
  const [splitTab, setSplitTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [analyzing, setAnalyzing] = useState(false);
  const [draftReply, setDraftReply] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [focusMode, setFocusMode] = useState(initialFocusMode);
  const [blockedEmails, setBlockedEmails] = useState<string[]>([]);
  const [instantReplies, setInstantReplies] = useState<InstantReply[]>([]);
  const [instantLoading, setInstantLoading] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load blocked senders on mount
  useEffect(() => {
    fetch('/api/inbox/block-sender')
      .then(r => r.json())
      .then(d => setBlockedEmails((d.blockedSenders ?? []).map((b: any) => b.sender_email)))
      .catch(() => {});
  }, []);

  // Filter emails based on split tab, search, focus mode, blocked senders
  const filteredEmails = emails
    .filter(email => !blockedEmails.includes(email.sender_email.toLowerCase()))
    .filter(email => {
      if (focusMode) return email.ai_priority === 'urgent' || email.ai_priority === 'important';
      if (splitTab === 'all') return !email.snoozed_until || new Date(email.snoozed_until) <= new Date();
      if (splitTab === 'important') return email.ai_priority === 'urgent' || email.ai_priority === 'important';
      if (splitTab === 'team') return email.ai_category === 'team';
      if (splitTab === 'vip') return email.ai_category === 'vip';
      if (splitTab === 'newsletter') return email.ai_category === 'newsletter';
      if (splitTab === 'notification') return email.ai_category === 'notification';
      return true;
    })
    .filter(email => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.sender_name.toLowerCase().includes(q) ||
        email.sender_email.toLowerCase().includes(q) ||
        (email.ai_summary?.toLowerCase().includes(q) ?? false)
      );
    });

  const selectedEmail = selectedIndex >= 0 && selectedIndex < filteredEmails.length
    ? filteredEmails[selectedIndex]
    : null;

  // Inbox Zero detection
  const inboxZero = filteredEmails.length === 0 && emails.length > 0;

  async function analyzeEmails() {
    const unanalyzed = emails.filter(e => !e.ai_priority).slice(0, 10);
    if (unanalyzed.length === 0) { toast({ title: '모든 이메일이 분석 완료됨' }); return; }
    setAnalyzing(true);
    try {
      const res = await fetch('/api/inbox/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailIds: unanalyzed.map(e => e.id) }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: `${data.analyzed ?? unanalyzed.length}개 이메일 분석 완료`, variant: 'success' });
      } else {
        toast({ title: '이메일 분석에 실패했습니다', variant: 'error' });
      }
    } catch {
      toast({ title: '네트워크 오류가 발생했습니다', variant: 'error' });
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateDraft(email: EmailItem) {
    setDraftLoading(true);
    setDraftReply(null);
    setInstantReplies([]);
    try {
      const res = await fetch('/api/inbox/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email.id }),
      });
      if (!res.ok) {
        toast({ title: res.status === 429 ? '요청이 너무 빠릅니다. 잠시 후 다시 시도하세요' : '답장 초안 생성에 실패했습니다', variant: 'error' });
        return;
      }
      const data = await res.json();
      setDraftReply(data.draft);
    } catch {
      toast({ title: '네트워크 오류가 발생했습니다', variant: 'error' });
    } finally {
      setDraftLoading(false);
    }
  }

  async function generateInstantReplies(email: EmailItem) {
    setInstantLoading(true);
    setInstantReplies([]);
    setDraftReply(null);
    try {
      const res = await fetch('/api/inbox/instant-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email.id }),
      });
      if (!res.ok) {
        toast({ title: res.status === 429 ? '요청이 너무 빠릅니다. 잠시 후 다시 시도하세요' : '즉시 답장 생성에 실패했습니다', variant: 'error' });
        return;
      }
      const data = await res.json();
      setInstantReplies(data.replies ?? []);
    } catch {
      toast({ title: '네트워크 오류가 발생했습니다', variant: 'error' });
    } finally {
      setInstantLoading(false);
    }
  }

  async function markAsRead(email: EmailItem, isRead: boolean) {
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: isRead } : e));
    try {
      const res = await fetch('/api/inbox/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email.id, isRead }),
      });
      if (!res.ok) {
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: !isRead } : e));
        toast({ title: '상태 변경에 실패했습니다', variant: 'error' });
        return;
      }
      toast({ title: isRead ? '읽음으로 표시됨' : '읽지 않음으로 표시됨' });
    } catch {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: !isRead } : e));
      toast({ title: '네트워크 오류가 발생했습니다', variant: 'error' });
    }
  }

  async function toggleStar(email: EmailItem) {
    const newVal = !email.is_starred;
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_starred: newVal } : e));
    try {
      const res = await fetch('/api/inbox/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email.id, isStarred: newVal }),
      });
      if (!res.ok) {
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_starred: !newVal } : e));
      }
    } catch {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_starred: !newVal } : e));
    }
  }

  async function snoozeEmail(email: EmailItem, snoozeUntil: Date) {
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, snoozed_until: snoozeUntil.toISOString(), is_read: true } : e));
    setShowSnooze(false);
    await fetch('/api/inbox/snooze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId: email.id, snoozeUntil: snoozeUntil.toISOString() }),
    });
    toast({ title: `${snoozeUntil.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}에 다시 표시됩니다` });
  }

  async function blockSender(email: EmailItem) {
    if (!confirm(`${email.sender_name} (${email.sender_email})을(를) 차단하시겠습니까?\n\n이 발신자의 이메일이 더 이상 표시되지 않습니다.`)) return;
    setBlockedEmails(prev => [...prev, email.sender_email.toLowerCase()]);
    await fetch('/api/inbox/block-sender', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderEmail: email.sender_email, senderName: email.sender_name }),
    });
    toast({ title: `${email.sender_name} 차단됨` });
    setSelectedIndex(-1);
  }

  async function toggleFocusMode() {
    const next = !focusMode;
    setFocusMode(next);
    await fetch('/api/user/focus-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focusMode: next }),
    });
    toast({ title: next ? '집중 모드 ON — 긴급/중요 이메일만 표시' : '집중 모드 OFF' });
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape는 어디서든 동작
    if (e.key === 'Escape') {
      if (showShortcuts) { setShowShortcuts(false); return; }
      if (showSnooze) { setShowSnooze(false); return; }
      if (showMoreActions) { setShowMoreActions(false); return; }
      setSelectedIndex(-1);
      return;
    }

    // Input/Textarea 내에서는 단축키 비활성
    const tag = (document.activeElement as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      setShowShortcuts(prev => !prev);
      return;
    }

    switch (e.key) {
      case 'j': case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredEmails.length - 1));
        setDraftReply(null); setInstantReplies([]);
        break;
      case 'k': case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        setDraftReply(null); setInstantReplies([]);
        break;
      case 'r':
        if (selectedEmail) generateDraft(selectedEmail);
        break;
      case 'i':
        if (selectedEmail) generateInstantReplies(selectedEmail);
        break;
      case 'e':
        if (selectedEmail) markAsRead(selectedEmail, true);
        break;
      case 'u':
        if (selectedEmail) markAsRead(selectedEmail, false);
        break;
      case 's':
        if (selectedEmail) setShowSnooze(prev => !prev);
        break;
      case 'x':
        if (selectedEmail) toggleStar(selectedEmail);
        break;
      case 'b':
        if (selectedEmail) blockSender(selectedEmail);
        break;
      case '/':
        e.preventDefault();
        searchRef.current?.focus();
        break;
    }
  }, [filteredEmails, selectedEmail, showShortcuts, showSnooze, showMoreActions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const stats = {
    urgent: emails.filter(e => e.ai_priority === 'urgent').length,
    important: emails.filter(e => e.ai_priority === 'important').length,
    unread: emails.filter(e => !e.is_read).length,
    starred: emails.filter(e => e.is_starred).length,
  };

  return (
    <div className="flex h-full gap-6 max-w-7xl mx-auto relative">
      {/* 키보드 단축키 모달 */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900 dark:text-white">키보드 단축키</h3>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.map(({ key, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{desc}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 왼쪽: 이메일 목록 */}
      <div className="flex flex-col w-full lg:w-[420px] shrink-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">스마트 인박스</h1>
          <div className="flex items-center gap-1">
            {/* 집중 모드 */}
            <button
              onClick={toggleFocusMode}
              className={`p-2 rounded-xl transition-colors ${focusMode ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
              title={focusMode ? '집중 모드 해제' : '집중 모드 (긴급/중요만)'}
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="키보드 단축키 (?)"
            >
              <Keyboard className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={analyzeEmails}
              disabled={analyzing}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="AI 분석 실행"
            >
              <RefreshCw className={`w-5 h-5 text-slate-500 ${analyzing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {focusMode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-bold text-primary">집중 모드</span>
            </div>
          )}
          {stats.urgent > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-bold text-red-700 dark:text-red-400">긴급 {stats.urgent}</span>
            </div>
          )}
          {stats.unread > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">읽지 않음 {stats.unread}</span>
            </div>
          )}
          {stats.starred > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{stats.starred}</span>
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이메일 검색... ( / )"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Split Inbox 탭 */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {SPLIT_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all'
              ? emails.filter(e => !e.snoozed_until || new Date(e.snoozed_until) <= new Date()).length
              : tab.id === 'important'
                ? emails.filter(e => e.ai_priority === 'urgent' || e.ai_priority === 'important').length
                : emails.filter(e => e.ai_category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSplitTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  splitTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
                title={tab.description}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                    splitTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 이메일 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Inbox Zero 축하 */}
          {inboxZero && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center mb-6 animate-bounce">
                <PartyPopper className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Inbox Zero!</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                모든 이메일을 처리했습니다. 중요한 일에 집중하세요.
              </p>
              <div className="flex gap-2 mt-6">
                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full text-xs font-bold text-green-600">
                  처리 완료 {emails.length}건
                </span>
              </div>
            </div>
          )}

          {/* 이메일 없음 (데이터 자체가 없을 때) */}
          {filteredEmails.length === 0 && !inboxZero && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">
                {focusMode ? '집중 모드: 긴급/중요 이메일이 없습니다' : '이메일이 없습니다'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {focusMode ? '집중 모드를 해제하면 모든 이메일을 볼 수 있습니다' : 'Gmail을 연결하면 이메일이 표시됩니다'}
              </p>
            </div>
          )}

          {filteredEmails.map((email, idx) => {
            const priority = email.ai_priority ? PRIORITY_CONFIG[email.ai_priority] : null;
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={email.id}
                onClick={() => { setSelectedIndex(idx); setDraftReply(null); setInstantReplies([]); }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600'
                } ${!email.is_read ? 'ring-1 ring-primary/20' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {email.sender_name.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold truncate ${!email.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {email.sender_name}
                      </span>
                      {priority && <div className={`w-2 h-2 rounded-full ${priority.dot} shrink-0`} />}
                      {email.is_starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                      {email.snoozed_until && <Bell className="w-3 h-3 text-amber-500 shrink-0" />}
                    </div>
                    <p className={`text-xs truncate ${!email.is_read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                      {email.subject}
                    </p>
                    {email.ai_summary && (
                      <p className="text-xs text-slate-400 truncate mt-1">{email.ai_summary.split('•')[1]?.trim()}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400">{timeAgo(email.received_at)}</span>
                    {priority && (
                      <Badge variant={priority.variant} className="text-[10px] px-1.5 py-0">{priority.label}</Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 오른쪽: 이메일 상세 */}
      <div className="hidden lg:flex flex-1 flex-col">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            {/* 이메일 헤더 */}
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{selectedEmail.sender_name}</span>
                      <span className="text-slate-400">&lt;{selectedEmail.sender_email}&gt;</span>
                      <span>·</span>
                      <span>{timeAgo(selectedEmail.received_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmail.ai_priority && (
                      <Badge variant={PRIORITY_CONFIG[selectedEmail.ai_priority].variant}>
                        {PRIORITY_CONFIG[selectedEmail.ai_priority].label}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => markAsRead(selectedEmail, !selectedEmail.is_read)}>
                    {selectedEmail.is_read ? <><EyeOff className="w-3.5 h-3.5" /> 읽지 않음 (u)</> : <><Eye className="w-3.5 h-3.5" /> 읽음 (e)</>}
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => toggleStar(selectedEmail)}>
                    <Star className={`w-3.5 h-3.5 ${selectedEmail.is_starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                    별표 (x)
                  </Button>

                  {/* 스누즈 */}
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setShowSnooze(prev => !prev)}>
                      <Bell className="w-3.5 h-3.5" />
                      스누즈 (s)
                    </Button>
                    {showSnooze && (
                      <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden w-48">
                        {SNOOZE_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => {
                              const snoozeDate = opt.getDate
                                ? opt.getDate()
                                : new Date(Date.now() + (opt.hours ?? 1) * 3600000);
                              snoozeEmail(selectedEmail, snoozeDate);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 더보기 */}
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setShowMoreActions(prev => !prev)}>
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                    {showMoreActions && (
                      <div className="absolute top-full right-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden w-48">
                        <button
                          onClick={() => { blockSender(selectedEmail); setShowMoreActions(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center gap-2"
                        >
                          <Ban className="w-4 h-4" />
                          발신자 차단 (b)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI 분석 패널 */}
            {selectedEmail.ai_summary && (
              <Card className="mb-4 bg-primary/5 border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">AI 분석 결과</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">3줄 요약</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{selectedEmail.ai_summary}</p>
                    </div>
                    {selectedEmail.ai_action_items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">액션 아이템</p>
                        <ul className="space-y-1">
                          {selectedEmail.ai_action_items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <span className="text-primary mt-0.5">→</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 이메일 본문 */}
            <Card className="flex-1 mb-4 overflow-auto">
              <CardContent className="p-6">
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedEmail.body || selectedEmail.snippet}
                </pre>
              </CardContent>
            </Card>

            {/* 즉시 답장 + 답장 초안 */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => generateInstantReplies(selectedEmail)}
                  isLoading={instantLoading}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4" />
                  즉시 답장 3종 (i)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateDraft(selectedEmail)}
                  isLoading={draftLoading}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4" />
                  상세 답장 초안 (r)
                </Button>
              </div>

              {/* 즉시 답장 카드 (Superhuman Instant Reply) */}
              {instantReplies.length > 0 && (
                <div className="grid gap-2">
                  {instantReplies.map((reply, i) => (
                    <Card key={i} className="hover:border-primary/30 transition-colors cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-primary">{reply.label}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(reply.content);
                              toast({ title: '클립보드에 복사됨' });
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-primary flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            복사
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{reply.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* 상세 답장 초안 */}
              {draftReply && (
                <Card className="bg-slate-50 dark:bg-slate-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-500">AI 생성 초안</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(draftReply).then(() => toast({ title: '클립보드에 복사됨' }))}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        복사
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{draftReply}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
            <Mail className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="font-medium text-slate-500">이메일을 선택하세요</p>
            <p className="text-sm mt-1">j/k 이동 · r 답장 · i 즉시 답장 · ? 단축키</p>
          </div>
        )}
      </div>
    </div>
  );
}
