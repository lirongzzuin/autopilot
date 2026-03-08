import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmailDigest } from '@/lib/email';

/**
 * 일일 이메일 다이제스트 크론잡
 * POST /api/cron/email-digest
 * Vercel Cron: 매일 오전 9시 KST (00:00 UTC)
 *
 * 스케일 처리: 페이지네이션으로 대규모 사용자 처리
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  let sent = 0;
  let errors = 0;
  let offset = 0;
  const PAGE_SIZE = 50; // 한 번에 50명씩 처리

  // 페이지네이션으로 모든 활성 사용자 처리
  while (true) {
    const { data: profiles, error } = await adminClient
      .from('user_profiles')
      .select('id, email, full_name, plan')
      .not('plan', 'is', null)
      .not('email', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error || !profiles || profiles.length === 0) break;

    // 병렬 처리 (최대 10개씩)
    const chunks = [];
    for (let i = 0; i < profiles.length; i += 10) {
      chunks.push(profiles.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(async (profile) => {
          const { data: emails } = await adminClient
            .from('email_items')
            .select('subject, sender_name, ai_priority, ai_summary, snippet')
            .eq('user_id', profile.id)
            .gte('received_at', todayIso)
            .order('received_at', { ascending: false })
            .limit(20);

          if (!emails || emails.length === 0) return;

          const stats = {
            total: emails.length,
            urgent: emails.filter(e => e.ai_priority === 'urgent').length,
            important: emails.filter(e => e.ai_priority === 'important').length,
            normal: emails.filter(e => e.ai_priority === 'normal').length,
          };

          const urgentEmails = emails
            .filter(e => e.ai_priority === 'urgent')
            .slice(0, 5)
            .map(e => ({
              subject: e.subject,
              sender: e.sender_name,
              summary: e.ai_summary?.split('•')[1]?.trim() ?? e.snippet?.slice(0, 100) ?? '',
            }));

          await sendEmailDigest({
            to: profile.email,
            userName: profile.full_name ?? '사용자',
            date: new Date().toLocaleDateString('ko-KR'),
            stats,
            urgentEmails,
          });
        })
      );

      sent += results.filter(r => r.status === 'fulfilled' && r.value !== undefined).length;
      errors += results.filter(r => r.status === 'rejected').length;
    }

    if (profiles.length < PAGE_SIZE) break; // 마지막 페이지
    offset += PAGE_SIZE;
  }

  console.log(`[Email Digest] 완료: 발송 ${sent}건, 오류 ${errors}건`);
  return NextResponse.json({ sent, errors });
}

export const dynamic = 'force-dynamic';
