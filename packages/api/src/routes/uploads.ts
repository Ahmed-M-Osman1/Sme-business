import {Hono} from 'hono';
import {put} from '@vercel/blob';
import {db, documents, quotes} from '@shory/db';
import {ALLOWED_FILE_TYPES, MAX_FILE_SIZE} from '@shory/shared';
import {eq} from 'drizzle-orm';
import {errorResponse} from '../middleware/error-handler.js';

export const uploadsRouter = new Hono();

// POST /uploads
uploadsRouter.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const quoteId = formData.get('quoteId') as string | null;

  if (!file) return errorResponse(c, 'VALIDATION_ERROR', 'File is required', 400);
  if (!quoteId) return errorResponse(c, 'VALIDATION_ERROR', 'quoteId is required', 400);

  if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
    return errorResponse(c, 'VALIDATION_ERROR', `File type ${file.type} not allowed. Use PDF, JPG, or PNG`, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse(c, 'UPLOAD_TOO_LARGE', 'File exceeds 10MB limit', 413);
  }

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
  if (!quote) return errorResponse(c, 'QUOTE_NOT_FOUND', `Quote ${quoteId} not found`, 404);

  const blob = await put(`documents/${quoteId}/${file.name}`, file, {access: 'public'});

  const [doc] = await db
    .insert(documents)
    .values({
      quoteId,
      fileName: file.name,
      fileType: file.type,
      blobUrl: blob.url,
    })
    .returning();

  return c.json(doc, 201);
});

// GET /uploads/:id
uploadsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) return errorResponse(c, 'QUOTE_NOT_FOUND', `Document ${id} not found`, 404);
  return c.json(doc);
});
