import {Hono} from 'hono';
import {db, quotes, quoteResults, policies, customers, type Customer} from '@shory/db';
import {eq, and, count, sum} from 'drizzle-orm';
import {errorResponse, handleZodError} from '../middleware/error-handler.js';
import {webUserAuth} from '../middleware/auth.js';
import {ZodError} from 'zod';
import {z} from 'zod';

const createPolicySchema = z.object({
  userId: z.string().uuid(),
  businessName: z.string(),
  emirate: z.string(),
  typeId: z.string(),
  insurerId: z.string(),
  products: z.array(z.string()),
  limits: z.record(z.string()),
  total: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  licenseNumber: z.string().optional(),
  employees: z.string().optional(),
});

type Variables = {
  webUser: Customer;
};

export const userPoliciesRouter = new Hono<{Variables: Variables}>();

// Protect all routes with webUserAuth
userPoliciesRouter.use('*', webUserAuth);

// POST /user/policies — persist policy after payment
userPoliciesRouter.post('/policies', async (c) => {
  try {
    const body = await c.req.json();
    const data = createPolicySchema.parse(body);
    const webUser = c.get('webUser') as Customer;

    // Verify the userId in the payload matches the authenticated user
    if (data.userId !== webUser.id) {
      return errorResponse(c, 'FORBIDDEN', 'Cannot create policy for another user', 403);
    }

    // Create quote
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [quote] = await db
      .insert(quotes)
      .values({
        businessName: data.businessName,
        emirate: data.emirate,
        industry: data.typeId,
        businessType: data.typeId,
        employeesCount: data.employees ? parseInt(data.employees) : 0,
        coverageType: data.products.join(','),
        status: 'accepted',
      } as any)
      .returning();

    // Create quote result
    const monthlyPremium = Math.round(data.total / 12);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result] = await db
      .insert(quoteResults)
      .values({
        quoteId: quote.id,
        providerId: data.insurerId,
        providerName: data.insurerId,
        monthlyPremium: monthlyPremium.toString(),
        annualPremium: data.total.toString(),
        coverageAmount: (data.total * 2).toString(),
        deductible: '0',
        benefits: {},
      } as any)
      .returning();

    // Generate policy number
    const policyNumber = `SHR-${Date.now().toString(36).toUpperCase()}`;

    // Create policy
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [policy] = await db
      .insert(policies)
      .values({
        quoteId: quote.id,
        resultId: result.id,
        userId: data.userId,
        policyNumber,
        status: 'active',
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        products: data.products,
      } as any)
      .returning();

    return c.json({policyNumber, policyId: policy.id}, 201);
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});

// GET /user/policies — list user's policies
userPoliciesRouter.get('/policies', async (c) => {
  const webUser = c.get('webUser') as Customer;

  const userPolicies = await db
    .select({
      id: policies.id,
      policyNumber: policies.policyNumber,
      status: policies.status,
      startDate: policies.startDate,
      endDate: policies.endDate,
      products: policies.products,
      businessName: quotes.businessName,
      providerId: quoteResults.providerId,
      providerName: quoteResults.providerName,
      annualPremium: quoteResults.annualPremium,
    })
    .from(policies)
    .innerJoin(quotes, eq(policies.quoteId, quotes.id))
    .innerJoin(quoteResults, eq(policies.resultId, quoteResults.id))
    .where(eq(policies.userId, webUser.id))
    .orderBy(policies.createdAt);

  return c.json(userPolicies);
});

// GET /user/policies/:id — single policy detail
userPoliciesRouter.get('/policies/:id', async (c) => {
  const webUser = c.get('webUser') as Customer;
  const policyId = c.req.param('id');

  const [userPolicy] = await db
    .select({
      id: policies.id,
      policyNumber: policies.policyNumber,
      status: policies.status,
      startDate: policies.startDate,
      endDate: policies.endDate,
      products: policies.products,
      businessName: quotes.businessName,
      providerId: quoteResults.providerId,
      providerName: quoteResults.providerName,
      annualPremium: quoteResults.annualPremium,
    })
    .from(policies)
    .innerJoin(quotes, eq(policies.quoteId, quotes.id))
    .innerJoin(quoteResults, eq(policies.resultId, quoteResults.id))
    .where(and(eq(policies.userId, webUser.id), eq(policies.id, policyId)));

  if (!userPolicy) {
    return errorResponse(c, 'POLICY_NOT_FOUND', 'Policy not found', 404);
  }

  return c.json(userPolicy);
});

// GET /user/profile
userPoliciesRouter.get('/profile', async (c) => {
  const webUser = c.get('webUser') as Customer;
  return c.json({id: webUser.id, name: webUser.name, email: webUser.email, phone: webUser.phone ?? null});
});

// PATCH /user/profile
userPoliciesRouter.patch('/profile', async (c) => {
  try {
    const webUser = c.get('webUser') as Customer;
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
    });
    const data = schema.parse(body);

    const [updated] = await db
      .update(customers)
      .set({...data, updatedAt: new Date()} as any)
      .where(eq(customers.id, webUser.id))
      .returning();

    return c.json({id: updated.id, name: updated.name, email: updated.email, phone: updated.phone ?? null});
  } catch (e) {
    if (e instanceof ZodError) return handleZodError(c, e);
    throw e;
  }
});

// GET /user/stats — dashboard stats
userPoliciesRouter.get('/stats', async (c) => {
  const webUser = c.get('webUser') as Customer;

  const activePoliciesResult = await db
    .select({count: count()})
    .from(policies)
    .where(and(eq(policies.status, 'active'), eq(policies.userId, webUser.id)));

  const activePolicies = parseInt((activePoliciesResult[0]?.count as number | undefined)?.toString() || '0');

  const annualSpendResult = await db
    .select({total: sum(quoteResults.annualPremium)})
    .from(policies)
    .innerJoin(quoteResults, eq(policies.resultId, quoteResults.id))
    .where(and(eq(policies.status, 'active'), eq(policies.userId, webUser.id)));

  const annualSpend = parseInt((annualSpendResult[0]?.total as unknown as string | undefined) || '0');

  const nextRenewalResult = await db
    .select({endDate: policies.endDate})
    .from(policies)
    .where(and(eq(policies.status, 'active'), eq(policies.userId, webUser.id)))
    .orderBy(policies.endDate)
    .limit(1);

  let daysToRenewal = null;
  if (nextRenewalResult.length > 0 && nextRenewalResult[0].endDate) {
    const renewalDate = new Date(nextRenewalResult[0].endDate);
    const today = new Date();
    daysToRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return c.json({
    activePolicies,
    annualSpend,
    daysToRenewal,
  });
});
