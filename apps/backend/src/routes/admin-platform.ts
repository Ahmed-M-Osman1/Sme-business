import {Hono} from 'hono';
import {
  db,
  apiServices,
  serviceHealthLogs,
  funnelEvents,
  behaviourMetrics,
  platformCorrelations,
} from '@shory/db';
import {eq, desc} from 'drizzle-orm';
import {updateServiceSchema} from '@shory/shared';
import {errorResponse, handleZodError} from '../middleware/error-handler.js';

export const adminPlatformRouter = new Hono();

// GET /services — list all API services
adminPlatformRouter.get('/services', async (c) => {
  const category = c.req.query('category');

  const data = category
    ? await db
        .select()
        .from(apiServices)
        .where(eq(apiServices.category, category as 'core'))
        .orderBy(apiServices.name)
    : await db.select().from(apiServices).orderBy(apiServices.name);

  return c.json({data});
});

// PATCH /services/:id — update a service
adminPlatformRouter.patch('/services/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = updateServiceSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const updates: Record<string, unknown> = {
    ...result.data,
    updatedAt: new Date(),
  };
  if (result.data.uptime !== undefined) {
    updates.uptime = result.data.uptime.toString();
  }
  if (result.data.errorRate !== undefined) {
    updates.errorRate = result.data.errorRate.toString();
  }

  const [service] = await db
    .update(apiServices)
    .set(updates)
    .where(eq(apiServices.id, id))
    .returning();

  if (!service) {
    return errorResponse(c, 'SERVICE_NOT_FOUND', `Service ${id} not found`, 404);
  }

  return c.json(service);
});

// GET /services/:id/history — health log history for a service
adminPlatformRouter.get('/services/:id/history', async (c) => {
  const id = c.req.param('id');
  const limit = Number(c.req.query('limit') ?? '100');

  const data = await db
    .select()
    .from(serviceHealthLogs)
    .where(eq(serviceHealthLogs.serviceId, id))
    .orderBy(desc(serviceHealthLogs.recordedAt))
    .limit(limit);

  return c.json({data});
});

// GET /funnel — funnel events
adminPlatformRouter.get('/funnel', async (c) => {
  const data = await db
    .select()
    .from(funnelEvents)
    .orderBy(desc(funnelEvents.recordedAt));

  return c.json({data});
});

// GET /behaviour — behaviour metrics
adminPlatformRouter.get('/behaviour', async (c) => {
  const data = await db
    .select()
    .from(behaviourMetrics)
    .orderBy(desc(behaviourMetrics.recordedAt));

  return c.json({data});
});

// GET /correlations — platform correlations
adminPlatformRouter.get('/correlations', async (c) => {
  const data = await db
    .select()
    .from(platformCorrelations)
    .orderBy(desc(platformCorrelations.createdAt));

  return c.json({data});
});
