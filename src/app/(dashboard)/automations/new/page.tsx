'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wand2, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';

const TRIGGER_TYPES = [
  { id: 'new_email', label: '새 이메일 수신', icon: '📧' },
  { id: 'schedule', label: '정해진 시간/요일', icon: '⏰' },
  { id: 'slack_message', label: 'Slack 메시지', icon: '💬' },
  { id: 'webhook', label: '웹훅 수신', icon: '🔗' },
  { id: 'manual', label: '수동 실행', icon: '▶️' },
  { id: 'sheets_row_added', label: 'Google Sheets 행 추가', icon: '📊' },
];

const ACTION_TYPES = [
  { id: 'send_email', label: '이메일 발송', icon: '📨' },
  { id: 'slack_message', label: 'Slack 메시지 전송', icon: '💬' },
  { id: 'create_jira_issue', label: 'Jira 이슈 생성', icon: '🎯' },
  { id: 'create_notion_page', label: 'Notion 페이지 생성', icon: '📝' },
  { id: 'ai_summarize', label: 'AI 요약 생성', icon: '🤖' },
  { id: 'webhook_call', label: '웹훅 전송', icon: '🔗' },
  { id: 'add_sheets_row', label: 'Google Sheets 행 추가', icon: '📊' },
];

export default function NewAutomationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [mode, setMode] = useState<'visual' | 'nl'>('visual');
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);

  function toggleAction(id: string) {
    setSelectedActions(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }

  async function parseNaturalLanguage() {
    if (!naturalLanguage) return;
    setParsing(true);
    try {
      const res = await fetch('/api/automations/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: naturalLanguage }),
      });
      const data = await res.json();
      if (data.name) setName(data.name);
      if (data.trigger) setSelectedTrigger(data.trigger);
      if (data.actions) setSelectedActions(data.actions);
      setMode('visual');
      toast({ title: 'AI가 자동화를 생성했습니다', variant: 'success' });
    } catch {
      toast({ title: '파싱 실패. 직접 설정해주세요.', variant: 'error' });
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!name || !selectedTrigger || selectedActions.length === 0) {
      toast({ title: '이름, 트리거, 액션을 모두 설정해주세요', variant: 'error' });
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const nodes = [
      { id: 'trigger-1', type: 'trigger', nodeType: selectedTrigger, config: {}, position: { x: 100, y: 100 } },
      ...selectedActions.map((action, i) => ({
        id: `action-${i + 1}`,
        type: 'action' as const,
        nodeType: action,
        config: {},
        position: { x: 100 + (i + 1) * 200, y: 100 },
      })),
    ];

    const edges = selectedActions.map((_, i) => ({
      id: `edge-${i}`,
      source: i === 0 ? 'trigger-1' : `action-${i}`,
      target: `action-${i + 1}`,
    }));

    const { error } = await supabase.from('automations').insert({
      user_id: user.id,
      name,
      description,
      is_active: true,
      nodes,
      edges,
    });

    if (!error) {
      toast({ title: '자동화가 생성되었습니다!', variant: 'success' });
      router.push('/automations');
    } else {
      toast({ title: '저장 중 오류가 발생했습니다', variant: 'error' });
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/automations" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">새 자동화 만들기</h1>
      </div>

      {/* 모드 탭 */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button onClick={() => setMode('visual')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'visual' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>
          시각적 편집
        </button>
        <button onClick={() => setMode('nl')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'nl' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>
          <Wand2 className="w-4 h-4" />
          AI 자연어 생성
        </button>
      </div>

      {/* 자연어 입력 모드 */}
      {mode === 'nl' && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-bold text-slate-900 dark:text-white mb-3">원하는 자동화를 설명해주세요</h2>
            <textarea
              value={naturalLanguage}
              onChange={(e) => setNaturalLanguage(e.target.value)}
              placeholder="예: 매일 아침 9시에 읽지 않은 이메일을 요약해서 Slack으로 보내줘"
              className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-slate-400"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {['매일 아침 이메일 요약 → Slack', '긴급 이메일 → Slack DM', '클라이언트 이메일 → Jira 이슈'].map((ex) => (
                <button key={ex} onClick={() => setNaturalLanguage(ex)} className="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors">
                  {ex}
                </button>
              ))}
            </div>
            <Button onClick={parseNaturalLanguage} isLoading={parsing} className="mt-4 w-full">
              <Wand2 className="w-4 h-4" />
              AI로 자동화 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 시각적 편집 모드 */}
      {mode === 'visual' && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="자동화 이름"
              placeholder="예: 긴급 이메일 Slack 알림"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="설명 (선택)"
              placeholder="이 자동화는..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 트리거 선택 */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">1</span>
                트리거 선택
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRIGGER_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrigger(t.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                      selectedTrigger === t.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/30'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 액션 선택 */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">2</span>
                액션 선택 (복수 가능)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACTION_TYPES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggleAction(a.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                      selectedActions.includes(a.id)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/30'
                    }`}
                  >
                    <span>{a.icon}</span>
                    <span className="text-xs">{a.label}</span>
                  </button>
                ))}
              </div>

              {/* 선택된 액션 순서 표시 */}
              {selectedActions.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {selectedActions.map((id, i) => {
                    const action = ACTION_TYPES.find(a => a.id === id);
                    return (
                      <div key={id} className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                        <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">{i + 1}</span>
                        {action?.icon} {action?.label}
                        <button onClick={() => toggleAction(id)} className="text-primary/60 hover:text-primary">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} isLoading={saving} className="w-full h-12">
            <Save className="w-4 h-4" />
            자동화 저장 & 활성화
          </Button>
        </>
      )}
    </div>
  );
}
