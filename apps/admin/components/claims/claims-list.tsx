'use client';

import type {Customer} from '@shory/db';
import {useI18n} from '@/lib/i18n';
import {Tag} from '@/components/shared/tag';

interface ClaimsListProps {
  customers: Customer[];
}

function generateClaimRef(index: number): string {
  return `CLM-2024-${String(1001 + index).padStart(4, '0')}`;
}

export function ClaimsList({customers}: ClaimsListProps) {
  const {t} = useI18n();

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="mb-2 text-3xl" aria-hidden="true">&#10003;</span>
        <p className="text-sm">{t.claims.noClaims}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer, idx) => {
        const claimRef = generateClaimRef(idx);
        const reserveAmount = Math.round(Number(customer.premium) * 0.8);

        return (
          <div
            key={customer.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {/* Claim info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold font-mono text-gray-900">
                    {claimRef}
                  </p>
                  <Tag label={t.common.active.toUpperCase()} variant="warning" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t.claims.claimType}: Workers Compensation
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {customer.name} &mdash; {customer.company}
                </p>
              </div>

              {/* Reserve */}
              <div className="shrink-0 text-end">
                <p className="text-xs text-gray-400">{t.claims.reserve}</p>
                <p className="text-lg font-bold font-mono text-gray-900">
                  {t.common.aed} {reserveAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* AI Insight */}
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">
                {t.claims.aiInsight}
              </p>
              <p className="mt-1 text-xs text-red-600 leading-relaxed">
                {t.claims.churnImpactDesc} {customer.churnScore}%. {customer.company}&apos;s{' '}
                {t.renewals.pipeline.toLowerCase()}{' '}
                {customer.renewalDays > 0
                  ? `${t.customers.renewalDays}: ${customer.renewalDays} ${t.renewals.daysRemaining}`
                  : `${t.renewals.lapsed}`}
                .
              </p>
            </div>

            {/* View customer link */}
            <div className="mt-3 flex justify-end">
              <a
                href={`/customers?id=${customer.id}`}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {t.claims.viewCustomer} &rarr;
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
