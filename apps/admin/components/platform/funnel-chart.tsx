'use client';

import {useI18n} from '@/lib/i18n';
import {Tag} from '@/components/shared/tag';

interface FunnelStep {
  id: string;
  step: string;
  sessions: number;
  drop_pct: number;
  trend: number;
  is_anomaly: boolean;
}

interface FunnelChartProps {
  steps: FunnelStep[];
}

export function FunnelChart({steps}: FunnelChartProps) {
  const {t} = useI18n();

  if (steps.length === 0) {
    return <p className="text-sm text-slate-400">{t.common.noData}</p>;
  }

  const maxSessions = steps[0]?.sessions ?? 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">
        {t.platform.funnelTitle}
      </h3>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const barWidth = Math.max(4, (step.sessions / maxSessions) * 100);
          const trendPositive = step.trend > 0;
          const trendColor = step.is_anomaly
            ? 'text-red-600'
            : trendPositive
              ? 'text-red-500'
              : 'text-green-600';

          return (
            <div key={step.id} className="group">
              <div className="flex items-center gap-3">
                {/* Step number */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.is_anomaly
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </span>

                {/* Step name + badges */}
                <div className="flex min-w-35 items-center gap-2 sm:min-w-45">
                  <span
                    className={`text-sm font-medium ${
                      step.is_anomaly ? 'text-red-700' : 'text-slate-700'
                    }`}
                  >
                    {step.step}
                  </span>
                  {step.is_anomaly && (
                    <Tag label={t.platform.spike} variant="danger" />
                  )}
                </div>

                {/* Bar */}
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <div className="h-5 rounded-md bg-slate-50 overflow-hidden">
                      <div
                        className={`h-5 rounded-md transition-all duration-300 ${
                          step.is_anomaly ? 'bg-red-400' : 'bg-primary'
                        }`}
                        style={{width: `${barWidth}%`}}
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="hidden shrink-0 items-center gap-3 text-xs sm:flex">
                  <span className="w-16 text-end font-mono font-semibold text-slate-700">
                    {step.sessions.toLocaleString()}
                  </span>
                  {step.drop_pct > 0 && (
                    <span className="w-14 text-end font-mono text-slate-400">
                      -{step.drop_pct}%
                    </span>
                  )}
                  <span className={`w-14 text-end font-mono font-medium ${trendColor}`}>
                    {trendPositive ? '+' : ''}{step.trend}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-3 text-xs text-slate-400">
        <span>{t.platform.funnelSessions}</span>
        <span>{t.platform.funnelDropOff}</span>
        <span>{t.platform.funnelTrend} ({t.platform.vsYesterday})</span>
      </div>
    </div>
  );
}
