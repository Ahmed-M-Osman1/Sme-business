import {Hono} from 'hono';
import {db, notifications} from '@shory/db';
import {eq, desc} from 'drizzle-orm';
import {errorResponse} from '../middleware/error-handler.js';

export const notificationsRouter = new Hono();

// GET /notifications?quoteId=x — list notifications for a quote (public, no auth)
notificationsRouter.get('/', async (c) => {
  const quoteId = c.req.query('quoteId');

  if (!quoteId) {
    return errorResponse(c, 'VALIDATION_ERROR', 'quoteId query parameter is required', 400);
  }

  const data = await db
    .select()
    .from(notifications)
    .where(eq(notifications.quoteId, quoteId))
    .orderBy(desc(notifications.createdAt));

  return c.json({data});
});

// PATCH /notifications/:id/read — mark notification as read (public, no auth)
notificationsRouter.patch('/:id/read', async (c) => {
  const id = c.req.param('id');

  const [notification] = await db
    .update(notifications)
    .set({isRead: true} as any)
    .where(eq(notifications.id, id))
    .returning();

  if (!notification) {
    return errorResponse(c, 'NOTIFICATION_NOT_FOUND', `Notification ${id} not found`, 404);
  }

  return c.json(notification);
});
