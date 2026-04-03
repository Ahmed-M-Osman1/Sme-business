'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Incident} from '@shory/db';
import {useI18n} from '@/lib/i18n';
import {adminApi} from '@/lib/api-client';
import {KpiCard} from '@/components/shared/kpi-card';
import {Tag} from '@/components/shared/tag';

interface IncidentCardsProps {
  incidents: Incident[];
  token?: string;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

function formatTimestamp(date: Date | string | null | undefined): string {
  const resolvedDate = toDate(date);
  if (!resolvedDate) return '--';

  return resolvedDate.toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateAvgResolution(incidents: Incident[]): string {
  const resolved = incidents.filter((i) => i.resolvedAt);
  if (resolved.length === 0) return '--';

  const durations = resolved.flatMap((incident) => {
    const start = toDate(incident.startedAt);
    const end = toDate(incident.resolvedAt);

    if (!start || !end) return [];
    return [end.getTime() - start.getTime()];
  });

  if (durations.length === 0) return '--';

  const totalMs = durations.reduce((sum, duration) => sum + duration, 0);

  const avgMs = totalMs / durations.length;
  const avgHours = avgMs / (1000 * 60 * 60);

  if (avgHours < 1) {
    const minutes = Math.round(avgMs / (1000 * 60));
    return `${minutes}m`;
  }
  return `${avgHours.toFixed(1)}h`;
}

export function IncidentCards({incidents, token = ''}: IncidentCardsProps) {
  const {t} = useI18n();
  const router = useRouter();
  const [resolving, setResolving] = useState<string | null>(null);

  async function handleResolve(id: string) {
    setResolving(id);
    try {
      await adminApi.incidents.update(token, id, {status: 'resolved', resolvedAt: new Date().toISOString()});
      router.refresh();
    } catch {
      // silently fail
    } finally {
      setResolving(null);
    }
  }

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
                  {incident.serviceName}
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
                  {t.platform.startedAt}: {formatTimestamp(incident.startedAt)}
                </span>
                {incident.resolvedAt && (
                  <span>
                    {t.platform.resolvedAt}: {formatTimestamp(incident.resolvedAt)}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              {incident.status === 'active' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/platform?tab=incidents`)}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    {t.platform.updateIncident}
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Team notified about: ' + incident.serviceName)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50"
                  >
                    {t.platform.notifyTeam}
                  </button>
                  <button
                    type="button"
                    disabled={resolving === incident.id}
                    onClick={() => handleResolve(incident.id)}
                    className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                  >
                    {resolving === incident.id ? 'Resolving...' : t.platform.resolveIncident}
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
