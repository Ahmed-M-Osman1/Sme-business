import {z} from 'zod';

export const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const INCIDENT_STATUSES = ['active', 'resolved'] as const;

export const createIncidentSchema = z.object({
  serviceName: z.string().min(1),
  severity: z.enum(INCIDENT_SEVERITIES),
  description: z.string().min(1),
  impact: z.string().min(1),
});

export const updateIncidentSchema = z.object({
  status: z.enum(INCIDENT_STATUSES).optional(),
  resolvedAt: z.string().datetime().optional(),
  description: z.string().optional(),
  impact: z.string().optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
