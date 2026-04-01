import type {
  CreateQuoteInput,
  UpdateQuoteInput,
  AcceptQuoteInput,
  AiRecommendRequest,
  Recommendation,
} from '@shory/shared';
import type { Quote, QuoteResult, Policy, Document as ShoryDocument } from '@shory/db';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

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
};
