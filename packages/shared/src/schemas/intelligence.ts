import {z} from 'zod';

export const SIGNAL_CATEGORIES = ['weather', 'cyber', 'regulatory', 'market'] as const;
export const SIGNAL_SEVERITIES = ['low', 'medium', 'high'] as const;
export const TRIGGER_STATUSES = ['pending_send', 'awaiting', 'scheduled', 'sent'] as const;

export const createSignalSchema = z.object({
  id: z.string().min(1),
  category: z.enum(SIGNAL_CATEGORIES),
  severity: z.enum(SIGNAL_SEVERITIES),
  icon: z.string(),
  title: z.string().min(1),
  source: z.string().min(1),
  detail: z.string().min(1),
  affectedCategories: z.array(z.string()),
  recommendedProduct: z.string().optional(),
  recommendedEnhancement: z.string().optional(),
  customerCommsAngle: z.string().optional(),
  affectedCustomers: z.array(z.string()),
  commsReadiness: z.string().optional(),
  revenueImpact: z.number().min(0),
  urgency: z.enum(SIGNAL_SEVERITIES),
});

export const updateSignalSchema = z.object({
  commsReadiness: z.string().optional(),
  affectedCustomers: z.array(z.string()).optional(),
});

export const updateTriggerSchema = z.object({
  status: z.enum(TRIGGER_STATUSES),
});

export type CreateSignalInput = z.infer<typeof createSignalSchema>;
export type UpdateSignalInput = z.infer<typeof updateSignalSchema>;
export type UpdateTriggerInput = z.infer<typeof updateTriggerSchema>;
