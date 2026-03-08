'use client';

import { useState } from 'react';
import { FileText, Plus, Wand2, Download, Trash2, Edit, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TEMPLATE_CATEGORIES = [
  { id: 'report', label: '보고서', icon: '📊' },
  { id: 'meeting', label: '회의록', icon: '📝' },
  { id: 'proposal', label: '제안서', icon: '📋' },
  { id: 'email', label: '이메일 템플릿', icon: '📧' },
  { id: 'invoice', label: '인보이스', icon: '🧾' },
];

const EXAMPLE_DOCS = [
  { id: '1', title: '2026년 3월 주간 업무 보고서', category: 'report', updatedAt: '2시간 전' },
  { id: '2', title: '프로젝트 A 킥오프 회의록', category: 'meeting', updatedAt: '어제' },
  { id: '3', title: '신규 서비스 제안서 초안', category: 'proposal', updatedAt: '3일 전' },
];

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  async function generateDocument() {
    if (!prompt) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category: activeCategory }),
      });
      const data = await res.json();
      setGeneratedDoc(data.content ?? '문서 생성 실패');
    } finally {
      setGenerating(false);
    }
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
                    <button className="text-xs text-primary hover:underline">복사</button>
                    <button className="text-xs text-primary hover:underline">저장</button>
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

        {/* 기존 문서 목록 */}
        {EXAMPLE_DOCS.map((doc) => {
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
                    <p className="text-xs text-slate-400 mt-0.5">{doc.updatedAt} 수정</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                    편집
                  </button>
                  <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors text-slate-500">
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
