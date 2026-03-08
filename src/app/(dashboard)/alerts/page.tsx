'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Mail, MessageSquare, Zap, Globe, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  slack: <MessageSquare className="w-4 h-4" />,
  jira: <Zap className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
  rss: <Bell className="w-4 h-4" />,
};

interface Alert {
  id: string;
  name: string;
  source: string;
  conditions: any[];
  channels: any[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAlert, setNewAlert] = useState({ name: '', source: 'email', keyword: '' });

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch {
      toast({ title: '알림 로드 실패', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function createAlert() {
    if (!newAlert.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAlert.name,
          source: newAlert.source,
          conditions: newAlert.keyword
            ? [{ type: 'keyword', value: newAlert.keyword, operator: 'contains' }]
            : [],
          channels: [{ type: 'in_app', config: {} }],
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setAlerts(prev => [created, ...prev]);
        setShowForm(false);
        setNewAlert({ name: '', source: 'email', keyword: '' });
        toast({ title: '알림 규칙이 생성되었습니다', variant: 'success' });
      } else {
        toast({ title: '알림 생성 실패', variant: 'error' });
      }
    } catch {
      toast({ title: '알림 생성 실패', variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlert(id: string, isActive: boolean) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !isActive } : a));
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      if (!res.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: isActive } : a));
        toast({ title: '상태 변경 실패', variant: 'error' });
      }
    } catch {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: isActive } : a));
      toast({ title: '상태 변경 실패', variant: 'error' });
    }
  }

  async function deleteAlert(id: string) {
    if (!confirm('이 알림 규칙을 삭제하시겠습니까?')) return;
    const prev = alerts;
    setAlerts(alerts.filter(a => a.id !== id));
    try {
      const res = await fetch('/api/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast({ title: '알림 규칙이 삭제되었습니다' });
      } else {
        setAlerts(prev);
        toast({ title: '삭제 실패', variant: 'error' });
      }
    } catch {
      setAlerts(prev);
      toast({ title: '삭제 실패', variant: 'error' });
    }
  }

  function formatLastTriggered(dateStr: string | null): string {
    if (!dateStr) return '없음';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return '어제';
    return `${diffDay}일 전`;
  }

  function formatConditions(conditions: any[]): string {
    if (!conditions || conditions.length === 0) return '없음';
    return conditions.map(c => c.value).join(', ');
  }

  function formatChannels(channels: any[]): string {
    if (!channels || channels.length === 0) return '없음';
    return channels.map(c => typeof c === 'string' ? c : c.type).join(', ');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">스마트 알림</h1>
          <p className="text-slate-500 text-sm mt-1">중요한 이벤트만 선택적으로 알림 받으세요</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          알림 규칙 추가
        </Button>
      </div>

      {/* 새 알림 폼 */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-base">새 알림 규칙</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">알림 이름</label>
                <input
                  value={newAlert.name}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 긴급 이메일 알림"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">모니터링 대상</label>
                <select
                  value={newAlert.source}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="email">이메일</option>
                  <option value="slack">Slack</option>
                  <option value="jira">Jira</option>
                  <option value="website">웹사이트</option>
                  <option value="rss">RSS 피드</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">키워드 조건</label>
              <input
                value={newAlert.keyword}
                onChange={(e) => setNewAlert(prev => ({ ...prev, keyword: e.target.value }))}
                placeholder="쉼표로 구분: 긴급, URGENT, 즉시 처리"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>취소</Button>
              <Button size="sm" onClick={createAlert} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 알림 통계 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '활성 규칙', value: alerts.filter(a => a.is_active).length, color: 'text-primary' },
          { label: '전체 규칙', value: alerts.length, color: 'text-green-600' },
          { label: '비활성 규칙', value: alerts.filter(a => !a.is_active).length, color: 'text-blue-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        {alerts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold">알림 규칙이 없습니다</p>
              <p className="text-sm mt-1">위의 &quot;알림 규칙 추가&quot; 버튼으로 새 규칙을 만들어 보세요</p>
            </CardContent>
          </Card>
        )}
        {alerts.map((alert) => (
          <Card key={alert.id} className={`transition-all ${!alert.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.is_active ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                  {SOURCE_ICONS[alert.source] ?? <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{alert.name}</h3>
                    <Badge variant={alert.is_active ? 'success' : 'outline'} className="text-[10px]">
                      {alert.is_active ? '활성' : '중지'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>조건: {formatConditions(alert.conditions)}</span>
                    <span>·</span>
                    <span>채널: {formatChannels(alert.channels)}</span>
                    <span>·</span>
                    <span>마지막 발생: {formatLastTriggered(alert.last_triggered_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAlert(alert.id, alert.is_active)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${alert.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alert.is_active ? 'translate-x-5' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
