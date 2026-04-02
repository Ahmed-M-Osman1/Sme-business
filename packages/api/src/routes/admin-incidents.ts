import {Hono} from 'hono';
import {db, incidents} from '@shory/db';
import {eq, desc, count, and} from 'drizzle-orm';
import {createIncidentSchema, updateIncidentSchema} from '@shory/shared';
import {errorResponse, handleZodError} from '../middleware/error-handler';

export const adminIncidentsRouter = new Hono();

// GET /incidents — filterable by status, severity
adminIncidentsRouter.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '20');
  const status = c.req.query('status');
  const severity = c.req.query('severity');
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (status) conditions.push(eq(incidents.status, status as 'active'));
  if (severity) conditions.push(eq(incidents.severity, severity as 'low'));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{total}]] = await Promise.all([
    db
      .select()
      .from(incidents)
      .where(where)
      .orderBy(desc(incidents.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({total: count()}).from(incidents).where(where),
  ]);

  return c.json({data, total, page, pageSize});
});

// POST /incidents
adminIncidentsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const result = createIncidentSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const [incident] = await db
    .insert(incidents)
    .values({
      ...result.data,
      startedAt: new Date(),
    })
    .returning();

  return c.json(incident, 201);
});

// PATCH /incidents/:id
adminIncidentsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = updateIncidentSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const updates: Record<string, unknown> = {...result.data};
  if (result.data.resolvedAt) {
    updates.resolvedAt = new Date(result.data.resolvedAt);
  }

  const [incident] = await db
    .update(incidents)
    .set(updates)
    .where(eq(incidents.id, id))
    .returning();

  if (!incident) {
    return errorResponse(c, 'INCIDENT_NOT_FOUND', `Incident ${id} not found`, 404);
  }

  return c.json(incident);
});
