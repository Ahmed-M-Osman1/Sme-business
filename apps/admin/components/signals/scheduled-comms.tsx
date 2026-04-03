'use client';

import {useI18n} from '@/lib/i18n';
import {Tag} from '@/components/shared/tag';
import type {CommsSequence} from '@shory/db';

interface ScheduledCommsProps {
  comms: CommsSequence[];
}

const CHANNEL_ICON: Record<string, string> = {
  email: '✉️',
  whatsapp: '💬',
};

export function ScheduledComms({comms}: ScheduledCommsProps) {
  const {t} = useI18n();

  if (comms.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-400">
        {t.signals.noScheduledComms}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI explanation box */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 mb-4">
        <p className="text-sm text-indigo-700 leading-relaxed">
          {t.signals.howScheduledCommsWork}
        </p>
      </div>

      {/* Comms list */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Header row (hidden on mobile, shown on md+) */}
        <div className="hidden md:grid md:grid-cols-[2rem_1fr_6rem_5rem_7rem_7rem] gap-3 px-5 py-3 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span />
          <span>{t.signals.draftCustomerMessage}</span>
          <span>{t.signals.commsCustomer}</span>
          <span>{t.signals.commsChannel}</span>
          <span>{t.signals.commsType}</span>
          <span>{t.signals.commsStatus}</span>
        </div>

        {comms.map((comm, idx) => {
          const isLast = idx === comms.length - 1;
          const statusLabel = comm.isSent ? t.signals.commsSent : t.common.pending;
          const statusVariant = comm.isSent ? 'success' : 'warning';
          const icon = CHANNEL_ICON[comm.channel] ?? '📨';

          return (
            <div
              key={comm.id}
              className={`flex flex-col md:grid md:grid-cols-[2rem_1fr_6rem_5rem_7rem_7rem] gap-2 md:gap-3 px-5 py-3.5 items-start md:items-center ${
                !isLast ? 'border-b border-gray-50' : ''
              } transition-colors hover:bg-slate-50/50`}
            >
              {/* Icon */}
              <span className="text-lg" aria-hidden="true">
                {icon}
              </span>

              {/* Label */}
              <p className="text-sm font-medium text-slate-800 truncate">{comm.label}</p>

              {/* Customer */}
              <p className="text-xs text-slate-500 truncate">{comm.customerId.slice(0, 8)}</p>

              {/* Channel */}
              <Tag
                label={comm.channel === 'email' ? 'Email' : 'WhatsApp'}
                variant={comm.channel === 'email' ? 'info' : 'success'}
              />

              {/* Type */}
              <Tag
                label={comm.type === 'renewal' ? t.customers.renewalNegotiation : t.customers.lapsed}
                variant={comm.type === 'renewal' ? 'purple' : 'warning'}
              />

              {/* Status badge */}
              <Tag label={statusLabel} variant={statusVariant} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
