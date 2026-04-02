'use client';

import {useState} from 'react';
import type {Customer, CommsSequence, Claim, CustomerInteraction} from '@shory/db';
import {Card, CardContent, CardHeader, CardTitle, Badge, Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {RiskBar} from '@/components/shared/risk-bar';
import {Tag} from '@/components/shared/tag';

type Tab = 'overview' | 'policies' | 'comms' | 'claims' | 'history';

interface CustomerProfileProps {
  customer: Customer;
  comms: CommsSequence[];
  claims: Claim[];
  interactions: CustomerInteraction[];
}

const STAGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  renewal_negotiation: 'secondary',
  lapsed: 'destructive',
};

function formatRelativeDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
}

export function CustomerProfile({customer, comms, claims, interactions}: CustomerProfileProps) {
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
        {activeTab === 'claims' && <ClaimsTab customer={customer} claims={claims} />}
        {activeTab === 'history' && <HistoryTab interactions={interactions} />}
      </div>
    </div>
  );
}

/* ─── Overview Tab (enhanced) ───────────────────────────────────────── */

function OverviewTab({customer}: {customer: Customer}) {
  const {t} = useI18n();

  const paymentDotColor =
    customer.paymentStatus === 'on_time'
      ? 'bg-emerald-500'
      : customer.paymentStatus === 'overdue'
        ? 'bg-red-500'
        : 'bg-amber-500';

  const paymentLabel =
    customer.paymentStatus === 'on_time'
      ? t.customers.onTime
      : customer.paymentStatus === 'overdue'
        ? t.customers.overdue
        : t.customers.pending;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Active Coverage */}
      <Card className="rounded-xl shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.activeCoverage}</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.products.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {customer.products.map((product) => (
                <div
                  key={product}
                  className="cursor-default rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  {product}
                </div>
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
                  <div
                    key={product}
                    className="cursor-default rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    {product}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Snapshot */}
      <Card className="rounded-xl shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.snapshot}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2.5 text-sm">
            <SnapshotRow label={t.customers.company} value={customer.company} />
            <SnapshotRow label={t.customers.email} value={customer.email} />
            <SnapshotRow label={t.customers.emirate} value={customer.emirate} />
            <SnapshotRow label={t.customers.category} value={customer.category} />
            <SnapshotRow label={t.customers.employees} value={String(customer.employees)} />
            <SnapshotRow label={t.customers.policyRef} value={customer.policyRef ?? '-'} />
            <SnapshotRow label={t.customers.premium} value={`${t.common.aed} ${customer.premium}`} />
            <SnapshotRow label={t.customers.ltv} value={`${t.common.aed} ${customer.ltv}`} />
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">{t.customers.paymentStatus}</dt>
              <dd className="flex items-center gap-1.5 font-medium text-gray-900">
                <span className={`inline-block h-2 w-2 rounded-full ${paymentDotColor}`} />
                {paymentLabel}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* AI Risk Analysis */}
      <Card className="rounded-xl shadow-sm transition-shadow hover:shadow-md">
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

      {/* Revenue Opportunity — gradient background */}
      <Card className="relative overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent" />
        <CardHeader className="relative pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">{t.customers.revenueOpportunity}</CardTitle>
        </CardHeader>
        <CardContent className="relative">
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

/* ─── Policies Tab ──────────────────────────────────────────────────── */

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

/* ─── Comms Tab ─────────────────────────────────────────────────────── */

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

/* ─── Claims Tab (enhanced) ─────────────────────────────────────────── */

const CLAIM_STATUS_STYLE: Record<string, {variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string}> = {
  open: {variant: 'outline', className: 'border-amber-300 bg-amber-50 text-amber-700'},
  under_review: {variant: 'outline', className: 'border-blue-300 bg-blue-50 text-blue-700'},
  settled: {variant: 'outline', className: 'border-emerald-300 bg-emerald-50 text-emerald-700'},
  denied: {variant: 'outline', className: 'border-red-300 bg-red-50 text-red-700'},
};

