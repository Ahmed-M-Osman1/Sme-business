'use client';

import {useI18n} from '@/lib/i18n';
import {KpiCard} from '@/components/shared/kpi-card';
import {Tag} from '@/components/shared/tag';

interface Incident {
  id: string;
  service_name: string;
  severity: string;
  status: string;
  started_at: string;
  resolved_at: string | null;
  description: string;
  impact: string;
}

interface IncidentCardsProps {
  incidents: Incident[];
}

function severityVariant(severity: string): 'danger' | 'warning' | 'info' | 'success' {
  if (severity === 'critical') return 'danger';
  if (severity === 'high') return 'danger';
  if (severity === 'medium') return 'warning';
  return 'info';
}

function statusVariant(status: string): 'danger' | 'success' {
  return status === 'active' ? 'danger' : 'success';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateAvgResolution(incidents: Incident[]): string {
  const resolved = incidents.filter((i) => i.resolved_at);
  if (resolved.length === 0) return '--';

  const totalMs = resolved.reduce((sum, i) => {
    const start = new Date(i.started_at).getTime();
    const end = new Date(i.resolved_at!).getTime();
    return sum + (end - start);
  }, 0);

  const avgMs = totalMs / resolved.length;
  const avgHours = avgMs / (1000 * 60 * 60);

  if (avgHours < 1) {
    const minutes = Math.round(avgMs / (1000 * 60));
    return `${minutes}m`;
  }
  return `${avgHours.toFixed(1)}h`;
}

export function IncidentCards({incidents}: IncidentCardsProps) {
  const {t} = useI18n();

  const activeCount = incidents.filter((i) => i.status === 'active').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const avgResolution = calculateAvgResolution(incidents);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label={t.platform.activeIncidents}
          value={activeCount}
          color={activeCount > 0 ? 'text-red-600' : 'text-green-600'}
          icon="🔴"
        />
        <KpiCard
          label={t.platform.resolvedIncidents}
          value={resolvedCount}
          color="text-green-600"
          icon="✅"
        />
        <KpiCard
          label={t.platform.avgResolution}
          value={avgResolution}
          icon="⏱️"
        />
      </div>

      {/* Incident cards */}
      {incidents.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-400">{t.platform.noIncidents}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Header with badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Tag
                  label={incident.severity.toUpperCase()}
                  variant={severityVariant(incident.severity)}
                />
                <Tag
                  label={incident.status === 'active' ? t.platform.incidentActive : t.platform.incidentResolved}
                  variant={statusVariant(incident.status)}
                />
                <span className="ms-auto text-sm font-semibold text-slate-700">
                  {incident.service_name}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-slate-700">
                {incident.description}
              </p>

              {/* Customer impact */}
              <p className="mt-2 text-sm font-medium text-red-600">
                {t.platform.impact}: {incident.impact}
              </p>

              {/* Metadata */}
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>
                  {t.platform.startedAt}: {formatTimestamp(incident.started_at)}
                </span>
                {incident.resolved_at && (
                  <span>
                    {t.platform.resolvedAt}: {formatTimestamp(incident.resolved_at)}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              {incident.status === 'active' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    {t.platform.updateIncident}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50"
                  >
                    {t.platform.notifyTeam}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                  >
                    {t.platform.resolveIncident}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
