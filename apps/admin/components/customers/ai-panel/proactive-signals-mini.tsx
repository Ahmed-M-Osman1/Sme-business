'use client';

import {useState} from 'react';
import type {ExternalSignal, MidtermTrigger} from '@shory/db';
import {Card, CardContent, Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {Tag} from '@/components/shared/tag';

interface ProactiveSignalsMiniProps {
  signals: ExternalSignal[];
  triggers: MidtermTrigger[];
  onDispatch: (actionType: string, customerId: string) => Promise<void>;
  customerId: string;
}

const SEVERITY_VARIANT: Record<string, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export function ProactiveSignalsMini({signals, triggers, customerId, onDispatch}: ProactiveSignalsMiniProps) {
  const {t} = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const hasContent = signals.length > 0 || triggers.length > 0;

  return (
    <Card className="rounded-xl shadow-sm">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-start"
      >
        <span className="text-sm font-semibold text-gray-700">{t.aiPanel.proactiveSignals}</span>
        <span className="text-xs text-gray-400">{collapsed ? '+' : '-'}</span>
      </button>
      {!collapsed && (
        <CardContent className="px-4 pb-4 pt-0">
          {!hasContent ? (
            <p className="text-xs text-gray-500">{t.aiPanel.noSignals}</p>
          ) : (
            <div className="space-y-3">
              {signals.map((signal) => (
                <div key={signal.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900">{signal.icon} {signal.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{signal.source}</p>
                    </div>
                    <Tag label={signal.urgency} variant={SEVERITY_VARIANT[signal.urgency] ?? 'info'} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => onDispatch('approve_signal_comms', customerId)}
                  >
                    {t.signals.sendAdvisory}
                  </Button>
                </div>
              ))}
              {triggers.map((trigger) => (
                <div key={trigger.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900">{trigger.icon} {trigger.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{trigger.triggerDescription}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => onDispatch('send_midterm_advisory', customerId)}
                  >
                    {t.signals.sendAdvisory}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
