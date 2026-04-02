'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {PlatformOverview} from '@/components/platform/platform-overview';
import {ApiHealthGrid} from '@/components/platform/api-health-grid';
import {UserBehaviour} from '@/components/platform/user-behaviour';
import {CorrelationCards} from '@/components/platform/correlation-cards';
import {IncidentCards} from '@/components/platform/incident-cards';

interface Service {
  id: string;
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  latency: number;
  p99: number;
  error_rate: number;
  requests_24h: number;
}

interface FunnelStep {
  id: string;
  step: string;
  sessions: number;
  drop_pct: number;
  trend: number;
  is_anomaly: boolean;
}

interface BehaviourMetric {
  label: string;
  value: string;
  trend: number;
  is_good: boolean;
  icon: string;
  sub_label: string;
}

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

interface PlatformTabsProps {
  services: Service[];
  funnel: FunnelStep[];
  behaviour: BehaviourMetric[];
  correlations: Correlation[];
  incidents: Incident[];
}

type TabKey = 'overview' | 'apiHealth' | 'userBehaviour' | 'aiCorrelations' | 'incidents';

const TAB_KEYS: TabKey[] = ['overview', 'apiHealth', 'userBehaviour', 'aiCorrelations', 'incidents'];

export function PlatformTabs({
  services,
  funnel,
  behaviour,
  correlations,
  incidents,
}: PlatformTabsProps) {
  const {t} = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabLabels: Record<TabKey, string> = {
    overview: t.platform.overview,
    apiHealth: t.platform.apiHealth,
    userBehaviour: t.platform.userBehaviour,
    aiCorrelations: t.platform.aiCorrelations,
    incidents: t.platform.incidents,
  };

  return (
    <div>
      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
        {TAB_KEYS.map((key) => {
          const isActive = activeTab === key;
          const hasAlert =
            key === 'incidents' &&
            incidents.some((i) => i.status === 'active');

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tabLabels[key]}
              {hasAlert && (
                <span className="absolute -top-0.5 -end-0.5 flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <PlatformOverview
          services={services}
          incidents={incidents}
          correlations={correlations}
          behaviour={behaviour}
        />
      )}
      {activeTab === 'apiHealth' && (
        <ApiHealthGrid services={services} />
      )}
      {activeTab === 'userBehaviour' && (
        <UserBehaviour metrics={behaviour} funnel={funnel} />
      )}
      {activeTab === 'aiCorrelations' && (
        <CorrelationCards correlations={correlations} />
      )}
      {activeTab === 'incidents' && (
        <IncidentCards incidents={incidents} />
      )}
    </div>
  );
}
