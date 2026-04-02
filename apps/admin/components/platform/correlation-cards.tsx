'use client';

import {useI18n} from '@/lib/i18n';
import {AiBadge} from '@/components/shared/ai-badge';
import {Tag} from '@/components/shared/tag';

interface Correlation {
  id: string;
  severity: string;
  headline: string;
  detail: string;
  action: string;
  action_label: string;
  services: string[];
  metrics: string[];
  is_active: boolean;
}

interface CorrelationCardsProps {
  correlations: Correlation[];
}

function severityVariant(severity: string): 'danger' | 'warning' | 'info' {
  if (severity === 'critical' || severity === 'high') return 'danger';
  if (severity === 'medium') return 'warning';
  return 'info';
}

export function CorrelationCards({correlations}: CorrelationCardsProps) {
  const {t} = useI18n();

  const active = correlations.filter((c) => c.is_active);

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-400">{t.platform.noCorrelations}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.map((correlation) => (
        <div
          key={correlation.id}
          className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
        >
          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Tag
              label={correlation.severity.toUpperCase()}
              variant={severityVariant(correlation.severity)}
            />
            <AiBadge label={t.platform.aiCorrelations} />
          </div>

          {/* Headline */}
          <h4 className="mt-3 text-base font-semibold text-slate-800">
            {correlation.headline}
          </h4>

          {/* Detail */}
          <p className="mt-1 text-sm text-slate-500">
            {correlation.detail}
          </p>

          {/* Recommended action */}
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              {t.platform.correlationAction}
            </p>
            <p className="mt-1 text-sm text-blue-700">
              {correlation.action}
            </p>
          </div>

          {/* Affected services and metrics */}
          <div className="mt-4 space-y-2">
            {correlation.services.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  {t.platform.correlationServices}:
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {correlation.services.map((svc) => (
                    <span
                      key={svc}
                      className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {correlation.metrics.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  {t.platform.correlationMetrics}:
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {correlation.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              {correlation.action_label || t.platform.correlationAction}
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50"
            >
              {t.platform.viewHistory}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
