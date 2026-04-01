import {z} from 'zod';

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadMetadataSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  fileName: z.string().min(1),
  fileType: z.enum(ALLOWED_FILE_TYPES as unknown as [string, ...string[]]),
});

export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
