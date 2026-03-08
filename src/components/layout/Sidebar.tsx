'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Zap,
  Mail,
  FileText,
  Bell,
  Brain,
  Settings,
  CreditCard,
  ChevronLeft,
  Rocket,
  LogOut,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/inbox', label: '스마트 인박스', icon: Mail },
  { href: '/automations', label: '자동화', icon: Zap },
  { href: '/documents', label: '문서 자동화', icon: FileText },
  { href: '/alerts', label: '알림', icon: Bell },
  { href: '/analytics', label: '사용량 분석', icon: BarChart3 },
  { href: '/ai-models', label: 'AI 모델', icon: Brain },
];

const bottomItems = [
  { href: '/settings/snippets', label: '이메일 스니펫', icon: MessageSquare },
  { href: '/settings', label: '설정', icon: Settings },
  { href: '/settings/billing', label: '결제', icon: CreditCard },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  userPlan?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ collapsed = false, onToggle, userPlan = 'free', userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* 로고 */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">AutoPilot</span>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="w-3 h-3 rotate-180" />
          </button>
        )}
      </div>

      {/* 플랜 뱃지 */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary capitalize">{userPlan} 플랜</span>
          </div>
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 메뉴 */}
      <div className="px-2 py-2 border-t border-slate-100 dark:border-slate-800">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* 사용자 정보 */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">
                {userName?.slice(0, 1)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
