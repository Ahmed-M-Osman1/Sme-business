'use client';

import {useState, useEffect, useCallback} from 'react';
import type {Customer, CommsSequence, ExternalSignal, MidtermTrigger} from '@shory/db';
import type {PlaybookResult, CustomerPlatformContext} from '@shory/shared';
import {useI18n} from '@/lib/i18n';
import {adminApi} from '@/lib/api-client';
import {CustomerList} from './customer-list';
import {CustomerProfile} from './customer-profile';
import {AiPanel} from './ai-panel';

interface CustomersViewProps {
  customers: Customer[];
  initialSelectedId: string | null;
  token: string;
}

interface SelectedData {
  customer: Customer;
  comms: CommsSequence[];
  playbook: PlaybookResult | null;
  signals: ExternalSignal[];
  triggers: MidtermTrigger[];
  platformContext: CustomerPlatformContext;
}

export function CustomersView({customers, initialSelectedId, token}: CustomersViewProps) {
  const {t} = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [playbooks, setPlaybooks] = useState<Record<string, PlaybookResult | null>>({});
  const [platformFlags, setPlatformFlags] = useState<Record<string, boolean>>({});

  const fetchCustomerData = useCallback(async (customerId: string) => {
    setLoading(true);
    try {
      const [customer, comms, playbook, signalsData, platformContext] = await Promise.all([
        adminApi.customers.get(token, customerId),
        adminApi.customers.getComms(token, customerId).catch(() => [] as CommsSequence[]),
        adminApi.customers.getPlaybook(token, customerId).catch(() => null),
        adminApi.customers.getSignals(token, customerId).catch(() => ({externalSignals: [], midtermTriggers: []})),
        adminApi.customers.getPlatformContext(token, customerId).catch(() => ({flag: false, issue: null, detail: null, severity: null}) as CustomerPlatformContext),
      ]);

      setSelectedData({
        customer,
        comms,
        playbook,
        signals: signalsData.externalSignals,
        triggers: signalsData.midtermTriggers,
        platformContext,
      });

      setPlaybooks((prev) => ({...prev, [customerId]: playbook}));
      setPlatformFlags((prev) => ({...prev, [customerId]: platformContext.flag}));
    } catch {
      // API might not be available
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedId) {
      fetchCustomerData(selectedId);
    }
  }, [selectedId, fetchCustomerData]);

  // Load playbook summaries for the list on mount
  useEffect(() => {
    async function loadPlaybookSummaries() {
      const results: Record<string, PlaybookResult | null> = {};
      const flags: Record<string, boolean> = {};

      await Promise.all(
        customers.slice(0, 20).map(async (c) => {
          try {
            const [pb, ctx] = await Promise.all([
              adminApi.customers.getPlaybook(token, c.id).catch(() => null),
              adminApi.customers.getPlatformContext(token, c.id).catch(() => ({flag: false, issue: null, detail: null, severity: null}) as CustomerPlatformContext),
            ]);
            results[c.id] = pb;
            flags[c.id] = ctx.flag;
          } catch {
            results[c.id] = null;
            flags[c.id] = false;
          }
        })
      );

      setPlaybooks(results);
      setPlatformFlags(flags);
    }

    if (customers.length > 0) {
      loadPlaybookSummaries();
    }
  }, [customers, token]);

  function handleSelect(customer: Customer) {
    setSelectedId(customer.id);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('id', customer.id);
    window.history.pushState({}, '', url.toString());
  }

  async function handleDispatch(actionType: string, customerId: string) {
    await adminApi.actions.dispatch(token, {
      type: actionType as Parameters<typeof adminApi.actions.dispatch>[1]['type'],
      customerId,
    });
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <CustomerList
        customers={customers}
        selectedId={selectedId}
        onSelect={handleSelect}
        playbooks={playbooks}
        platformFlags={platformFlags}
      />

      {selectedData ? (
        <>
          <CustomerProfile
            customer={selectedData.customer}
            comms={selectedData.comms}
          />
          <AiPanel
            customer={selectedData.customer}
            playbook={selectedData.playbook}
            signals={selectedData.signals}
            triggers={selectedData.triggers}
            platformContext={selectedData.platformContext}
            loading={loading}
            onDispatch={handleDispatch}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">{t.customers.selectCustomer}</p>
        </div>
      )}
    </div>
  );
}
