import {z} from 'zod';

export const acceptQuoteSchema = z.object({
  resultId: z.string().uuid('Invalid result ID'),
});

export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;
