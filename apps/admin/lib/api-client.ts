import type { PaginatedResponse, AdminStatsResponse } from '@shory/shared';
import type { Quote } from '@shory/db';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

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
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error.error?.message ?? `API error: ${res.status}`);
  }

  return res.json();
}

export const adminApi = {
  quotes: {
    list: (token: string, params?: { page?: number; pageSize?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return fetchAdmin<PaginatedResponse<Quote>>(`/admin/quotes${qs ? `?${qs}` : ''}`, token);
    },

    updateStatus: (token: string, id: string, status: string) =>
      fetchAdmin<Quote>(`/admin/quotes/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  stats: (token: string) => fetchAdmin<AdminStatsResponse>('/admin/stats', token),
};
