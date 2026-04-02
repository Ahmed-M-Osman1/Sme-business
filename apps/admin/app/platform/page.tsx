import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {PlatformTabs} from './platform-tabs';

export default async function PlatformPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let services: Awaited<ReturnType<typeof adminApi.platform.services>> = [];
  let funnel: Awaited<ReturnType<typeof adminApi.platform.funnel>> = [];
  let behaviour: Awaited<ReturnType<typeof adminApi.platform.behaviour>> = [];
  let correlations: Awaited<ReturnType<typeof adminApi.platform.correlations>> = [];
  let incidents: Awaited<ReturnType<typeof adminApi.incidents.list>> = [];

  try {
    [services, funnel, behaviour, correlations, incidents] = await Promise.all([
      adminApi.platform.services(token),
      adminApi.platform.funnel(token),
      adminApi.platform.behaviour(token),
      adminApi.platform.correlations(token),
      adminApi.incidents.list(token),
    ]);
  } catch {
    // API might not be running — show empty state
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Platform Health</h2>
      <PlatformTabs
        services={services}
        funnel={funnel}
        behaviour={behaviour}
        correlations={correlations}
        incidents={incidents}
      />
    </div>
  );
}
