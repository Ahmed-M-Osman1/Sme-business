import type {Action} from '@shory/db';

export interface NotificationContent {
  title: string;
  body: string;
}

const ACTION_NOTIFICATION_MAP: Record<
  string,
  (payload: Record<string, unknown>) => NotificationContent
> = {
  send_email: (payload) => ({
    title: 'Email sent',
    body: `An email has been sent to ${String(payload['recipientName'] ?? 'the customer')} regarding ${String(payload['subject'] ?? 'your policy')}.`,
  }),
  send_whatsapp: (payload) => ({
    title: 'WhatsApp message sent',
    body: `A WhatsApp message has been sent to ${String(payload['recipientName'] ?? 'the customer')}.`,
  }),
  apply_discount: (payload) => ({
    title: 'Discount applied',
    body: `A ${String(payload['discountPct'] ?? '')}% discount has been applied to ${String(payload['recipientName'] ?? 'the customer')}'s renewal.`,
  }),
  send_retention_email: (payload) => ({
    title: 'Retention offer sent',
    body: `A retention offer has been sent to ${String(payload['recipientName'] ?? 'the customer')} with a special renewal package.`,
  }),
  send_renewal_reminder: (payload) => ({
    title: 'Renewal reminder sent',
    body: `A renewal reminder has been sent to ${String(payload['recipientName'] ?? 'the customer')}.`,
  }),
  schedule_call: (payload) => ({
    title: 'Call scheduled',
    body: `A call has been scheduled with ${String(payload['recipientName'] ?? 'the customer')}.`,
  }),
  schedule_urgent_call: (payload) => ({
    title: 'Urgent call scheduled',
    body: `An urgent call has been scheduled with ${String(payload['recipientName'] ?? 'the customer')}.`,
  }),
  prepare_upsell_proposal: (payload) => ({
    title: 'Upsell proposal prepared',
    body: `An upsell proposal has been prepared for ${String(payload['recipientName'] ?? 'the customer')}.`,
  }),
  send_compliance_notice: (payload) => ({
    title: 'Compliance notice sent',
    body: `A compliance notice has been sent to ${String(payload['recipientName'] ?? 'the customer')} regarding their lapsed policy.`,
  }),
  escalate_to_manager: (payload) => ({
    title: 'Escalated to manager',
    body: `The case for ${String(payload['recipientName'] ?? 'the customer')} has been escalated to management for review.`,
  }),
};

export function createNotificationFromAction(action: Action): NotificationContent {
  const payload = (action.payload ?? {}) as Record<string, unknown>;
  const mapper = ACTION_NOTIFICATION_MAP[action.type];

  if (mapper) {
    return mapper(payload);
  }

  // Fallback for unknown action types
  return {
    title: `Action completed: ${action.type}`,
    body: `The action "${action.type}" has been processed successfully.`,
  };
}
