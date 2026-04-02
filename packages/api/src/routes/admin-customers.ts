import {Hono} from 'hono';
import {
  db,
  customers,
  commsSequences,
  externalSignals,
  midtermTriggers,
  apiServices,
} from '@shory/db';
import {eq, desc, count, and, or, ilike, sql} from 'drizzle-orm';
import {createCustomerSchema, updateCustomerSchema} from '@shory/shared';
import {errorResponse, handleZodError} from '../middleware/error-handler';

export const adminCustomersRouter = new Hono();

// GET /customers — paginated, filterable
adminCustomersRouter.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '20');
  const stage = c.req.query('stage');
  const category = c.req.query('category');
  const emirate = c.req.query('emirate');
  const search = c.req.query('search');
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (stage) conditions.push(eq(customers.stage, stage as 'active'));
  if (category) conditions.push(eq(customers.category, category));
  if (emirate) conditions.push(eq(customers.emirate, emirate));
  if (search) {
    conditions.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.company, `%${search}%`),
        ilike(customers.email, `%${search}%`),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{total}]] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(where)
      .orderBy(desc(customers.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({total: count()}).from(customers).where(where),
  ]);

  return c.json({data, total, page, pageSize});
});

// GET /customers/:id
adminCustomersRouter.get('/:id', async (c) => {
  const id = c.req.param('id');

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));

  if (!customer) {
    return errorResponse(c, 'CUSTOMER_NOT_FOUND', `Customer ${id} not found`, 404);
  }

  return c.json(customer);
});

// POST /customers
adminCustomersRouter.post('/', async (c) => {
  const body = await c.req.json();
  const result = createCustomerSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const [customer] = await db
    .insert(customers)
    .values({
      ...result.data,
      premium: result.data.premium?.toString(),
    })
    .returning();

  return c.json(customer, 201);
});

// PATCH /customers/:id
adminCustomersRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = updateCustomerSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const updates: Record<string, unknown> = {
    ...result.data,
    updatedAt: new Date(),
  };
  if (result.data.premium !== undefined) {
    updates.premium = result.data.premium.toString();
  }

  const [customer] = await db
    .update(customers)
    .set(updates)
    .where(eq(customers.id, id))
    .returning();

  if (!customer) {
    return errorResponse(c, 'CUSTOMER_NOT_FOUND', `Customer ${id} not found`, 404);
  }

  return c.json(customer);
});

// GET /customers/:id/comms — comms sequences for a customer
adminCustomersRouter.get('/:id/comms', async (c) => {
  const id = c.req.param('id');

  const data = await db
    .select()
    .from(commsSequences)
    .where(eq(commsSequences.customerId, id))
    .orderBy(commsSequences.dayOffset);

  return c.json({data});
});

// GET /customers/:id/signals — external signals + midterm triggers affecting this customer
adminCustomersRouter.get('/:id/signals', async (c) => {
  const id = c.req.param('id');

  const [signals, triggers] = await Promise.all([
    db.select().from(externalSignals).where(
      sql`${externalSignals.affectedCustomers} @> ${JSON.stringify([id])}::jsonb`,
    ),
    db
      .select()
      .from(midtermTriggers)
      .where(eq(midtermTriggers.customerId, id))
      .orderBy(desc(midtermTriggers.createdAt)),
  ]);

  return c.json({signals, triggers});
});

// GET /customers/:id/platform-context — degraded services affecting this customer's insurer
adminCustomersRouter.get('/:id/platform-context', async (c) => {
  const id = c.req.param('id');

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));

  if (!customer) {
    return errorResponse(c, 'CUSTOMER_NOT_FOUND', `Customer ${id} not found`, 404);
  }

  const degradedServices = await db
    .select()
    .from(apiServices)
    .where(
      or(
        eq(apiServices.status, 'degraded'),
        eq(apiServices.status, 'down'),
      ),
    );

  return c.json({
    customerId: id,
    insurerId: customer.insurerId,
    degradedServices,
  });
});
