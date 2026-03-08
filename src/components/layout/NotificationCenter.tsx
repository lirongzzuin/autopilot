'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Zap, Bell, Info } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'automation_success' | 'automation_failed' | 'credit_low' | 'alert_triggered' | 'system';
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: React.ElementType; color: string }
> = {
  automation_success: { icon: CheckCircle, color: 'text-green-500' },
  automation_failed: { icon: XCircle, color: 'text-red-500' },
  credit_low: { icon: Zap, color: 'text-amber-500' },
  alert_triggered: { icon: Bell, color: 'text-blue-500' },
  system: { icon: Info, color: 'text-slate-400' },
};

function SkeletonItem() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-full" />
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
      </div>
    </div>
  );
}

export function NotificationCenter({ userId, isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch when opened
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div
      ref={panelRef}
      className="fixed top-16 right-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">알림</span>
        <button
          onClick={markAllRead}
          className="text-xs text-[#5048e5] hover:text-[#4338ca] transition-colors font-medium"
        >
          모두 읽음
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
        {isLoading ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">새로운 알림이 없습니다</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => {
            const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  !notification.is_read ? 'bg-[#5048e5]/5' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#5048e5] mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {notification.body}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {timeAgo(notification.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
