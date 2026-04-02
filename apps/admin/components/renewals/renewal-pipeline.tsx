'use client';

import {useState} from 'react';
import type {Customer} from '@shory/db';
import type {PlaybookResult} from '@shory/shared';
import {useI18n} from '@/lib/i18n';
import {adminApi} from '@/lib/api-client';
import {RiskBar} from '@/components/shared/risk-bar';
import {AiBadge} from '@/components/shared/ai-badge';

interface RenewalCustomer {
  customer: Customer;
  playbook: PlaybookResult;
}

interface RenewalPipelineProps {
  items: RenewalCustomer[];
  token: string;
}

const ACTION_LABEL_MAP: Record<string, string> = {
  send_renewal_reminder: 'sendRenewalOffer',
  schedule_call: 'scheduleCall',
  prepare_upsell_proposal: 'sendCoverageRec',
  send_retention_email: 'sendRetentionEmail',
  apply_discount: 'applyDiscount',
  schedule_urgent_call: 'scheduleCall',
  escalate_to_manager: 'escalateRetention',
  send_email: 'sendEmail',
  send_whatsapp: 'sendWhatsApp',
  send_compliance_notice: 'sendComplianceNotice',
  send_reinstatement_link: 'sendReQuoteLink',
};

const DISPATCH_TYPE_MAP: Record<string, string> = {
  send_renewal_reminder: 'send_email',
  schedule_call: 'send_email',
  prepare_upsell_proposal: 'send_email',
  send_retention_email: 'send_retention_email',
  apply_discount: 'apply_discount',
  schedule_urgent_call: 'send_email',
  escalate_to_manager: 'escalate',
  send_email: 'send_email',
  send_whatsapp: 'send_whatsapp',
  send_compliance_notice: 'send_compliance_notice',
  send_reinstatement_link: 'send_email',
};

function getPlaybookBg(type: string): string {
  switch (type) {
    case 'renewal_high_confidence':
      return 'bg-green-50 border-green-200';
    case 'churn_high_risk':
      return 'bg-red-50 border-red-200';
    case 'upsell_opportunity':
      return 'bg-amber-50 border-amber-200';
    case 'compliance_critical':
      return 'bg-gray-100 border-gray-300';
    default:
      return 'bg-slate-50 border-slate-200';
  }
}

function getDaysColor(days: number): string {
  if (days <= 0) return 'text-red-600';
  if (days <= 14) return 'text-amber-600';
  return 'text-gray-500';
}

export function RenewalPipeline({items, token}: RenewalPipelineProps) {
  const {t} = useI18n();
  const [dispatching, setDispatching] = useState<string | null>(null);

  async function handleAction(customerId: string, actionType: string) {
    const dispatchType = DISPATCH_TYPE_MAP[actionType] ?? 'send_email';
    setDispatching(`${customerId}-${actionType}`);
    try {
      await adminApi.actions.dispatch(token, {
        type: dispatchType as Parameters<typeof adminApi.actions.dispatch>[1]['type'],
        customerId,
      });
    } catch {
      // Action failed — silently handle
    } finally {
      setDispatching(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">{t.renewals.noRenewals}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(({customer, playbook}) => {
        const days = customer.renewalDays;
        const daysColor = getDaysColor(days);
        const playbookBg = getPlaybookBg(playbook.type);
        const visibleActions = playbook.actions.slice(0, 2);

        return (
          <div
            key={customer.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Customer info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {customer.company}
                </p>
                <p className="text-xs text-gray-500 truncate">{customer.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>
                    {t.customers.insurer}: {customer.insurerId ?? t.common.na}
                  </span>
                  <span>
                    {t.customers.premium}: {t.common.aed}{' '}
                    {Number(customer.premium).toLocaleString()}
                  </span>
                </div>
                {customer.autoCommsStatus && (
                  <div className="mt-2">
                    <AiBadge label={customer.autoCommsStatus} />
                  </div>
                )}
              </div>

              {/* Right: Days to expiry */}
              <div className="flex flex-col items-end shrink-0">
                <span className={`text-3xl font-bold font-mono ${daysColor}`}>
                  {days <= 0 ? t.renewals.lapsed : days}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                  {t.renewals.daysToExpiry}
                </span>
              </div>
            </div>

            {/* Playbook card */}
            <div className={`mt-3 rounded-lg border p-3 ${playbookBg}`}>
              <span className="text-xs font-semibold">{playbook.badge}</span>
              <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                {playbook.body}
              </p>
            </div>

            {/* Churn risk */}
            <div className="mt-3">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">
                {t.renewals.churnRisk}
              </p>
              <RiskBar score={customer.churnScore} size="sm" />
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {visibleActions.map((action) => {
                const labelKey = ACTION_LABEL_MAP[action] ?? 'sendEmail';
                const isDispatching = dispatching === `${customer.id}-${action}`;
                return (
                  <button
                    key={action}
                    type="button"
                    disabled={isDispatching}
                    onClick={() => handleAction(customer.id, action)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isDispatching
                      ? t.actions.dispatching
                      : t.actions[labelKey as keyof typeof t.actions] ?? action}
                  </button>
                );
              })}
              <a
                href={`/customers?id=${customer.id}`}
                className="ms-auto text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {t.renewals.fullProfile} &rarr;
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
