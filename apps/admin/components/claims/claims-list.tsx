'use client';

import type {Claim} from '@shory/db';
import {useI18n} from '@/lib/i18n';
import {Tag} from '@/components/shared/tag';

type ClaimWithCustomer = Claim & {
  customerName: string;
  customerCompany: string;
  customerChurnScore: number;
  customerRenewalDays: number;
};

interface ClaimsListProps {
  claims: ClaimWithCustomer[];
}

const STATUS_VARIANT: Record<string, 'warning' | 'danger' | 'success' | 'info'> = {
  open: 'danger',
  under_review: 'warning',
  settled: 'success',
  denied: 'info',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'OPEN',
  under_review: 'UNDER REVIEW',
  settled: 'SETTLED',
  denied: 'DENIED',
};

export function ClaimsList({claims}: ClaimsListProps) {
  const {t} = useI18n();

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="mb-2 text-3xl" aria-hidden="true">&#10003;</span>
        <p className="text-sm">{t.claims.noClaims}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div
          key={claim.id}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Claim info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold font-mono text-gray-900">
                  {claim.claimRef}
                </p>
                <Tag label={STATUS_LABEL[claim.status] ?? claim.status} variant={STATUS_VARIANT[claim.status] ?? 'info'} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t.claims.claimType}: {claim.type}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {claim.customerName} &mdash; {claim.customerCompany}
              </p>
              {claim.handlerName && (
                <p className="mt-0.5 text-xs text-gray-400">
                  Handler: {claim.handlerName}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                {claim.description}
              </p>
            </div>

            {/* Reserve + dates */}
            <div className="shrink-0 text-end">
              <p className="text-xs text-gray-400">{t.claims.reserve}</p>
              <p className="text-lg font-bold font-mono text-gray-900">
                {t.common.aed} {Number(claim.reserve).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Filed: {new Date(claim.filedAt).toLocaleDateString('en-AE')}
              </p>
              {claim.resolvedAt && (
                <p className="text-xs text-green-600">
                  Resolved: {new Date(claim.resolvedAt).toLocaleDateString('en-AE')}
                </p>
              )}
            </div>
          </div>

          {/* AI Insight - only for open/under_review claims */}
          {(claim.status === 'open' || claim.status === 'under_review') && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">
                {t.claims.aiInsight}
              </p>
              <p className="mt-1 text-xs text-red-600 leading-relaxed">
                {t.claims.churnImpactDesc} {claim.customerChurnScore}%. {claim.customerCompany}&apos;s{' '}
                {claim.customerRenewalDays > 0
                  ? `renewal in ${claim.customerRenewalDays} days`
                  : 'policy has lapsed'}
                .
              </p>
            </div>
          )}

          {/* View customer link */}
          <div className="mt-3 flex justify-end">
            <a
              href={`/customers?id=${claim.customerId}`}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {t.claims.viewCustomer} &rarr;
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
