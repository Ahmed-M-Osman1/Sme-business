import {Hono} from 'hono';
import {db, actions, notifications} from '@shory/db';
import {desc, count} from 'drizzle-orm';
import {dispatchActionSchema} from '@shory/shared';
import {handleZodError} from '../middleware/error-handler.js';

const ACTION_NOTIFICATION_MAP: Record<string, {title: string; body: string}> = {
  send_email: {title: 'New message from Shory', body: 'You have a new email regarding your policy.'},
  send_whatsapp: {title: 'WhatsApp message', body: 'You have a new WhatsApp message from Shory.'},
  apply_discount: {title: 'Discount applied', body: 'A special discount has been applied to your policy.'},
  send_retention_email: {title: 'Important policy update', body: 'We have an important update regarding your policy renewal.'},
  suppress_card: {title: 'Notification preferences updated', body: 'Your notification preferences have been updated.'},
  escalate: {title: 'Case escalated', body: 'Your case has been escalated for priority review.'},
  add_upgrade_offer: {title: 'Upgrade offer available', body: 'A new upgrade offer is available for your policy.'},
  enable_auto_renew: {title: 'Auto-renewal enabled', body: 'Auto-renewal has been enabled for your policy.'},
  pause_sequence: {title: 'Communications paused', body: 'Automated communications have been paused for your account.'},
  send_compliance_notice: {title: 'Compliance notice', body: 'Please review an important compliance notice.'},
  send_reinstatement_link: {title: 'Reinstatement available', body: 'You can now reinstate your lapsed policy.'},
  add_product_card: {title: 'New product recommendation', body: 'We have a product recommendation based on your business needs.'},
  send_peer_insight: {title: 'Industry insight', body: 'Check out how similar businesses are protecting themselves.'},
  send_midterm_advisory: {title: 'Mid-term advisory', body: 'We have an advisory regarding your current coverage.'},
  approve_signal_comms: {title: 'Advisory approved', body: 'An advisory communication has been approved for your account.'},
  generate_report: {title: 'Report generated', body: 'A new report has been generated for your account.'},
};

export const adminActionsRouter = new Hono();

// POST /actions — dispatch action, create notification, mark completed
adminActionsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const result = dispatchActionSchema.safeParse(body);

  if (!result.success) {
    return handleZodError(c, result.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminUser = (c as any).get('adminUser') as {id: string};

  // Insert the action
  const [action] = await db
    .insert(actions)
    .values({
      type: result.data.type,
      adminUserId: adminUser.id,
    } as any)
    .returning();

  // Create notification for customer if customerId provided
  if (result.data.customerId) {
    const notifContent = ACTION_NOTIFICATION_MAP[result.data.type] ?? {
      title: 'Action completed',
      body: `An action (${result.data.type}) has been completed for your account.`,
    };

    await db.insert(notifications).values({
      actionId: action.id,
      customerId: result.data.customerId,
      title: notifContent.title,
      body: notifContent.body,
    });
  }

  return c.json(action, 201);
});

// GET /actions — list recent actions
adminActionsRouter.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '20');
  const offset = (page - 1) * pageSize;

  const [data, [{total}]] = await Promise.all([
    db
      .select()
      .from(actions)
      .orderBy(desc(actions.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({total: count()}).from(actions),
  ]);

  return c.json({data, total, page, pageSize});
});
