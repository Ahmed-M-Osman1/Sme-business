import {Hono} from 'hono';
import {db, businessTypes, products, insurers, quoteOptions} from '@shory/db';
import {eq} from 'drizzle-orm';

export const catalogRouter = new Hono();

// GET /catalog/business-types
catalogRouter.get('/business-types', async (c) => {
  const rows = await db.select().from(businessTypes);
  return c.json(rows);
});

// GET /catalog/business-types/:id
catalogRouter.get('/business-types/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(businessTypes).where(eq(businessTypes.id, id));
  if (!row) return c.json({error: {code: 'NOT_FOUND', message: `Business type ${id} not found`}}, 404);
  return c.json(row);
});

// GET /catalog/products
catalogRouter.get('/products', async (c) => {
  const rows = await db.select().from(products);
  return c.json(rows);
});

// GET /catalog/insurers
catalogRouter.get('/insurers', async (c) => {
  const rows = await db.select().from(insurers);
  return c.json(rows);
});

// GET /catalog/quote-options
catalogRouter.get('/quote-options', async (c) => {
  const rows = await db.select().from(quoteOptions);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.id] = row.items;
  }
  return c.json(result);
});

// GET /catalog/quote-options/:id
catalogRouter.get('/quote-options/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(quoteOptions).where(eq(quoteOptions.id, id));
  if (!row) return c.json({error: {code: 'NOT_FOUND', message: `Option ${id} not found`}}, 404);
  return c.json(row.items);
});
