'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Plus, Play, Pause, Trash2, Clock, CheckCircle, XCircle, Search, ChevronRight, Sparkles, Grid3X3, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { AUTOMATION_TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from '@/lib/automation-templates';
import type { Automation, AutomationLog } from '@/types';

interface AutomationsClientProps {
  automations: Automation[];
  logs: AutomationLog[];
  userId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  '이메일': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  '일정 관리': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  '팀 협업': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  '데이터 관리': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  '알림': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  'AI 자동화': 'bg-primary/10 text-primary dark:bg-primary/20',
};

export function AutomationsClient({ automations: initialAutomations, logs, userId }: AutomationsClientProps) {
  const { toast } = useToast();
  const [automations, setAutomations] = useState(initialAutomations);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showTemplates, setShowTemplates] = useState(initialAutomations.length === 0);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('전체');
  const [activating, setActivating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filtered = automations.filter((a) => {
    if (filter === 'active' && !a.is_active) return false;
    if (filter === 'inactive' && a.is_active) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredTemplates = AUTOMATION_TEMPLATES.filter(t =>
    templateCategory === '전체' || t.category === templateCategory
  );

  const popularTemplates = AUTOMATION_TEMPLATES.filter(t => t.popular);

  async function toggleActive(id: string, isActive: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from('automations').update({ is_active: !isActive }).eq('id', id);
    if (!error) {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !isActive } : a));
      toast({ title: `자동화가 ${!isActive ? '활성화' : '중지'}되었습니다`, variant: 'success' });
    }
  }

  async function deleteAutomation(id: string) {
    if (!confirm('이 자동화를 삭제하시겠습니까?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('automations').delete().eq('id', id);
    if (!error) {
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast({ title: '자동화가 삭제되었습니다' });
    }
  }

  async function activateTemplate(templateId: string) {
    const template = AUTOMATION_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setActivating(templateId);
    const supabase = createClient();
    const { data, error } = await supabase.from('automations').insert({
      user_id: userId,
      name: template.title,
      description: template.description,
      is_active: true,
      nodes: template.nodes,
      edges: template.edges,
    }).select().single();

    if (!error && data) {
      setAutomations(prev => [data, ...prev]);
      setShowTemplates(false);
      toast({ title: `"${template.title}" 활성화!`, description: '자동화가 즉시 시작됩니다', variant: 'success' });
    }
    setActivating(null);
  }

  const activeCount = automations.filter(a => a.is_active).length;
  const successRate = logs.length > 0
    ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100)
    : 100;
  const weeklyRuns = logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">워크플로우 자동화</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeCount}개 활성 · 이번 주 {weeklyRuns}회 실행 · 성공률 {successRate}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Grid3X3 className="w-4 h-4" />
            템플릿 라이브러리
          </Button>
          <Link href="/automations/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              새 자동화
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '활성 자동화', value: activeCount, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '이번 주 실행', value: weeklyRuns, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '성공률', value: `${successRate}%`, color: 'text-primary', bg: 'bg-primary/10' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 템플릿 라이브러리 */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                자동화 템플릿 라이브러리
                <Badge variant="default" className="text-xs">{AUTOMATION_TEMPLATES.length}개</Badge>
              </CardTitle>
              <button onClick={() => setShowTemplates(false)} className="text-xs text-slate-400 hover:text-slate-600">닫기</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 인기 템플릿 */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">🔥 인기 템플릿</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {popularTemplates.map((t) => (
                  <TemplateCard key={t.id} template={t} onActivate={activateTemplate} activating={activating} />
                ))}
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">카테고리별 탐색</p>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      templateCategory === cat
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTemplates.map((t) => (
                  <TemplateCard key={t.id} template={t} onActivate={activateTemplate} activating={activating} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 & 필터 */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="자동화 검색..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {([['all', '전체'], ['active', '활성'], ['inactive', '중지']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === val ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 자동화 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Zap className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">아직 자동화가 없습니다</h3>
          <p className="text-slate-400 text-sm mb-6">템플릿 라이브러리에서 선택하거나 새 자동화를 만들어보세요</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
              <Grid3X3 className="w-4 h-4" />
              템플릿 탐색
            </Button>
            <Link href="/automations/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                직접 만들기
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filtered.map((auto) => {
            const recentLogs = logs.filter(l => l.automation_id === auto.id).slice(0, 7);
            const autoSuccessRate = recentLogs.length > 0
              ? Math.round((recentLogs.filter(l => l.status === 'success').length / recentLogs.length) * 100)
              : null;

            return (
              <Card key={auto.id} className={`transition-all hover:shadow-md ${!auto.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${auto.is_active ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <Zap className={`w-5 h-5 ${auto.is_active ? 'text-primary' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/automations/${auto.id}`}>
                          <h3 className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer">
                            {auto.name}
                          </h3>
                        </Link>
                        <Badge variant={auto.is_active ? 'success' : 'outline'} className="text-[10px]">
                          {auto.is_active ? '활성' : '중지'}
                        </Badge>
                      </div>
                      {auto.description && (
                        <p className="text-sm text-slate-500 mt-0.5 truncate">{auto.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          총 {auto.run_count}회
                        </span>
                        {auto.last_run_at && (
                          <span>마지막: {timeAgo(auto.last_run_at)}</span>
                        )}
                        {autoSuccessRate !== null && (
                          <span className={autoSuccessRate >= 80 ? 'text-green-500' : autoSuccessRate >= 50 ? 'text-amber-500' : 'text-red-500'}>
                            성공 {autoSuccessRate}%
                          </span>
                        )}
                        {/* 최근 실행 상태 도트 */}
                        <div className="flex gap-1">
                          {recentLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}
                              title={log.status}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/automations/${auto.id}`}>
                        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="상세 보기">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => toggleActive(auto.id, auto.is_active)}
                        className={`p-2 rounded-xl transition-colors ${auto.is_active ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'}`}
                        title={auto.is_active ? '중지' : '활성화'}
                      >
                        {auto.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAutomation(auto.id)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 템플릿 카드 컴포넌트
function TemplateCard({ template, onActivate, activating }: {
  template: typeof AUTOMATION_TEMPLATES[0];
  onActivate: (id: string) => void;
  activating: string | null;
}) {
  const CATEGORY_COLORS: Record<string, string> = {
    '이메일': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    '일정 관리': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    '팀 협업': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    '데이터 관리': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    '알림': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    'AI 자동화': 'bg-primary/10 text-primary',
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-sm transition-all bg-white dark:bg-slate-800 group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xl">{template.icon}</span>
        <div className="flex items-center gap-2">
          {template.popular && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">인기</span>
          )}
          <button
            onClick={() => onActivate(template.id)}
            disabled={activating === template.id}
            className="text-xs font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            {activating === template.id ? '추가 중...' : '+ 활성화'}
          </button>
        </div>
      </div>
      <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 leading-tight">{template.title}</h3>
      <p className="text-xs text-slate-500 mb-2.5 line-clamp-2">{template.description}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[template.category] ?? 'bg-slate-100 text-slate-600'}`}>
          {template.category}
        </span>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5 text-slate-500">⚡ {template.trigger}</span>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5 text-slate-500">→ {template.action}</span>
      </div>
    </div>
  );
}
