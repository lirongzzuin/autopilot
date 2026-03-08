import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: connectedServices } = await supabase
    .from('connected_services')
    .select('*')
    .eq('user_id', user.id);

  return <SettingsClient profile={profile} connectedServices={connectedServices ?? []} userId={user.id} />;
}
