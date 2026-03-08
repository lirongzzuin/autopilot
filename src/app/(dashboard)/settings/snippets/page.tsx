import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SnippetsClient } from './SnippetsClient';

export default async function SnippetsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: snippets } = await supabase
    .from('email_snippets')
    .select('*')
    .eq('user_id', user.id)
    .order('use_count', { ascending: false });

  return <SnippetsClient snippets={snippets ?? []} userId={user.id} />;
}
