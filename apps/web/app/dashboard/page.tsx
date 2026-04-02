import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {api} from '@/lib/api-client';
import {DashboardView} from '@/components/dashboard/dashboard-view';
import type {EnrichedPolicy, UserStats} from '@/types/dashboard';

export const metadata = {
  title: 'My Dashboard - Shory',
  description: 'View and manage your insurance policies',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  try {
    // Fetch policies and stats in parallel
    const [policies, stats] = await Promise.all([
      api.user.policies.list(session.user.email).catch(() => []),
      api.user.stats(session.user.email).catch(() => ({
        activePolicies: 0,
        annualSpend: 0,
        daysToRenewal: null,
      })),
    ]);

    return (
      <DashboardView
        user={session.user as {name: string; email: string; id: string}}
        policies={policies as EnrichedPolicy[]}
        stats={stats as UserStats}
      />
    );
  } catch {
    // Fallback to empty state
    return (
      <DashboardView
        user={session.user as {name: string; email: string; id: string}}
        policies={[]}
        stats={{activePolicies: 0, annualSpend: 0, daysToRenewal: null}}
      />
    );
  }
}
