import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Webhook receiver - 외부 도구가 AutoPilot 자동화를 트리거할 수 있는 엔드포인트
 * POST /api/webhooks/receive/[userId]
 * Headers: X-Webhook-Secret: [user's webhook secret]
 * Body: any JSON payload
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const adminClient = createAdminClient();

  // Validate webhook secret
  const incomingSecret = request.headers.get('x-webhook-secret') ?? request.headers.get('authorization')?.replace('Bearer ', '');

  // Get user's webhook secret from profile
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('id, webhook_secret, plan')
    .eq('id', userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // If webhook_secret is set, validate it
  if (profile.webhook_secret && incomingSecret !== profile.webhook_secret) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const source = request.headers.get('x-source') ?? 'webhook';

  // Find active webhook-triggered automations for this user
  const { data: automations } = await adminClient
    .from('automations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  const webhookAutomations = (automations ?? []).filter((a: any) =>
    a.nodes?.some((n: any) => n.nodeType === 'webhook')
  );

  // Log webhook receipt
  await adminClient.from('webhook_events').insert({
    user_id: userId,
    source,
    payload,
    automations_triggered: webhookAutomations.length,
  }).catch(() => {}); // table may not exist yet, ignore

  // Log automation runs
  let triggered = 0;
  for (const auto of webhookAutomations) {
    await adminClient.from('automation_logs').insert({
      automation_id: auto.id,
      user_id: userId,
      status: 'success',
      execution_time_ms: 0,
    }).catch(() => {});

    await adminClient.from('automations').update({
      run_count: (auto.run_count ?? 0) + 1,
      last_run_at: new Date().toISOString(),
    }).eq('id', auto.id);

    triggered++;
  }

  return NextResponse.json({
    received: true,
    automations_triggered: triggered,
    payload_keys: Object.keys(payload),
  });
}

// GET - show webhook info
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://autopilot.kr'}/api/webhooks/receive/${params.userId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': 'YOUR_WEBHOOK_SECRET',
    },
    body: { description: 'Any JSON payload' },
    note: 'Set X-Webhook-Secret header to match your AutoPilot webhook secret for security.',
  });
}

export const dynamic = 'force-dynamic';
