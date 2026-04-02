'use client';

import type {BehaviourMetric} from '@shory/db';
import type {FunnelStep} from '@/lib/api-client';
import {useI18n} from '@/lib/i18n';
import {FunnelChart} from './funnel-chart';
import {SessionVolume} from './session-volume';

interface UserBehaviourProps {
  metrics: BehaviourMetric[];
  funnel: FunnelStep[];
}

export function UserBehaviour({metrics, funnel}: UserBehaviourProps) {
  const {t} = useI18n();

  return (
    <div className="space-y-6">
      {/* Behaviour metric cards */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t.platform.behaviourMetrics}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const trendValue = parseFloat(metric.trend);
            const trendPositive = trendValue > 0;
            const trendColor = metric.isGood
              ? 'text-green-600'
              : 'text-red-600';

            return (
              <div
                key={metric.label}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {metric.label}
                  </p>
                  <span className="text-lg opacity-60" aria-hidden="true">
                    {metric.icon}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold font-mono text-slate-900">
                  {metric.value}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className={`font-medium ${trendColor}`}>
                    {trendPositive ? '+' : ''}{trendValue}%
                  </span>
                  <span className="text-slate-400">{metric.subLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel chart */}
      <FunnelChart steps={funnel} />

      {/* Session volume */}
      <SessionVolume />
    </div>
  );
}
