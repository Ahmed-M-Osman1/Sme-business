import {z} from 'zod';

export const SERVICE_CATEGORIES = ['core', 'ai', 'infra', 'insurer'] as const;
export const SERVICE_STATUSES = ['operational', 'degraded', 'down'] as const;

export const updateServiceSchema = z.object({
  status: z.enum(SERVICE_STATUSES).optional(),
  latency: z.number().int().min(0).optional(),
  p99: z.number().int().min(0).optional(),
  errorRate: z.number().min(0).max(100).optional(),
  uptime: z.number().min(0).max(100).optional(),
  requests24h: z.number().int().min(0).optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
