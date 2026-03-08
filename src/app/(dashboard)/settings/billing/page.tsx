import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './BillingClient';

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, subRes, historyRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('billing_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ]);

  return (
    <BillingClient
      profile={profileRes.data}
      subscription={subRes.data}
      billingHistory={historyRes.data ?? []}
      userId={user.id}
    />
  );
}
