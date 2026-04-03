import type {PaginatedResponse, AdminStatsResponse} from '@shory/shared';
import type {CreateCustomerInput, UpdateCustomerInput} from '@shory/shared';
import type {CreateIncidentInput, UpdateIncidentInput} from '@shory/shared';
import type {DispatchActionInput} from '@shory/shared';
import type {UpdateServiceInput} from '@shory/shared';
import type {CreateSignalInput, UpdateSignalInput, UpdateTriggerInput} from '@shory/shared';
import type {CustomerPlatformContext, PlaybookResult} from '@shory/shared';
import type {Customer, Incident, PortfolioAlert, Action, CommsSequence, ApiService, ServiceHealthLog, Claim, CustomerInteraction} from '@shory/db';
import type {ExternalSignal, MidtermTrigger, PeerBenchmark, BehaviourMetric, PlatformCorrelation} from '@shory/db';
import {getAdminApiBaseUrl} from './api-base-url';

const API_URL = getAdminApiBaseUrl();

async function fetchAdmin<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({error: {message: res.statusText}}));
    throw new Error(error.error?.message ?? `API error: ${res.status}`);
  }

  return res.json();
}

export interface FunnelStep {
  id: string;
  step: string;
  sessions: number;
  dropPct: string;
  trend: string;
  isAnomaly: boolean;
  recordedAt: string;
}

export interface CustomerSignals {
  signals: ExternalSignal[];
  triggers: MidtermTrigger[];
}

export const adminApi = {
  quotes: {
    list: (token: string, params?: {page?: number; pageSize?: number; status?: string}) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return fetchAdmin<PaginatedResponse<import('@shory/db').Quote>>(`/admin/quotes${qs ? `?${qs}` : ''}`, token);
    },

    updateStatus: (token: string, id: string, status: string) =>
      fetchAdmin<import('@shory/db').Quote>(`/admin/quotes/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({status}),
      }),
  },

  stats: (token: string) => fetchAdmin<AdminStatsResponse>('/admin/stats', token),

  claims: {
    list: (token: string, params?: {status?: string}) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return fetchAdmin<{data: Array<Claim & {customerName: string; customerCompany: string; customerChurnScore: number; customerRenewalDays: number}>}>(`/admin/claims${qs ? `?${qs}` : ''}`, token);
    },
  },

  customers: {
    list: (token: string, params?: {page?: number; pageSize?: number; stage?: string; search?: string}) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.stage) searchParams.set('stage', params.stage);
      if (params?.search) searchParams.set('search', params.search);
      const qs = searchParams.toString();
      return fetchAdmin<PaginatedResponse<Customer>>(`/admin/customers${qs ? `?${qs}` : ''}`, token);
    },

    get: (token: string, id: string) =>
      fetchAdmin<Customer>(`/admin/customers/${id}`, token),

    create: (token: string, data: CreateCustomerInput) =>
      fetchAdmin<Customer>('/admin/customers', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (token: string, id: string, data: UpdateCustomerInput) =>
      fetchAdmin<Customer>(`/admin/customers/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    getComms: (token: string, id: string) =>
      fetchAdmin<CommsSequence[]>(`/admin/customers/${id}/comms`, token),

    getSignals: (token: string, id: string) =>
      fetchAdmin<CustomerSignals>(`/admin/customers/${id}/signals`, token),

    getPlatformContext: (token: string, id: string) =>
      fetchAdmin<CustomerPlatformContext>(`/admin/customers/${id}/platform-context`, token),

    getPlaybook: (token: string, id: string) =>
      fetchAdmin<PlaybookResult | null>(`/admin/customers/${id}/playbook`, token),

    getInteractions: (token: string, id: string) =>
      fetchAdmin<CustomerInteraction[]>(`/admin/customers/${id}/interactions`, token),

    getClaims: (token: string, id: string) =>
      fetchAdmin<Claim[]>(`/admin/customers/${id}/claims`, token),
  },

  incidents: {
    list: (token: string, params?: {status?: string; severity?: string}) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.severity) searchParams.set('severity', params.severity);
      const qs = searchParams.toString();
      return fetchAdmin<Incident[]>(`/admin/incidents${qs ? `?${qs}` : ''}`, token);
    },

    create: (token: string, data: CreateIncidentInput) =>
      fetchAdmin<Incident>('/admin/incidents', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (token: string, id: string, data: UpdateIncidentInput) =>
      fetchAdmin<Incident>(`/admin/incidents/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  alerts: {
    list: (token: string) =>
      fetchAdmin<PortfolioAlert[]>('/admin/alerts', token),

    markRead: (token: string, id: string) =>
      fetchAdmin<PortfolioAlert>(`/admin/alerts/${id}/read`, token, {
        method: 'PATCH',
      }),
  },

  actions: {
    dispatch: (token: string, data: DispatchActionInput) =>
      fetchAdmin<Action>('/admin/actions', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    list: (token: string) =>
      fetchAdmin<Action[]>('/admin/actions', token),
  },

  platform: {
    services: (token: string) =>
      fetchAdmin<ApiService[]>('/admin/platform/services', token),

    updateService: (token: string, id: string, data: UpdateServiceInput) =>
      fetchAdmin<ApiService>(`/admin/platform/services/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    serviceHistory: (token: string, id: string) =>
      fetchAdmin<ServiceHealthLog[]>(`/admin/platform/services/${id}/history`, token),

    funnel: (token: string) =>
      fetchAdmin<FunnelStep[]>('/admin/platform/funnel', token),

    behaviour: (token: string) =>
      fetchAdmin<BehaviourMetric[]>('/admin/platform/behaviour', token),

    correlations: (token: string) =>
      fetchAdmin<PlatformCorrelation[]>('/admin/platform/correlations', token),
  },

  intelligence: {
    signals: (token: string) =>
      fetchAdmin<ExternalSignal[]>('/admin/intelligence/signals', token),

    createSignal: (token: string, data: CreateSignalInput) =>
      fetchAdmin<ExternalSignal>('/admin/intelligence/signals', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateSignal: (token: string, id: string, data: UpdateSignalInput) =>
      fetchAdmin<ExternalSignal>(`/admin/intelligence/signals/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    midterm: (token: string) =>
      fetchAdmin<MidtermTrigger[]>('/admin/intelligence/midterm', token),

    updateTrigger: (token: string, id: string, data: UpdateTriggerInput) =>
      fetchAdmin<MidtermTrigger>(`/admin/intelligence/midterm/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    benchmarks: (token: string) =>
      fetchAdmin<PeerBenchmark[]>('/admin/intelligence/benchmarks', token),

    scheduledComms: (token: string) =>
      fetchAdmin<CommsSequence[]>('/admin/intelligence/scheduled-comms', token),
  },
};
