import {z} from 'zod';
import {COVERAGE_TYPES, EMIRATES, INDUSTRIES} from '../types/quote';

export const quoteFormSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tradeLicense: z.string().optional(),
  emirate: z.enum(EMIRATES, {message: 'Please select an emirate'}),
  industry: z.enum(INDUSTRIES, {message: 'Please select an industry'}),
  employeesCount: z.number().int().min(1, 'Must have at least 1 employee'),
  coverageType: z.enum(COVERAGE_TYPES, {message: 'Please select a coverage type'}),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
