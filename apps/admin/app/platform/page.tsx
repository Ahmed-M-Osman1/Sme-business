import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {PlatformTabs} from './platform-tabs';
import type {ApiService, BehaviourMetric, PlatformCorrelation, Incident} from '@shory/db';
import type {FunnelStep} from '@/lib/api-client';

function unwrapData<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object' && 'data' in res) return (res as {data: T[]}).data;
  return [];
}

export default async function PlatformPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let services: ApiService[] = [];
  let funnel: FunnelStep[] = [];
  let behaviour: BehaviourMetric[] = [];
  let correlations: PlatformCorrelation[] = [];
  let incidents: Incident[] = [];

  try {
    const [sRes, fRes, bRes, cRes, iRes] = await Promise.all([
      adminApi.platform.services(token),
      adminApi.platform.funnel(token),
      adminApi.platform.behaviour(token),
      adminApi.platform.correlations(token),
      adminApi.incidents.list(token),
    ]);
    services = unwrapData<ApiService>(sRes);
    funnel = unwrapData<FunnelStep>(fRes);
    behaviour = unwrapData<BehaviourMetric>(bRes);
    correlations = unwrapData<PlatformCorrelation>(cRes);
    incidents = unwrapData<Incident>(iRes);
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
