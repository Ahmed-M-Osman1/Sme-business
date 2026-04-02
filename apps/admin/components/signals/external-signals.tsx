'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {AiBadge} from '@/components/shared/ai-badge';
import {Tag} from '@/components/shared/tag';
import type {ExternalSignal} from '@shory/db';

interface ExternalSignalsProps {
  signals: ExternalSignal[];
}

type SignalCategory = ExternalSignal['category'];
type SignalSeverity = ExternalSignal['severity'];

const CATEGORY_VARIANT: Record<SignalCategory, 'teal' | 'purple' | 'warning' | 'success'> = {
  weather: 'teal',
  cyber: 'purple',
  regulatory: 'warning',
  market: 'success',
};

const SEVERITY_VARIANT: Record<SignalSeverity, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

export function ExternalSignals({signals}: ExternalSignalsProps) {
  const {t} = useI18n();
  const [sentSignals, setSentSignals] = useState<Set<string>>(new Set());
  const [approvedSignals, setApprovedSignals] = useState<Set<string>>(new Set());

  function handleApprove(signalId: string) {
    setApprovedSignals((prev) => new Set(prev).add(signalId));
  }

  function handleSend(signalId: string) {
    setSentSignals((prev) => new Set(prev).add(signalId));
  }

  if (signals.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-400">
        {t.signals.noSignals}
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
          {t.signals.howExternalSignalsWork}
        </p>
      </div>

      {/* Signal cards */}
      <div className="space-y-4">
        {signals.map((signal) => {
          const isSent = sentSignals.has(signal.id);
          const isApproved = approvedSignals.has(signal.id);
          const categoryLabel = t.signals[`${signal.category}Category` as keyof typeof t.signals] as string;
          const severityLabel = t.common[signal.severity as keyof typeof t.common] as string;

          return (
            <div
              key={signal.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Header: icon + title + badges */}
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <span className="text-xl" aria-hidden="true">
                  {signal.icon}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 flex-1 min-w-0">
                  {signal.title}
                </h3>
                <Tag label={categoryLabel} variant={CATEGORY_VARIANT[signal.category]} />
                <Tag label={severityLabel} variant={SEVERITY_VARIANT[signal.severity]} />
              </div>

              {/* Source + detail */}
              <p className="text-xs text-slate-400 mb-1">
                {t.signals.source}: {signal.source}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {signal.detail}
              </p>

              {/* Revenue impact + affected count */}
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t.signals.revenueImpact}
                  </p>
                  <p className="text-2xl font-bold font-mono text-violet-600">
                    {t.common.aed} {Number(signal.revenueImpact).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t.signals.affectedCustomers}
                  </p>
                  <p className="text-2xl font-bold font-mono text-slate-900">
                    {signal.affectedCustomers.length}
                  </p>
                </div>
              </div>

              {/* Two-column: recommended product + draft message */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {signal.recommendedProduct && (
                  <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1">
                      {t.signals.recommendedProduct}
                    </p>
                    <p className="text-sm font-medium text-violet-800">
                      {signal.recommendedProduct}
                    </p>
                    {signal.recommendedEnhancement && (
                      <p className="text-xs text-violet-600 mt-1">
                        {t.signals.recommendedEnhancement}: {signal.recommendedEnhancement}
                      </p>
                    )}
                  </div>
                )}
                {signal.customerCommsAngle && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      {t.signals.draftCustomerMessage}
                    </p>
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      &ldquo;{signal.customerCommsAngle}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Affected customer buttons */}
              {signal.affectedCustomers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {signal.affectedCustomers.map((customerId) => (
                    <button
                      key={customerId}
                      type="button"
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:border-slate-300"
                    >
                      {customerId}
                    </button>
                  ))}
                </div>
              )}

              {/* Action flow: Approve -> Send -> Comms sent */}
              <div className="flex items-center gap-2">
                {isSent ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
                    <span aria-hidden="true">&#10003;</span>
                    {t.signals.commsSent}
                  </span>
                ) : isApproved ? (
                  <button
                    type="button"
                    onClick={() => handleSend(signal.id)}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    {t.signals.sendToCustomers}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApprove(signal.id)}
                    className="rounded-lg border border-primary bg-white px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-blue-50"
                  >
                    {t.signals.approveQueue}
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
