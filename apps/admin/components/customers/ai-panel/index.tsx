'use client';

import type {Customer, ExternalSignal, MidtermTrigger} from '@shory/db';
import type {PlaybookResult, CustomerPlatformContext} from '@shory/shared';
import {Card, CardContent} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {AiPlaybookCard} from './ai-playbook-card';
import {ProactiveSignalsMini} from './proactive-signals-mini';
import {PlatformHealthMini} from './platform-health-mini';
import {InboundGuide} from './inbound-guide';
import {RiskSignals} from './risk-signals';

interface AiPanelProps {
  customer: Customer;
  playbook: PlaybookResult | null;
  signals: ExternalSignal[];
  triggers: MidtermTrigger[];
  platformContext: CustomerPlatformContext;
  loading?: boolean;
  onDispatch: (actionType: string, customerId: string) => Promise<void>;
}

function AiPanelSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({length: 4}).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

export function AiPanel({customer, playbook, signals, triggers, platformContext, loading, onDispatch}: AiPanelProps) {
  const {t} = useI18n();

  return (
    <div className="flex h-full w-[300px] min-w-[300px] flex-col border-s border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <span className="text-indigo-500" aria-hidden="true">&#10024;</span>
        <span className="text-sm font-bold text-gray-900">{t.aiPanel.shoryAi}</span>
        <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {t.aiPanel.inboundReady}
        </span>
      </div>

      {loading ? (
        <AiPanelSkeleton />
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {/* Playbook Card */}
          {playbook ? (
            <>
              <AiPlaybookCard
                playbook={playbook}
                customerId={customer.id}
                onDispatch={onDispatch}
              />
              <InboundGuide playbook={playbook} />
            </>
          ) : (
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">{t.aiPanel.noPlaybook}</p>
              </CardContent>
            </Card>
          )}

          {/* Risk Signals */}
          <RiskSignals customer={customer} />

          {/* Proactive Signals Mini */}
          <ProactiveSignalsMini
            signals={signals}
            triggers={triggers}
            customerId={customer.id}
            onDispatch={onDispatch}
          />

          {/* Platform Health Mini */}
          <PlatformHealthMini context={platformContext} />

          {/* Revenue Opp */}
          {Number(customer.revenueOpp) > 0 && (
            <Card className="rounded-xl border-blue-200 bg-blue-50 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-blue-700">{t.aiPanel.automatedRevenueOpp}</p>
                <p className="mt-1 text-lg font-bold text-blue-600">
                  {t.common.aed} {Number(customer.revenueOpp).toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-blue-500">{t.aiPanel.viaNextTouchpoint}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
