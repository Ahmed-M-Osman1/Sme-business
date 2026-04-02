'use client';

import type {ApiService, BehaviourMetric, Incident, PlatformCorrelation} from '@shory/db';
import {useI18n} from '@/lib/i18n';
import {KpiCard} from '@/components/shared/kpi-card';
import {AiBadge} from '@/components/shared/ai-badge';
import {Tag} from '@/components/shared/tag';

interface PlatformOverviewProps {
  services: ApiService[];
  incidents: Incident[];
  correlations: PlatformCorrelation[];
  behaviour: BehaviourMetric[];
}

function severityVariant(severity: string): 'danger' | 'warning' | 'info' | 'success' {
  if (severity === 'critical' || severity === 'high') return 'danger';
  if (severity === 'medium') return 'warning';
  return 'info';
}

export function PlatformOverview({services, incidents, correlations, behaviour}: PlatformOverviewProps) {
  const {t} = useI18n();

  const activeIncidents = incidents.filter((i) => i.status === 'active');
  const degradedApis = services.filter((s) => s.status === 'degraded' || s.status === 'down');
  const anomalyMetrics = behaviour.filter((b) => !b.isGood);
  const activeSessions = behaviour.find((b) => b.label === 'Active Sessions');

  return (
    <div className="space-y-6">
      {/* Active incident banner */}
      {activeIncidents.length > 0 && (
        <div className="rounded-xl bg-red-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            <div>
              <p className="font-semibold">
                {activeIncidents.length} {t.platform.activeIncidents}
              </p>
              <p className="mt-0.5 text-sm text-red-100">
                {activeIncidents.map((i) => i.serviceName).join(', ')} &mdash;{' '}
                {activeIncidents[0]?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.platform.servicesMonitored}
          value={services.length}
          icon="🖥️"
        />
        <KpiCard
          label={t.platform.degraded}
          value={degradedApis.length}
          color={degradedApis.length > 0 ? 'text-amber-600' : 'text-green-600'}
          icon="⚠️"
        />
        <KpiCard
          label={t.platform.behaviourMetrics}
          value={`${anomalyMetrics.length} ${t.platform.anomaly}`}
          color={anomalyMetrics.length > 0 ? 'text-red-600' : 'text-green-600'}
          icon="📊"
        />
        <KpiCard
          label={t.platform.activeSessions}
          value={activeSessions?.value ?? '0'}
          sub={activeSessions?.subLabel}
          icon="👥"
        />
      </div>

      {/* AI Correlations summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t.platform.correlationTitle}
        </h3>
        {correlations.length === 0 ? (
          <p className="text-sm text-slate-400">{t.platform.noCorrelations}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {correlations.filter((c) => c.isActive).map((correlation) => (
              <div
                key={correlation.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <Tag
                    label={correlation.severity.toUpperCase()}
                    variant={severityVariant(correlation.severity)}
                  />
                  <AiBadge label={t.platform.aiCorrelations} />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {correlation.headline}
                </p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {correlation.detail}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {correlation.services.map((svc) => (
                    <span
                      key={svc}
                      className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {correlation.actionLabel || t.platform.correlationAction}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
