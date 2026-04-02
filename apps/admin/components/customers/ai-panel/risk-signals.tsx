'use client';

import type {Customer} from '@shory/db';
import {Card, CardContent} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {RiskBar} from '@/components/shared/risk-bar';
import {Tag} from '@/components/shared/tag';

interface RiskSignalsProps {
  customer: Customer;
}

const PAYMENT_VARIANT: Record<string, 'success' | 'danger' | 'warning'> = {
  on_time: 'success',
  overdue: 'danger',
  pending: 'warning',
};

function formatDaysAgo(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return String(diff);
}

export function RiskSignals({customer}: RiskSignalsProps) {
  const {t} = useI18n();

  const paymentLabel =
    customer.paymentStatus === 'on_time'
      ? t.customers.onTime
      : customer.paymentStatus === 'overdue'
        ? t.customers.overdue
        : t.customers.pending;

  return (
    <Card className="rounded-xl shadow-sm">
      <div className="px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">{t.aiPanel.customerRiskSignals}</span>
      </div>
      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        <div>
          <p className="mb-1 text-xs text-gray-500">{t.aiPanel.churnProbability}</p>
          <RiskBar score={customer.churnScore} size="sm" />
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-500">{t.aiPanel.healthScore}</p>
          <RiskBar score={100 - customer.healthScore} size="sm" />
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{t.aiPanel.paymentHistory}</span>
            <Tag label={paymentLabel} variant={PAYMENT_VARIANT[customer.paymentStatus] ?? 'info'} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{t.aiPanel.openClaims}</span>
            <span className="font-medium text-gray-900">{customer.claimsOpen}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{t.aiPanel.npsScore}</span>
            <span className="font-medium text-gray-900">{customer.nps ?? t.common.na}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{t.aiPanel.lastContactDays}</span>
            <span className="font-medium text-gray-900">
              {formatDaysAgo(customer.lastContact)} {t.aiPanel.daysAgo}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
