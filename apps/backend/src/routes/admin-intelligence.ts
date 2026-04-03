import {Hono} from 'hono';
import {
  db,
  externalSignals,
  midtermTriggers,
  peerBenchmarks,
  commsSequences,
} from '@shory/db';
import {eq, desc} from 'drizzle-orm';
import {createSignalSchema, updateSignalSchema, updateTriggerSchema} from '@shory/shared';
import {errorResponse, handleZodError} from '../middleware/error-handler';

export const adminIntelligenceRouter = new Hono();
// Force rebuild

// GET /signals — list all external signals
adminIntelligenceRouter.get('/signals', async (c) => {
  const data = await db
    .select()
    .from(externalSignals)
    .orderBy(desc(externalSignals.createdAt));

  return c.json({data});
});

// POST /signals — create a new external signal
adminIntelligenceRouter.post('/signals', async (c) => {
  const body = await c.req.json();
  const result = createSignalSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const [signal] = await db
    .insert(externalSignals)
    .values(result.data as any)
    .returning();

  return c.json(signal, 201);
});

// PATCH /signals/:id — update an external signal
adminIntelligenceRouter.patch('/signals/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = updateSignalSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const [signal] = await db
    .update(externalSignals)
    .set(result.data as any)
    .where(eq(externalSignals.id, id))
    .returning();

  if (!signal) {
    return errorResponse(c, 'SIGNAL_NOT_FOUND', `Signal ${id} not found`, 404);
  }

  return c.json(signal);
});

// GET /midterm — list all midterm triggers
adminIntelligenceRouter.get('/midterm', async (c) => {
  const data = await db
    .select()
    .from(midtermTriggers)
    .orderBy(desc(midtermTriggers.createdAt));

  return c.json({data});
});

// PATCH /midterm/:id — update a midterm trigger
adminIntelligenceRouter.patch('/midterm/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = updateTriggerSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  const [trigger] = await db
    .update(midtermTriggers)
    .set(result.data as any)
    .where(eq(midtermTriggers.id, id))
    .returning();

  if (!trigger) {
    return errorResponse(c, 'TRIGGER_NOT_FOUND', `Trigger ${id} not found`, 404);
  }

  return c.json(trigger);
});

// GET /benchmarks — list all peer benchmarks
adminIntelligenceRouter.get('/benchmarks', async (c) => {
  const data = await db
    .select()
    .from(peerBenchmarks)
    .orderBy(desc(peerBenchmarks.createdAt));

  return c.json({data});
});

// GET /scheduled-comms — list all scheduled comms sequences
adminIntelligenceRouter.get('/scheduled-comms', async (c) => {
  const data = await db
    .select()
    .from(commsSequences)
    .where(eq(commsSequences.isSent, false))
    .orderBy(commsSequences.dayOffset);

  return c.json({data});
});
