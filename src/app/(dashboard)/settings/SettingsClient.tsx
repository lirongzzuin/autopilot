'use client';

import { useState } from 'react';
import { User, Globe, Link, Unlink, CheckCircle, Mail, MessageSquare, Database, Cloud, Calendar, Layers, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import type { UserProfile, ConnectedService, ConnectedServiceType } from '@/types';

interface SettingsClientProps {
  profile: UserProfile | null;
  connectedServices: ConnectedService[];
  userId: string;
}

const INTEGRATION_LIST: Array<{ id: ConnectedServiceType; name: string; icon: React.ElementType; desc: string; authType: string }> = [
  { id: 'gmail', name: 'Gmail', icon: Mail, desc: '이메일 자동 분류 및 요약', authType: 'google' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, desc: 'Slack 알림 및 메시지 자동화', authType: 'slack' },
  { id: 'notion', name: 'Notion', icon: Layers, desc: '문서 & 데이터베이스 자동화', authType: 'notion' },
  { id: 'jira', name: 'Jira', icon: Zap, desc: '이슈 자동 생성 및 관리', authType: 'jira' },
  { id: 'google_drive', name: 'Google Drive', icon: Cloud, desc: '파일 & 문서 자동 저장', authType: 'google' },
  { id: 'google_sheets', name: 'Google Sheets', icon: Database, desc: '스프레드시트 자동화', authType: 'google' },
  { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, desc: '일정 & 회의 자동화', authType: 'google' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Seoul', label: '한국 표준시 (KST, UTC+9)' },
  { value: 'Asia/Tokyo', label: '일본 표준시 (JST, UTC+9)' },
  { value: 'America/New_York', label: '미국 동부 (EST, UTC-5)' },
  { value: 'Europe/London', label: '영국 (GMT, UTC+0)' },
];

export function SettingsClient({ profile, connectedServices, userId }: SettingsClientProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    company: profile?.company ?? '',
    job_title: profile?.job_title ?? '',
    timezone: profile?.timezone ?? 'Asia/Seoul',
  });
  const [saving, setSaving] = useState(false);

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSaveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('user_profiles').update(form).eq('id', userId);
    if (!error) {
      toast({ title: '프로필이 저장되었습니다', variant: 'success' });
    } else {
      toast({ title: '저장 중 오류가 발생했습니다', variant: 'error' });
    }
    setSaving(false);
  }

  function isConnected(serviceId: ConnectedServiceType): boolean {
    return connectedServices.some(s => s.service === serviceId && s.is_active);
  }

  function handleConnect(service: typeof INTEGRATION_LIST[0]) {
    // OAuth 연동 (실제 구현 시 OAuth flow 트리거)
    const urls: Record<string, string> = {
      google: `/api/oauth/google?service=${service.id}`,
      slack: `/api/oauth/slack`,
      notion: `/api/oauth/notion`,
      jira: `/api/oauth/jira`,
    };
    window.location.href = urls[service.authType] ?? '#';
  }

  async function handleDisconnect(serviceId: ConnectedServiceType) {
    if (!confirm('연결을 해제하시겠습니까?')) return;
    const supabase = createClient();
    await supabase.from('connected_services').update({ is_active: false }).eq('user_id', userId).eq('service', serviceId);
    toast({ title: '연결이 해제되었습니다', variant: 'success' });
    window.location.reload();
  }

  async function handleDeleteAccount() {
    if (!confirm('정말 계정을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) return;
    if (!confirm('이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?')) return;
    // 계정 삭제 API 호출
    await fetch('/api/user/delete', { method: 'DELETE' });
    window.location.href = '/';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">설정</h1>

      {/* 프로필 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            프로필 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="이름" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="홍길동" />
            <Input label="이메일" value={profile?.email ?? ''} disabled hint="이메일은 변경할 수 없습니다" />
            <Input label="회사" value={form.company} onChange={(e) => updateField('company', e.target.value)} placeholder="회사명" />
            <Input label="직함" value={form.job_title} onChange={(e) => updateField('job_title', e.target.value)} placeholder="마케팅 팀장" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">타임존</label>
            <select
              value={form.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSaveProfile} isLoading={saving}>저장</Button>
        </CardContent>
      </Card>

      {/* 외부 서비스 연동 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            연동 서비스 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {INTEGRATION_LIST.map((service) => {
            const connected = isConnected(service.id);
            const connectedService = connectedServices.find(s => s.service === service.id);
            const Icon = service.icon;

            return (
              <div key={service.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${connected ? 'bg-green-100 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  <Icon className={`w-5 h-5 ${connected ? 'text-green-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{service.name}</span>
                    {connected && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{service.desc}</p>
                  {connected && connectedService?.account_email && (
                    <p className="text-xs text-green-600 mt-0.5">{connectedService.account_email}</p>
                  )}
                </div>
                {connected ? (
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(service.id)}>
                    <Unlink className="w-4 h-4" />
                    해제
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(service)}>
                    <Link className="w-4 h-4" />
                    연결
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 계정 삭제 */}
      <Card className="border-red-200 dark:border-red-900/30">
        <CardHeader>
          <CardTitle className="text-red-600">위험 구역</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">계정을 삭제하면 모든 데이터, API 키, 결제 정보가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>계정 삭제</Button>
        </CardContent>
      </Card>
    </div>
  );
}
