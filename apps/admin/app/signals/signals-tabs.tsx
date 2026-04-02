'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {KpiCard} from '@/components/shared/kpi-card';
import {ExternalSignals} from '@/components/signals/external-signals';
import {MidtermTriggers} from '@/components/signals/midterm-triggers';
import {PeerBenchmarks} from '@/components/signals/peer-benchmarks';
import {ScheduledComms} from '@/components/signals/scheduled-comms';
import type {ExternalSignal, MidtermTrigger, PeerBenchmark, CommsSequence} from '@shory/db';

interface SignalsTabsProps {
  signals: ExternalSignal[];
  triggers: MidtermTrigger[];
  benchmarks: PeerBenchmark[];
  scheduledComms: CommsSequence[];
}

type TabKey = 'external' | 'midterm' | 'benchmarks' | 'comms';

export function SignalsTabs({signals, triggers, benchmarks, scheduledComms}: SignalsTabsProps) {
  const {t} = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>('external');

  const tabs: Array<{key: TabKey; label: string}> = [
    {key: 'external', label: t.signals.externalSignals},
    {key: 'midterm', label: t.signals.midTermIntelligence},
    {key: 'benchmarks', label: t.signals.peerBenchmarks},
    {key: 'comms', label: t.signals.scheduledComms},
  ];

  // KPI calculations
  const activeSignalCount = signals.length;
  const pendingTriggerCount = triggers.filter(
    (tr) => tr.status === 'pending_send' || tr.status === 'awaiting'
  ).length;
  const revenuePipeline = [
    ...signals.map((s) => Number(s.revenueImpact)),
    ...triggers.map((tr) => Number(tr.revenueImpact)),
  ].reduce((sum, v) => sum + v, 0);
  const commsAwaitingCount = scheduledComms.filter((c) => !c.isSent).length;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t.signals.activeSignals}
          value={activeSignalCount}
          icon="\uD83D\uDCE1"
          color="text-teal-600"
        />
        <KpiCard
          label={t.signals.pendingTriggers}
          value={pendingTriggerCount}
          icon="\uD83D\uDD14"
          color="text-amber-600"
        />
        <KpiCard
          label={t.signals.revenuePipeline}
          value={`${t.common.aed} ${revenuePipeline.toLocaleString()}`}
          icon="\uD83D\uDCB0"
          color="text-violet-600"
        />
        <KpiCard
          label={t.signals.commsAwaitingApproval}
          value={commsAwaitingCount}
          icon="\uD83D\uDCE8"
          color="text-indigo-600"
        />
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'external' && <ExternalSignals signals={signals} />}
        {activeTab === 'midterm' && <MidtermTriggers triggers={triggers} />}
        {activeTab === 'benchmarks' && <PeerBenchmarks benchmarks={benchmarks} />}
        {activeTab === 'comms' && <ScheduledComms comms={scheduledComms} />}
      </div>
    </div>
  );
}
