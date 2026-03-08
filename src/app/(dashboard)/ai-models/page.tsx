'use client';

import { useState, useEffect } from 'react';
import { Brain, Key, Zap, Check, AlertCircle, Eye, EyeOff, Cpu, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { AI_MODEL_INFO, type AIModel, type AIProvider } from '@/types';
import { useToast } from '@/components/ui/toast';

const PROVIDERS: Record<AIProvider, { name: string; color: string; logo: string }> = {
  openai: { name: 'OpenAI', color: 'text-emerald-600', logo: '🤖' },
  anthropic: { name: 'Anthropic', color: 'text-orange-600', logo: '🧠' },
  google: { name: 'Google AI', color: 'text-blue-600', logo: '✨' },
};

const MODEL_LIST = Object.entries(AI_MODEL_INFO).map(([id, info]) => ({ id: id as AIModel, ...info }));

export default function AIModelsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'platform' | 'byok'>('platform');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    openai: '',
    anthropic: '',
    google: '',
  });
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [validating, setValidating] = useState<AIProvider | null>(null);
  const [keyStatus, setKeyStatus] = useState<Record<AIProvider, 'valid' | 'invalid' | 'unchecked'>>({
    openai: 'unchecked',
    anthropic: 'unchecked',
    google: 'unchecked',
  });
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{ ai_mode: string; selected_model: string; ai_credits_remaining: number; ai_credits_total: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('user_profiles').select('ai_mode, selected_model, ai_credits_remaining, ai_credits_total').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) {
              setProfile(data);
              setActiveTab(data.ai_mode as 'platform' | 'byok');
              setSelectedModel(data.selected_model as AIModel || 'gpt-4o-mini');
            }
          });
      }
    });
  }, []);

  async function validateKey(provider: AIProvider) {
    if (!apiKeys[provider]) return;
    setValidating(provider);
    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKeys[provider] }),
      });
      const data = await res.json();
      setKeyStatus(prev => ({ ...prev, [provider]: data.valid ? 'valid' : 'invalid' }));
      if (data.valid) {
        toast({ title: '✅ API 키 확인 완료', variant: 'success' });
      } else {
        toast({ title: '❌ API 키가 유효하지 않습니다', variant: 'error' });
      }
    } catch {
      setKeyStatus(prev => ({ ...prev, [provider]: 'invalid' }));
    } finally {
      setValidating(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiMode: activeTab, selectedModel, apiKeys }),
      });
      if (res.ok) {
        toast({ title: 'AI 설정이 저장되었습니다', variant: 'success' });
      }
    } catch {
      toast({ title: '저장 중 오류가 발생했습니다', variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const creditPercent = profile ? Math.round((profile.ai_credits_remaining / profile.ai_credits_total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">AI 모델 설정</h1>
          <p className="text-slate-500 text-sm mt-1">업무 자동화에 사용할 AI 모델을 선택하세요</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>설정 저장</Button>
      </div>

      {/* 크레딧 현황 */}
      {activeTab === 'platform' && profile && (
        <Card className="bg-gradient-to-r from-primary/10 to-violet-500/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-bold text-slate-900 dark:text-white">이번 달 AI 크레딧</span>
              </div>
              <span className="text-sm font-bold text-primary">{creditPercent}% 남음</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${creditPercent < 20 ? 'bg-red-500' : creditPercent < 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                style={{ width: `${creditPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {profile.ai_credits_remaining.toLocaleString()} / {profile.ai_credits_total.toLocaleString()} 크레딧 · 매월 1일 초기화
            </p>
          </CardContent>
        </Card>
      )}

      {/* 탭 */}
      <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 gap-1">
        {[
          { id: 'platform' as const, icon: Cpu, label: '플랫폼 AI', desc: '구독 포함' },
          { id: 'byok' as const, icon: Key, label: '내 API 키 (BYOK)', desc: '무제한' },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <Badge variant={tab.id === 'byok' ? 'success' : 'default'} className="text-[10px]">{tab.desc}</Badge>
            </button>
          );
        })}
      </div>

      {/* 플랫폼 AI 탭 */}
      {activeTab === 'platform' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>모델 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MODEL_LIST.filter(m => m.tier !== 'premium').map((model) => {
                  const provider = PROVIDERS[model.provider];
                  const isSelected = selectedModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl">{provider.logo}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{model.name}</span>
                          <Badge variant={model.tier === 'basic' ? 'normal' : 'important'} className="text-[10px]">
                            {model.tier === 'basic' ? '기본' : '고급'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          입력 ${model.costPer1MInput}/1M · 출력 ${model.costPer1MOutput}/1M
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BYOK 탭 */}
      {activeTab === 'byok' && (
        <div className="space-y-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">BYOK 모드란?</p>
                <p>OpenAI, Anthropic, Google의 API 키를 직접 입력하면 플랫폼 AI 크레딧을 소모하지 않고 무제한으로 사용할 수 있습니다. API 키는 AES-256으로 암호화되어 안전하게 저장됩니다.</p>
              </div>
            </CardContent>
          </Card>

          {(Object.entries(PROVIDERS) as [AIProvider, typeof PROVIDERS[AIProvider]][]).map(([provider, info]) => {
            const status = keyStatus[provider];
            return (
              <Card key={provider}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{info.logo}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{info.name}</h3>
                      <p className="text-xs text-slate-500">
                        {provider === 'openai' && 'platform.openai.com/api-keys'}
                        {provider === 'anthropic' && 'console.anthropic.com/keys'}
                        {provider === 'google' && 'aistudio.google.com/app/apikey'}
                      </p>
                    </div>
                    {status === 'valid' && <Badge variant="success" className="ml-auto">✓ 유효</Badge>}
                    {status === 'invalid' && <Badge variant="error" className="ml-auto">✗ 오류</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKeys[provider] ? 'text' : 'password'}
                        value={apiKeys[provider]}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                        placeholder={`${info.name} API 키 입력`}
                        className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => validateKey(provider)}
                      isLoading={validating === provider}
                      disabled={!apiKeys[provider]}
                    >
                      검증
                    </Button>
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
