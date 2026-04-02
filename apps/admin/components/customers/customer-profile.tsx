'use client';

import {useState} from 'react';
import type {Customer, CommsSequence} from '@shory/db';
import {Card, CardContent, CardHeader, CardTitle, Badge, Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {RiskBar} from '@/components/shared/risk-bar';
import {Tag} from '@/components/shared/tag';
import {StatusDot} from '@/components/shared/status-dot';

type Tab = 'overview' | 'policies' | 'comms' | 'claims' | 'history';

interface CustomerProfileProps {
  customer: Customer;
  comms: CommsSequence[];
}

const STAGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  renewal_negotiation: 'secondary',
  lapsed: 'destructive',
};

function formatDaysAgo(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return `${diff}`;
}

export function CustomerProfile({customer, comms}: CustomerProfileProps) {
  const {t} = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: {key: Tab; label: string}[] = [
    {key: 'overview', label: t.customers.overview},
    {key: 'policies', label: t.customers.policies},
    {key: 'comms', label: t.customers.comms},
    {key: 'claims', label: t.customers.claimsTab},
    {key: 'history', label: t.customers.history},
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              <Badge variant={STAGE_VARIANT[customer.stage] ?? 'outline'}>
                {customer.stage === 'active'
                  ? t.customers.active
                  : customer.stage === 'renewal_negotiation'
                    ? t.customers.renewalNegotiation
                    : t.customers.lapsed}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {customer.company} &middot; {customer.category} &middot; {customer.emirate}
            </p>
            {customer.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <Tag key={tag} label={tag} variant="info" />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              {t.actions.sendEmail}
            </Button>
            <Button variant="outline" size="sm">
              {t.actions.sendWhatsApp}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-white px-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && <OverviewTab customer={customer} />}
        {activeTab === 'policies' && <PoliciesTab customer={customer} />}
        {activeTab === 'comms' && <CommsTab comms={comms} />}
        {activeTab === 'claims' && <ClaimsTab customer={customer} />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}

function OverviewTab({customer}: {customer: Customer}) {
  const {t} = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Active Coverage */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.activeCoverage}</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.products.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {customer.products.map((product) => (
                <Tag key={product} label={product} variant="success" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t.customers.noActivePolicies}</p>
          )}
          {customer.missingProducts.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-gray-500">{t.customers.coverageGaps}</p>
              <div className="flex flex-wrap gap-1.5">
                {customer.missingProducts.map((product) => (
                  <Tag key={product} label={product} variant="warning" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Snapshot */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.snapshot}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <SnapshotRow label={t.customers.company} value={customer.company} />
            <SnapshotRow label={t.customers.email} value={customer.email} />
            <SnapshotRow label={t.customers.emirate} value={customer.emirate} />
            <SnapshotRow label={t.customers.category} value={customer.category} />
            <SnapshotRow label={t.customers.employees} value={String(customer.employees)} />
            <SnapshotRow label={t.customers.policyRef} value={customer.policyRef ?? '-'} />
            <SnapshotRow label={t.customers.premium} value={`${t.common.aed} ${customer.premium}`} />
            <SnapshotRow label={t.customers.ltv} value={`${t.common.aed} ${customer.ltv}`} />
          </dl>
        </CardContent>
      </Card>

      {/* AI Risk Analysis */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.aiRiskAnalysis}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-1 text-xs text-gray-500">{t.aiPanel.churnProbability}</p>
            <RiskBar score={customer.churnScore} />
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500">{t.aiPanel.healthScore}</p>
            <RiskBar score={100 - customer.healthScore} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t.aiPanel.npsScore}</span>
            <span className="font-medium text-gray-900">{customer.nps ?? t.common.na}</span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Opportunity */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.revenueOpportunity}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">
            {t.common.aed} {Number(customer.revenueOpp).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t.aiPanel.viaNextTouchpoint}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SnapshotRow({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function PoliciesTab({customer}: {customer: Customer}) {
  const {t} = useI18n();

  if (customer.products.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <p>{t.customers.noPolicies}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {customer.products.map((product) => (
        <Card key={product} className="rounded-xl shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{product}</p>
              <p className="text-xs text-gray-500">
                {t.customers.policyRef}: {customer.policyRef ?? '-'} &middot; {t.customers.insurer}: {customer.insurerId ?? '-'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">{t.customers.viewPolicy}</Button>
              <Button variant="outline" size="sm">{t.customers.endorsePolicy}</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CommsTab({comms}: {comms: CommsSequence[]}) {
  const {t} = useI18n();

  if (comms.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <p>{t.customers.noCommsConfigured}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{t.customers.commsSequence}</h3>
      <div className="relative ms-4 border-s-2 border-gray-200">
        {comms
          .sort((a, b) => a.dayOffset - b.dayOffset)
          .map((entry) => (
            <div key={entry.id} className="relative mb-4 ms-6">
              <span
                className={`absolute -start-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                  entry.isSent ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{entry.label}</p>
                  <Badge variant={entry.isSent ? 'default' : 'secondary'}>
                    {entry.isSent ? t.customers.sent : t.customers.scheduled}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t.customers.sequenceDay} {entry.dayOffset} &middot; {entry.channel === 'email' ? t.customers.autoEmail : t.customers.whatsapp}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function ClaimsTab({customer}: {customer: Customer}) {
  const {t} = useI18n();

  if (customer.claimsOpen === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <p>{t.customers.noClaims}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({length: customer.claimsOpen}).map((_, i) => (
        <Card key={i} className="rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t.customers.claimRef}: CLM-{String(i + 1).padStart(4, '0')}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t.customers.reserve}: {t.common.aed} -
                </p>
              </div>
              <Badge variant="secondary">{t.common.active}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HistoryTab() {
  const {t} = useI18n();

  return (
    <div className="py-12 text-center text-sm text-gray-500">
      <p>{t.customers.noHistory}</p>
    </div>
  );
}
