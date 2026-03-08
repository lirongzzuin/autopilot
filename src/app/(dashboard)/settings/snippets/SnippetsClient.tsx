'use client';

import { useState } from 'react';
import { Plus, Trash2, Copy, FileText, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface Snippet {
  id: string;
  title: string;
  content: string;
  shortcut: string | null;
  use_count: number;
  created_at: string;
}

interface SnippetsClientProps {
  snippets: Snippet[];
  userId: string;
}

const DEFAULT_SNIPPETS = [
  { title: '감사 인사', content: '안녕하세요,\n\n연락 주셔서 감사합니다. 말씀하신 내용을 검토한 후 빠른 시간 내에 답변 드리겠습니다.\n\n감사합니다.', shortcut: '/thanks' },
  { title: '회의 요청 수락', content: '안녕하세요,\n\n회의 요청 주셔서 감사합니다. 말씀하신 일정에 참석 가능합니다. 자세한 내용은 캘린더 초대를 통해 공유해 주시면 감사하겠습니다.\n\n감사합니다.', shortcut: '/accept' },
  { title: '검토 중 안내', content: '안녕하세요,\n\n보내주신 내용 잘 받았습니다. 현재 검토 중이며, [날짜]까지 답변 드리겠습니다.\n\n궁금하신 사항이 있으시면 언제든지 연락 주세요.\n\n감사합니다.', shortcut: '/review' },
  { title: '부재 중 안내', content: '안녕하세요,\n\n현재 부재 중으로 즉각적인 답변이 어렵습니다. [날짜]에 복귀 예정이며, 복귀 후 바로 확인하겠습니다.\n\n긴급한 사항은 [연락처]로 연락 주세요.\n\n감사합니다.', shortcut: '/away' },
];

export function SnippetsClient({ snippets: initialSnippets, userId }: SnippetsClientProps) {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState(initialSnippets);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', shortcut: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inbox/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.snippet) {
        setSnippets(prev => [data.snippet, ...prev]);
        setForm({ title: '', content: '', shortcut: '' });
        setShowForm(false);
        toast({ title: '스니펫이 저장되었습니다', variant: 'success' });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 스니펫을 삭제하시겠습니까?')) return;
    await fetch('/api/inbox/snippets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSnippets(prev => prev.filter(s => s.id !== id));
    toast({ title: '삭제되었습니다' });
  }

  async function addDefaultSnippet(template: typeof DEFAULT_SNIPPETS[0]) {
    const res = await fetch('/api/inbox/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    const data = await res.json();
    if (data.snippet) {
      setSnippets(prev => [data.snippet, ...prev]);
      toast({ title: `"${template.title}" 스니펫이 추가되었습니다`, variant: 'success' });
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content);
    toast({ title: '클립보드에 복사됨' });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">이메일 스니펫</h1>
          <p className="text-sm text-slate-500 mt-1">자주 쓰는 답장을 저장하고 인박스에서 빠르게 삽입하세요</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          새 스니펫
        </Button>
      </div>

      {/* 새 스니펫 폼 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">새 스니펫 작성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="스니펫 제목"
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="예: 감사 인사"
              />
              <Input
                label="단축 명령어 (선택)"
                value={form.shortcut}
                onChange={(e) => setForm(p => ({ ...p, shortcut: e.target.value }))}
                placeholder="/thanks"
                hint="/ 로 시작하는 명령어"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="이메일 답장 내용을 입력하세요..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={saving}>저장</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>취소</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 기본 제공 스니펫 */}
      {snippets.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              기본 스니펫 추가
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">자주 사용되는 스니펫으로 빠르게 시작하세요</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {DEFAULT_SNIPPETS.map((s) => (
                <div key={s.title} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{s.title}</span>
                    <Button size="sm" variant="outline" onClick={() => addDefaultSnippet(s)}>추가</Button>
                  </div>
                  {s.shortcut && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-mono">{s.shortcut}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 스니펫 목록 */}
      {snippets.length > 0 && (
        <div className="space-y-3">
          {snippets.map((snippet) => (
            <Card key={snippet.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{snippet.title}</span>
                      {snippet.shortcut && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          <Hash className="w-2.5 h-2.5 mr-0.5" />
                          {snippet.shortcut}
                        </Badge>
                      )}
                      {snippet.use_count > 0 && (
                        <span className="text-xs text-slate-400">{snippet.use_count}회 사용</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-3">
                      {snippet.content}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(snippet.content)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                      title="복사"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
