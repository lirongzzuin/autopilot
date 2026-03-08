import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AutomationsClient } from './AutomationsClient';

export default async function AutomationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: logs } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return <AutomationsClient automations={automations ?? []} logs={logs ?? []} userId={user.id} />;
}
