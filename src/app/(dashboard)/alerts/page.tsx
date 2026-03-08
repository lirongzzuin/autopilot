'use client';

import { useState } from 'react';
import { Bell, Plus, Toggle, Trash2, Mail, MessageSquare, Zap, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  slack: <MessageSquare className="w-4 h-4" />,
  jira: <Zap className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
};

const EXAMPLE_ALERTS = [
  {
    id: '1',
    name: '긴급 키워드 이메일 알림',
    source: 'email' as const,
    conditions: [{ type: 'keyword', value: '긴급, URGENT, 즉시' }],
    channels: ['slack', 'in_app'],
    is_active: true,
    last_triggered: '5분 전',
  },
  {
    id: '2',
    name: '클라이언트 이메일 모니터링',
    source: 'email' as const,
    conditions: [{ type: 'sender', value: '@client.com' }],
    channels: ['in_app'],
    is_active: true,
    last_triggered: '1시간 전',
  },
  {
    id: '3',
    name: '경쟁사 뉴스 모니터링',
    source: 'website' as const,
    conditions: [{ type: 'keyword', value: '경쟁사명, 신제품' }],
    channels: ['email'],
    is_active: false,
    last_triggered: '어제',
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(EXAMPLE_ALERTS);
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ name: '', source: 'email', keyword: '' });

  function toggleAlert(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
  }

  function deleteAlert(id: string) {
    if (confirm('이 알림 규칙을 삭제하시겠습니까?')) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
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
              <Button size="sm" onClick={() => {
                if (!newAlert.name) return;
                setAlerts(prev => [...prev, {
                  id: Date.now().toString(),
                  name: newAlert.name,
                  source: newAlert.source as 'email',
                  conditions: [{ type: 'keyword', value: newAlert.keyword }],
                  channels: ['in_app'],
                  is_active: true,
                  last_triggered: '없음',
                }]);
                setShowForm(false);
                setNewAlert({ name: '', source: 'email', keyword: '' });
              }}>저장</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 알림 통계 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '활성 규칙', value: alerts.filter(a => a.is_active).length, color: 'text-primary' },
          { label: '오늘 발생', value: 12, color: 'text-green-600' },
          { label: '이번 주 발생', value: 47, color: 'text-blue-600' },
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
        {alerts.map((alert) => (
          <Card key={alert.id} className={`transition-all ${!alert.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.is_active ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                  {SOURCE_ICONS[alert.source]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{alert.name}</h3>
                    <Badge variant={alert.is_active ? 'success' : 'outline'} className="text-[10px]">
                      {alert.is_active ? '활성' : '중지'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>조건: {alert.conditions[0]?.value}</span>
                    <span>·</span>
                    <span>채널: {alert.channels.join(', ')}</span>
                    <span>·</span>
                    <span>마지막 발생: {alert.last_triggered}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAlert(alert.id)}
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
