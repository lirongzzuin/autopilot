import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InboxClient } from './InboxClient';

export default async function InboxPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: emails },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('email_items')
      .select('*')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(50),
    supabase
      .from('user_profiles')
      .select('focus_mode')
      .eq('id', user.id)
      .single(),
  ]);

  return (
    <InboxClient
      emails={emails ?? []}
      userId={user.id}
      focusMode={profile?.focus_mode ?? false}
    />
  );
}
