'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useI18n} from '@/lib/i18n';
import {AiBadge} from '@/components/shared/ai-badge';
import {Tag} from '@/components/shared/tag';
import type {MidtermTrigger} from '@shory/db';

interface MidtermTriggersProps {
  triggers: MidtermTrigger[];
}

type TriggerStatus = MidtermTrigger['status'];

const STATUS_VARIANT: Record<TriggerStatus, 'warning' | 'danger' | 'success'> = {
  pending_send: 'warning',
  awaiting: 'danger',
  scheduled: 'success',
  sent: 'success',
};

const STATUS_LABEL_KEY: Record<TriggerStatus, string> = {
  pending_send: 'pendingSend',
  awaiting: 'awaiting',
  scheduled: 'scheduled',
  sent: 'sent',
};

export function MidtermTriggers({triggers}: MidtermTriggersProps) {
  const {t} = useI18n();
  const router = useRouter();
  const [sentTriggers, setSentTriggers] = useState<Set<string>>(new Set());

  function handleSendAdvisory(triggerId: string) {
    setSentTriggers((prev) => new Set(prev).add(triggerId));
  }

  if (triggers.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-400">
        {t.signals.noTriggers}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI explanation box */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <AiBadge label={t.signals.howThisWorks} />
        </div>
        <p className="text-sm text-indigo-700 leading-relaxed">
          {t.signals.howMidTermWorks}
        </p>
      </div>

      {/* Trigger cards */}
      <div className="space-y-4">
        {triggers.map((trigger) => {
          const isSent = sentTriggers.has(trigger.id) || trigger.status === 'sent';
          const typeKey = `trigger${trigger.type.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('')}` as keyof typeof t.signals;
          const typeLabel = (t.signals[typeKey] as string) ?? trigger.type;
          const statusKey = STATUS_LABEL_KEY[trigger.status] as keyof typeof t.signals;
          const statusLabel = (t.signals[statusKey] as string) ?? trigger.status;

          return (
            <div
              key={trigger.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Header: icon + title + status badge */}
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <span className="text-xl" aria-hidden="true">
                  {trigger.icon}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 flex-1 min-w-0">
                  {trigger.title}
                </h3>
                <Tag label={typeLabel} variant="info" />
                <Tag label={statusLabel} variant={STATUS_VARIANT[trigger.status]} />
              </div>

              {/* Trigger description */}
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {trigger.triggerDescription}
              </p>

              {/* Customer button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => router.push(`/customers?id=${trigger.customerId}`)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:border-slate-300"
                >
                  {trigger.customerId.slice(0, 8)}...
                </button>
              </div>

              {/* Revenue + timing row */}
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t.signals.revenueImpact}
                  </p>
                  <p className="text-2xl font-bold font-mono text-indigo-600">
                    {t.common.aed} {Number(trigger.revenueImpact).toLocaleString()}
                  </p>
                </div>
                {trigger.timing && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {t.signals.timing}
                    </p>
                    <p className="text-sm font-medium text-slate-700">{trigger.timing}</p>
                  </div>
                )}
              </div>

              {/* Two-column: trigger detail + draft message */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {t.signals.detail}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{trigger.detail}</p>
                  {trigger.recommendedAction && (
                    <p className="text-xs text-indigo-600 mt-2 font-medium">
                      {t.signals.recommendedAction}: {trigger.recommendedAction}
                    </p>
                  )}
                </div>
                {trigger.customerComms && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                      {t.signals.customerComms}
                    </p>
                    <p className="text-sm text-indigo-700 italic leading-relaxed">
                      &ldquo;{trigger.customerComms}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Send button -> Advisory sent */}
              <div className="flex items-center gap-2">
                {isSent ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
                    <span aria-hidden="true">&#10003;</span>
                    {t.customers.sent}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendAdvisory(trigger.id)}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    {t.signals.sendAdvisory}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
