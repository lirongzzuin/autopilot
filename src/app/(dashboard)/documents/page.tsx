'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Wand2, Trash2, Edit, Copy, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { timeAgo } from '@/lib/utils';

const TEMPLATE_CATEGORIES = [
  { id: 'report', label: '보고서', icon: '📊' },
  { id: 'meeting', label: '회의록', icon: '📝' },
  { id: 'proposal', label: '제안서', icon: '📋' },
  { id: 'email', label: '이메일 템플릿', icon: '📧' },
  { id: 'invoice', label: '인보이스', icon: '🧾' },
];

interface Document {
  id: string;
  title: string;
  category: string;
  content: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });
      setDocuments(data ?? []);
    } catch {
      // Silently fail - empty state will show
    } finally {
      setLoading(false);
    }
  }

  async function generateDocument() {
    if (!prompt) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category: activeCategory === 'all' ? 'general' : activeCategory }),
      });
      if (!res.ok) {
        toast({ title: '문서 생성에 실패했습니다', variant: 'error' });
        return;
      }
      const data = await res.json();
      setGeneratedDoc(data.content ?? '문서 생성 실패');
    } catch {
      toast({ title: '네트워크 오류가 발생했습니다', variant: 'error' });
    } finally {
      setGenerating(false);
    }
  }

  async function saveDocument() {
    if (!generatedDoc) return;
    setSaving(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const title = prompt.slice(0, 50) || '새 문서';
      const category = activeCategory === 'all' ? 'general' : activeCategory;
      const { data, error } = await supabase
        .from('documents')
        .insert({ title, category, content: generatedDoc })
        .select()
        .single();
      if (!error && data) {
        setDocuments(prev => [data, ...prev]);
        setGeneratedDoc('');
        setPrompt('');
        setShowGenerator(false);
        toast({ title: '문서가 저장되었습니다', variant: 'success' });
      } else {
        toast({ title: '저장에 실패했습니다', variant: 'error' });
      }
    } finally {
      setSaving(false);
    }
  }

  function copyDocument(content: string) {
    navigator.clipboard.writeText(content);
    toast({ title: '클립보드에 복사됨' });
  }

  async function deleteDocument(id: string) {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return;
    const prev = documents;
    setDocuments(documents.filter(d => d.id !== id));
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) {
        setDocuments(prev);
        toast({ title: '삭제에 실패했습니다', variant: 'error' });
      } else {
        toast({ title: '문서가 삭제되었습니다' });
      }
    } catch {
      setDocuments(prev);
      toast({ title: '네트워크 오류', variant: 'error' });
    }
  }

  const filteredDocs = documents.filter(d => activeCategory === 'all' || d.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">문서 자동화</h1>
          <p className="text-slate-500 text-sm mt-1">AI로 보고서, 회의록, 제안서를 자동으로 생성하세요</p>
        </div>
        <Button onClick={() => setShowGenerator(!showGenerator)}>
          <Wand2 className="w-4 h-4" />
          AI 문서 생성
        </Button>
      </div>

      {/* AI 문서 생성기 */}
      {showGenerator && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              AI 문서 생성기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">문서 유형</label>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      activeCategory === cat.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary/10'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">문서 내용 설명</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 지난주 영업팀 주간 업무보고서. 매출 목표 대비 85% 달성, 신규 고객 3명 확보, 다음 주 목표..."
                className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-slate-400"
              />
            </div>
            <Button onClick={generateDocument} isLoading={generating} className="w-full">
              <Wand2 className="w-4 h-4" />
              문서 생성하기
            </Button>

            {generatedDoc && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">생성된 문서</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyDocument(generatedDoc)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      복사
                    </button>
                    <button
                      onClick={saveDocument}
                      disabled={saving}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      저장
                    </button>
                  </div>
                </div>
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                  {generatedDoc}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600'}`}
        >
          전체
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600'}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* 문서 목록 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 새 문서 추가 버튼 */}
        <button
          onClick={() => setShowGenerator(true)}
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
        >
          <Plus className="w-8 h-8" />
          <span className="font-semibold text-sm">새 문서 만들기</span>
        </button>

        {filteredDocs.length === 0 && documents.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">문서가 없습니다</p>
            <p className="text-sm mt-1">AI 문서 생성기로 첫 문서를 만들어보세요</p>
          </div>
        )}

        {filteredDocs.map((doc) => {
          const cat = TEMPLATE_CATEGORIES.find(c => c.id === doc.category);
          return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">{cat?.icon ?? '📄'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(doc.updated_at)} 수정</p>
                  </div>
                </div>
                {doc.content && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.content.slice(0, 100)}</p>
                )}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyDocument(doc.content)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    복사
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors text-slate-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
