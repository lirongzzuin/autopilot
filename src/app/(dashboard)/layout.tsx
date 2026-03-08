import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContextProvider } from '@/components/ui/toast';
import { DashboardClientLayout } from './DashboardClientLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <ToastContextProvider>
      <DashboardClientLayout
        userId={user.id}
        userPlan={profile?.plan ?? 'free'}
        userName={profile?.full_name ?? user.email?.split('@')[0] ?? '사용자'}
        userEmail={user.email ?? ''}
        userCredits={profile?.ai_credits_remaining ?? 1000}
        totalCredits={profile?.ai_credits_total ?? 1000}
      >
        {children}
      </DashboardClientLayout>
    </ToastContextProvider>
  );
}
