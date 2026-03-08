import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-utils';

/**
 * 계정 삭제
 * DELETE /api/user/delete
 * 순서: automation_logs → automations → 나머지 데이터 → auth 사용자
 */
export async function DELETE(_request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const adminClient = createAdminClient();

  try {
    // 1. automation_logs는 automation_id FK가 있으므로 먼저 삭제
    const { data: userAutomations } = await adminClient
      .from('automations')
      .select('id')
      .eq('user_id', user.id);

    if (userAutomations && userAutomations.length > 0) {
      const automationIds = userAutomations.map(a => a.id);
      await adminClient.from('automation_logs').delete().in('automation_id', automationIds);
    }

    // 2. 나머지 사용자 데이터 병렬 삭제 (RLS 우회, user_id 기준)
    await Promise.all([
      adminClient.from('automations').delete().eq('user_id', user.id),
      adminClient.from('email_items').delete().eq('user_id', user.id),
      adminClient.from('email_classifications').delete().eq('user_id', user.id),
      adminClient.from('email_snippets').delete().eq('user_id', user.id),
      adminClient.from('documents').delete().eq('user_id', user.id),
      adminClient.from('alerts').delete().eq('user_id', user.id),
      adminClient.from('connected_services').delete().eq('user_id', user.id),
      adminClient.from('user_api_keys').delete().eq('user_id', user.id),
      adminClient.from('ai_usage_logs').delete().eq('user_id', user.id),
      adminClient.from('subscriptions').delete().eq('user_id', user.id),
      adminClient.from('billing_history').delete().eq('user_id', user.id),
    ]);

    // 3. 프로필 삭제
    await adminClient.from('user_profiles').delete().eq('id', user.id);

    // 4. Auth 사용자 삭제 (service role 필요)
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
    if (authError) {
      console.error('[User Delete] Auth 삭제 실패:', authError);
      // auth 삭제 실패해도 데이터는 이미 삭제됨 - 계속 진행
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[User Delete] 계정 삭제 실패:', error);
    return ApiError.internal('계정 삭제 중 오류가 발생했습니다');
  }
}

export const dynamic = 'force-dynamic';
