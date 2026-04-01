import {z} from 'zod';
import {EMIRATES, INDUSTRIES, COVERAGE_TYPES} from '../types/quote';

export const createQuoteSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tradeLicense: z.string().optional(),
  emirate: z.enum(EMIRATES as unknown as [string, ...string[]]),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]]),
  businessType: z.string().optional(),
  employeesCount: z.number().int().min(1, 'At least 1 employee required'),
  coverageType: z.enum(COVERAGE_TYPES as unknown as [string, ...string[]]),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const quoteFormSchema = createQuoteSchema;

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
