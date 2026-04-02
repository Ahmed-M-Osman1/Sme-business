import {Hono} from 'hono';
import {db, portfolioAlerts} from '@shory/db';
import {eq, desc, count} from 'drizzle-orm';
import {errorResponse} from '../middleware/error-handler';

export const adminAlertsRouter = new Hono();

// GET /alerts — sorted by severity desc, created_at desc
adminAlertsRouter.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '50');
  const offset = (page - 1) * pageSize;

  const [data, [{total}]] = await Promise.all([
    db
      .select()
      .from(portfolioAlerts)
      .orderBy(desc(portfolioAlerts.severity), desc(portfolioAlerts.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({total: count()}).from(portfolioAlerts),
  ]);

  return c.json({data, total, page, pageSize});
});

// POST /alerts
adminAlertsRouter.post('/', async (c) => {
  const body = await c.req.json();

  const {severity, icon, title, body: alertBody, timeLabel, customerId, isPlatform, isProactive, signalId} =
    body as {
      severity: string;
      icon: string;
      title: string;
      body: string;
      timeLabel: string;
      customerId?: string;
      isPlatform?: boolean;
      isProactive?: boolean;
      signalId?: string;
    };

  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(severity)) {
    return errorResponse(c, 'VALIDATION_ERROR', `Invalid severity: ${severity}`, 400);
  }

  const [alert] = await db
    .insert(portfolioAlerts)
    .values({
      severity: severity as 'low',
      icon,
      title,
      body: alertBody,
      timeLabel,
    } as any)
    .returning();

  return c.json(alert, 201);
});

// PATCH /alerts/:id/read
adminAlertsRouter.patch('/:id/read', async (c) => {
  const id = c.req.param('id');

  const [alert] = await db
    .update(portfolioAlerts)
    .set({isRead: true} as any)
    .where(eq(portfolioAlerts.id, id))
    .returning();

  if (!alert) {
    return errorResponse(c, 'ALERT_NOT_FOUND', `Alert ${id} not found`, 404);
  }

  return c.json(alert);
});