function ClaimsTab({customer, claims}: {customer: Customer; claims: Claim[]}) {
  const {t} = useI18n();

  if (claims.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <p>{t.customers.noClaims}</p>
      </div>
    );
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'open': return t.customers.claimStatusOpen;
      case 'under_review': return t.customers.claimStatusUnderReview;
      case 'settled': return t.customers.claimStatusSettled;
      case 'denied': return t.customers.claimStatusDenied;
      default: return status;
    }
  };

  const showChurnInsight = (claim: Claim) =>
    claim.status === 'open' && customer.renewalDays !== null && customer.renewalDays <= 60 && customer.renewalDays > 0;

  return (
    <div className="space-y-4">
      {claims.map((claim) => {
        const style = CLAIM_STATUS_STYLE[claim.status] ?? CLAIM_STATUS_STYLE.open;
        return (
          <Card key={claim.id} className="rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {claim.claimRef} &middot; {claim.type}
                  </p>
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
                  {statusLabel(claim.status)}
                </span>
              </div>

              {/* Description */}
              {claim.description && (
                <p className="mt-2 text-sm text-gray-600">{claim.description}</p>
              )}

              {/* Details grid */}
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.customers.reserve}</span>
                  <span className="font-medium text-gray-700">{t.common.aed} {Number(claim.reserve).toLocaleString()}</span>
                </div>
                {claim.handlerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.customers.claimHandler}</span>
                    <span className="font-medium text-gray-700">{claim.handlerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.customers.claimFiledAt}</span>
                  <span className="font-medium text-gray-700">{formatDate(claim.filedAt)}</span>
                </div>
                {claim.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.customers.claimResolvedAt}</span>
                    <span className="font-medium text-gray-700">{formatDate(claim.resolvedAt)}</span>
                  </div>
                )}
              </div>

              {/* AI churn insight */}
              {showChurnInsight(claim) && (
                <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2">
                  <p className="text-xs font-medium text-indigo-700">
                    {t.claims.aiInsight}
                  </p>
                  <p className="mt-0.5 text-xs text-indigo-600">
                    {t.customers.aiChurnInsight}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ─── History Tab (enhanced) ────────────────────────────────────────── */

const INTERACTION_ICON: Record<string, string> = {
  outbound_email: '\u{1F4E7}',
  auto_email: '\u{1F4E7}',
  inbound_whatsapp: '\u{1F4AC}',
  outbound_whatsapp: '\u{1F4AC}',
  auto_whatsapp: '\u{1F4AC}',
  inbound_chat: '\u{1F4AC}',
  inbound_call: '\u{1F4DE}',
  note: '\u{1F4DD}',
};

function interactionTypeLabel(type: string, t: ReturnType<typeof useI18n>['t']): string {
  switch (type) {
    case 'outbound_email':
    case 'auto_email':
      return t.customers.interactionEmail;
    case 'inbound_whatsapp':
    case 'outbound_whatsapp':
    case 'auto_whatsapp':
      return t.customers.interactionWhatsApp;
    case 'inbound_chat':
      return t.customers.interactionChat;
    case 'inbound_call':
      return t.customers.interactionCall;
    case 'note':
      return t.customers.interactionNote;
    default:
      return type;
  }
}

function HistoryTab({interactions}: {interactions: CustomerInteraction[]}) {
  const {t} = useI18n();

  if (interactions.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <p>{t.customers.noHistory}</p>
      </div>
    );
  }

  const sorted = [...interactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{t.customers.interactionHistory}</h3>
      <div className="relative ms-4 border-s-2 border-gray-200">
        {sorted.map((entry) => {
          const icon = INTERACTION_ICON[entry.type] ?? '\u{1F4DD}';
          return (
            <div key={entry.id} className="relative mb-4 ms-6">
              {/* Icon circle */}
              <span
                className="absolute -start-[33px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px]"
                aria-hidden="true"
              >
                {icon}
              </span>

              <div className="rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm">
                {/* Type + date */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {interactionTypeLabel(entry.type, t)}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatRelativeDate(entry.createdAt)}
                  </span>
                </div>

                {/* Note text */}
                {entry.note && (
                  <p className="mt-1 text-sm text-gray-600">{entry.note}</p>
                )}

                {/* Agent name */}
                {entry.agentName && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    {t.customers.by} {entry.agentName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
