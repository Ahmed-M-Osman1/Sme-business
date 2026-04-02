'use client';

import {useState, useMemo} from 'react';
import type {Customer} from '@shory/db';
import type {PlaybookResult} from '@shory/shared';
import {useI18n} from '@/lib/i18n';
import {AiBadge} from '@/components/shared/ai-badge';
import {StatusDot} from '@/components/shared/status-dot';

interface CustomerListProps {
  customers: Customer[];
  selectedId: string | null;
  onSelect: (customer: Customer) => void;
  playbooks: Record<string, PlaybookResult | null>;
  platformFlags: Record<string, boolean>;
}

const PLAYBOOK_COLORS: Record<string, string> = {
  renewal_high_confidence: 'text-green-700 bg-green-50 border-green-200',
  churn_high_risk: 'text-red-700 bg-red-50 border-red-200',
  upsell_opportunity: 'text-blue-700 bg-blue-50 border-blue-200',
  compliance_critical: 'text-amber-700 bg-amber-50 border-amber-200',
};

export function CustomerList({customers, selectedId, onSelect, playbooks, platformFlags}: CustomerListProps) {
  const {t} = useI18n();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const term = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [customers, search]);

  return (
    <div className="flex h-full w-[260px] min-w-[260px] flex-col border-e border-gray-200 bg-gray-50">
      <div className="p-3">
        <input
          type="text"
          placeholder={t.customers.searchByName}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-gray-500">
            <p>{t.customers.noCustomersFound}</p>
            <p className="mt-1 text-xs">{t.customers.adjustFilters}</p>
          </div>
        ) : (
          filtered.map((customer) => {
            const isSelected = customer.id === selectedId;
            const playbook = playbooks[customer.id];
            const hasPlatformIssue = platformFlags[customer.id] ?? false;

            return (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer)}
                className={`w-full border-s-3 px-3 py-3 text-start transition-colors hover:bg-gray-100 ${
                  isSelected
                    ? 'border-s-blue-600 bg-blue-50'
                    : 'border-s-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="truncate text-xs text-gray-500">{customer.company}</p>
                  </div>
                  <div className="ms-2 flex items-center gap-1.5">
                    {hasPlatformIssue && <StatusDot status="degraded" pulse />}
                    {customer.renewalDays !== null && customer.renewalDays <= 30 && (
                      <span className={`text-xs font-medium ${customer.renewalDays < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {Math.abs(customer.renewalDays)}{customer.renewalDays < 0 ? 'd' : 'd'}
                      </span>
                    )}
                  </div>
                </div>
                {playbook && (
                  <div className="mt-1.5">
                    <AiBadge label={playbook.badge} />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
