import type {ApiService, FunnelEvent} from '@shory/db';

export interface GeneratedCorrelation {
  severity: 'low' | 'medium' | 'high';
  headline: string;
  detail: string;
  action: string;
  actionLabel: string;
  services: string[];
  metrics: string[];
  isActive: boolean;
}

/**
 * Maps service IDs to the funnel steps they affect.
 */
const SERVICE_FUNNEL_MAP: Record<string, string[]> = {
  payment: ['Checkout', 'Payment'],
  orient: ['Insurer Comparison'],
  gig: ['Insurer Comparison'],
  rsa: ['Insurer Comparison'],
  sukoon: ['Insurer Comparison'],
  noor: ['Insurer Comparison'],
  ocr: ['Business Details'],
  quote: ['Start Quote', 'Product Selection'],
  auth: [], // special: affects all steps
};

function getAffectedSteps(serviceId: string): string[] | 'all' {
  if (serviceId === 'auth') return 'all';
  return SERVICE_FUNNEL_MAP[serviceId] ?? [];
}

function determineSeverity(
  errorRate: number,
  trendPct: number,
): 'low' | 'medium' | 'high' | null {
  if (errorRate > 3 && trendPct > 20) return 'high';
  if (errorRate > 1 && trendPct > 10) return 'medium';
  if (errorRate > 0.5 && trendPct > 5) return 'low';
  return null;
}

export function generateCorrelations(
  services: ApiService[],
  funnelEvents: FunnelEvent[],
): GeneratedCorrelation[] {
  const correlations: GeneratedCorrelation[] = [];

  const degradedServices = services.filter(
    (s) => s.status === 'degraded' || s.status === 'down',
  );

  for (const service of degradedServices) {
    const errorRate = Number(service.errorRate);
    const affectedSteps = getAffectedSteps(service.id);

    // Find funnel events that match the affected steps
    const matchingFunnelEvents = funnelEvents.filter((fe) => {
      if (affectedSteps === 'all') return true;
      return affectedSteps.some(
        (step) => fe.step.toLowerCase() === step.toLowerCase(),
      );
    });

    for (const funnelEvent of matchingFunnelEvents) {
      const trendPct = Math.abs(Number(funnelEvent.trend));
      const severity = determineSeverity(errorRate, trendPct);

      if (severity === null) continue;

      correlations.push({
        severity,
        headline: `${service.name} degradation correlated with ${funnelEvent.step} drop-off`,
        detail: `${service.name} error rate at ${errorRate.toFixed(1)}% while ${funnelEvent.step} shows ${Number(funnelEvent.dropPct).toFixed(1)}% drop-off (trend: ${Number(funnelEvent.trend) > 0 ? '+' : ''}${Number(funnelEvent.trend).toFixed(1)}%). ${funnelEvent.isAnomaly ? 'Anomaly detected.' : ''}`,
        action: `/platform?service=${service.id}`,
        actionLabel: `Investigate ${service.name}`,
        services: [service.id],
        metrics: [funnelEvent.step],
        isActive: true,
      });
    }
  }

  return correlations;
}
