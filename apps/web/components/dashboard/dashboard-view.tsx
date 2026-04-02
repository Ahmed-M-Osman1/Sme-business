'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {PolicyDetailSheet} from './policy-detail-sheet';
import {SettingsTab} from './settings-tab';
import {
  calculateMonthlyPrice,
  formatPriceWithCurrency,
} from '@/lib/pricing';
import type {EnrichedPolicy, UserStats, DashboardTab} from '@/types/dashboard';

interface DashboardViewProps {
  user: {name: string; email: string; id: string};
  policies: EnrichedPolicy[];
  stats: UserStats;
}

export function DashboardView({user, policies, stats}: DashboardViewProps) {
  const {t, locale} = useI18n();
  const [activeTab, setActiveTab] = useState<DashboardTab>('policies');
  const [selectedPolicy, setSelectedPolicy] = useState<EnrichedPolicy | null>(null);

  const activePolicies = policies.filter((p) => p.status === 'active');

  return (
    <div className="flex-1 flex flex-col gap-6 py-8 px-4 max-w-6xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t.dashboard?.welcome || 'Welcome back'}, {user.name}
          </h1>
          <p className="mt-1 text-gray-500">
            {activePolicies.length} {activePolicies.length === 1 ? 'policy' : 'policies'} active
          </p>
        </div>
        <button className="rounded-xl bg-primary text-white px-6 py-3 font-semibold hover:bg-primary/90">
          {t.dashboard?.addCover || '+ Add Cover'}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-gray-500 font-medium">
            {t.dashboard?.activePolicies || 'Active Policies'}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activePolicies}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-gray-500 font-medium">
            {t.dashboard?.annualSpend || 'Annual Spend'}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatPriceWithCurrency(stats.annualSpend, t.common.currency, locale)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-gray-500 font-medium">
            {t.dashboard?.nextRenewal || 'Next Renewal'}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.daysToRenewal !== null ? `${stats.daysToRenewal} ${t.dashboard?.days || 'days'}` : '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          {(['policies', 'claims', 'documents', 'settings'] as DashboardTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.dashboard?.[tab] ||
                tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 gap-4">
            {activePolicies.length > 0 ? (
              activePolicies.map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  className="rounded-xl border border-border bg-white p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {policy.businessName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {policy.products
                          .map((productId) => {
                            const product = (t.products as Record<string, {name: string}>)?.[productId];
                            return product?.name || productId;
                          })
                          .join(', ')}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-xs text-gray-400">
                          Ref: {policy.policyNumber}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          {policy.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatPriceWithCurrency(
                          calculateMonthlyPrice(parseInt(policy.annualPremium)),
                          t.common.currency,
                          locale
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{t.common.perMonth}</p>
                      <button className="mt-4 text-primary text-sm font-semibold hover:underline">
                        {t.dashboard?.viewPolicy || 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border bg-gray-50 p-12 text-center">
                <p className="font-semibold text-gray-900">
                  {t.dashboard?.noPolicies || 'No policies yet'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t.dashboard?.noPoliciesDesc || 'Complete a quote to see your policies here'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="rounded-xl border-2 border-dashed border-border bg-gray-50 p-12 text-center">
            <p className="font-semibold text-gray-900">Claims coming soon</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="rounded-xl border-2 border-dashed border-border bg-gray-50 p-12 text-center">
            <p className="font-semibold text-gray-900">Documents coming soon</p>
          </div>
        )}

        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Policy Detail Modal */}
      <PolicyDetailSheet policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
    </div>
  );
}
