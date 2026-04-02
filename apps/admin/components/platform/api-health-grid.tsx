'use client';

import {useEffect, useState} from 'react';
import type {ApiService} from '@shory/db';
import {useI18n} from '@/lib/i18n';
import {StatusDot} from '@/components/shared/status-dot';
import {Sparkline} from '@/components/shared/sparkline';
import {Tag} from '@/components/shared/tag';

interface ApiHealthGridProps {
  services: ApiService[];
}

type CategoryKey = 'core' | 'ai' | 'infra' | 'insurer';

const CATEGORY_ORDER: CategoryKey[] = ['core', 'ai', 'infra', 'insurer'];

const CATEGORY_LABELS: Record<CategoryKey, keyof typeof import('@/lib/i18n/en.json')['platform']> = {
  core: 'core',
  ai: 'ai',
  infra: 'infra',
  insurer: 'insurerApis',
};

function generateSparklineValues(baseLatency: number): number[] {
  const values: number[] = [];
  for (let i = 0; i < 12; i++) {
    const jitter = baseLatency * (0.8 + Math.random() * 0.4);
    values.push(Math.round(jitter));
  }
  return values;
}

function errorRateColor(rate: number): string {
  if (rate >= 3) return 'text-red-600';
  if (rate >= 1) return 'text-amber-600';
  return 'text-green-600';
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'operational') return 'success';
  if (status === 'degraded') return 'warning';
  return 'danger';
}

export function ApiHealthGrid({services}: ApiHealthGridProps) {
  const {t} = useI18n();
  const [liveLatencies, setLiveLatencies] = useState<Record<string, number>>({});

  // Simulate live latency ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLatencies((prev) => {
        const next: Record<string, number> = {};
        for (const svc of services) {
          const base = prev[svc.id] ?? svc.latency;
          const jitter = base + (Math.random() - 0.5) * base * 0.1;
          next[svc.id] = Math.round(Math.max(1, jitter));
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [services]);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: CATEGORY_LABELS[cat],
    items: services.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.key}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            {t.platform[group.label]}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {group.items.map((service) => {
              const currentLatency = liveLatencies[service.id] ?? service.latency;
              const sparkValues = generateSparklineValues(service.latency);
              const sparkColor =
                service.status === 'down'
                  ? '#ef4444'
                  : service.status === 'degraded'
                    ? '#f59e0b'
                    : '#1D68FF';

              return (
                <div
                  key={service.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot
                        status={service.status}
                        pulse={service.status !== 'operational'}
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {service.name}
                      </span>
                    </div>
                    <Tag
                      label={t.platform[service.status]}
                      variant={statusVariant(service.status)}
                    />
                  </div>

                  {/* Metrics grid */}
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">{t.platform.latency}</span>
                      <span className="ms-1 font-mono font-semibold text-slate-700">
                        {currentLatency}{t.platform.ms}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">{t.platform.p99}</span>
                      <span className="ms-1 font-mono font-semibold text-slate-700">
                        {service.p99}{t.platform.ms}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">{t.platform.errorRate}</span>
                      <span className={`ms-1 font-mono font-semibold ${errorRateColor(parseFloat(service.errorRate))}`}>
                        {service.errorRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">{t.platform.uptime}</span>
                      <span className="ms-1 font-mono font-semibold text-slate-700">
                        {parseFloat(service.uptime)}%
                      </span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {service.requests24h.toLocaleString()} {t.platform.requests}
                    </span>
                    <Sparkline values={sparkValues} color={sparkColor} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
