import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { AutomationDetailClient } from './AutomationDetailClient';

export default async function AutomationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: automation } = await supabase
    .from('automations')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!automation) notFound();

  const { data: logs } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('automation_id', params.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return <AutomationDetailClient automation={automation} logs={logs ?? []} />;
}
