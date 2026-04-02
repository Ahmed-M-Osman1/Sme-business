import type {
  CreateQuoteInput,
  UpdateQuoteInput,
  AcceptQuoteInput,
  AiRecommendRequest,
  Recommendation,
} from '@shory/shared';
import type { Quote, QuoteResult, Policy, Document as ShoryDocument } from '@shory/db';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error.error?.message ?? `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  quotes: {
    create: (data: CreateQuoteInput) =>
      fetchApi<Quote>('/quotes', { method: 'POST', body: JSON.stringify(data) }),

    get: (id: string) => fetchApi<Quote>(`/quotes/${id}`),

    update: (id: string, data: UpdateQuoteInput) =>
      fetchApi<Quote>(`/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    submit: (id: string) =>
      fetchApi<{ status: string; results: QuoteResult[] }>(`/quotes/${id}/submit`, {
        method: 'POST',
      }),

    results: (id: string) =>
      fetchApi<{ quote: Quote; results: QuoteResult[] }>(`/quotes/${id}/results`),

    accept: (id: string, data: AcceptQuoteInput) =>
      fetchApi<Policy>(`/quotes/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    policy: (id: string) =>
      fetchApi<{ policy: Policy; quote: Quote; result: QuoteResult }>(`/quotes/${id}/policy`),
  },

  ai: {
    recommend: (data: AiRecommendRequest) =>
      fetchApi<{ id: string; recommendations: Recommendation[] }>('/ai/recommend', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  uploads: {
    upload: async (file: File, quoteId: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quoteId', quoteId);

      const res = await fetch(`${API_URL}/api/uploads`, { method: 'POST', body: formData });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
        throw new Error(error.error?.message ?? `Upload error: ${res.status}`);
      }
      return res.json() as Promise<ShoryDocument>;
    },

    get: (id: string) => fetchApi<ShoryDocument>(`/uploads/${id}`),
  },

  catalog: {
    businessTypes: () => fetchApi<Array<{
      id: string; title: string; description: string; icon: string;
      riskLevel: string; riskFactor: number; products: string[];
    }>>('/catalog/business-types'),

    businessType: (id: string) => fetchApi<{
      id: string; title: string; description: string; icon: string;
      riskLevel: string; riskFactor: number; products: string[];
    }>(`/catalog/business-types/${id}`),

    products: () => fetchApi<Array<{
      id: string; name: string; shortName: string; icon: string; basePrice: number;
    }>>('/catalog/products'),

    insurers: () => fetchApi<Array<{
      id: string; name: string; logo: string; rating: number;
      reviewCount: number; shariahCompliant: boolean; priceMultiplier: number;
    }>>('/catalog/insurers'),

    quoteOptions: () => fetchApi<Record<string, unknown>>('/catalog/quote-options'),

    quoteOption: (id: string) => fetchApi<unknown>(`/catalog/quote-options/${id}`),
  },

  user: {
    register: (data: {email: string; password: string; name: string; phone?: string; company?: string}) =>
      fetchApi<{id: string; email: string; name: string}>('/user/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: {email: string; password: string}) =>
      fetchApi<{id: string; email: string; name: string; apiToken: string}>('/user/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    policies: {
      create: (data: {
        userId: string;
        businessName: string;
        emirate: string;
        typeId: string;
        insurerId: string;
        products: string[];
        limits: Record<string, string>;
        total: number;
        name: string;
        email: string;
        phone: string;
        licenseNumber?: string;
        employees?: string;
      }, token: string) =>
        fetchApi<{policyNumber: string; policyId: string}>('/user/policies', {
          method: 'POST',
          headers: {Authorization: `Bearer ${token}`},
          body: JSON.stringify(data),
        }),

      list: (token: string) =>
        fetchApi<Array<{
          id: string;
          policyNumber: string;
          status: string;
          startDate: string;
          endDate: string;
          products: string[];
          businessName: string;
          providerId: string;
          providerName: string;
          annualPremium: string;
        }>>('/user/policies', {
          headers: {Authorization: `Bearer ${token}`},
        }),

      get: (id: string, token: string) =>
        fetchApi<{
          id: string;
          policyNumber: string;
          status: string;
          startDate: string;
          endDate: string;
          products: string[];
          businessName: string;
          providerId: string;
          providerName: string;
          annualPremium: string;
        }>(`/user/policies/${id}`, {
          headers: {Authorization: `Bearer ${token}`},
        }),
    },

    stats: (token: string) =>
      fetchApi<{activePolicies: number; annualSpend: number; daysToRenewal: number | null}>('/user/stats', {
        headers: {Authorization: `Bearer ${token}`},
      }),

    profile: {
      get: (token: string) =>
        fetchApi<{id: string; name: string; email: string; phone: string | null}>('/user/profile', {
          headers: {Authorization: `Bearer ${token}`},
        }),

      update: (data: {name?: string; phone?: string}, token: string) =>
        fetchApi<{id: string; name: string; email: string; phone: string | null}>('/user/profile', {
          method: 'PATCH',
          headers: {Authorization: `Bearer ${token}`},
          body: JSON.stringify(data),
        }),
    },
  },
};
