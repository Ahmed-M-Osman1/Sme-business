import {z} from 'zod';

export const CUSTOMER_STAGES = ['active', 'renewal_negotiation', 'lapsed'] as const;
export const PAYMENT_STATUSES = ['on_time', 'overdue', 'pending'] as const;

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  emirate: z.string().min(1),
  category: z.string().min(1),
  employees: z.number().int().min(1),
  nps: z.number().int().min(0).max(10).nullable().optional(),
  stage: z.enum(CUSTOMER_STAGES).optional(),
  products: z.array(z.string()).optional(),
  missingProducts: z.array(z.string()).optional(),
  renewalDays: z.number().int().optional(),
  insurerId: z.string().optional(),
  premium: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
