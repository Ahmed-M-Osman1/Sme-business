import {z} from 'zod';

export const ACTION_TYPES = [
  'send_email', 'send_whatsapp', 'apply_discount', 'send_retention_email',
  'suppress_card', 'escalate', 'add_upgrade_offer', 'enable_auto_renew',
  'pause_sequence', 'send_compliance_notice', 'send_reinstatement_link',
  'add_product_card', 'send_peer_insight', 'send_midterm_advisory',
  'approve_signal_comms', 'generate_report',
] as const;

export const dispatchActionSchema = z.object({
  type: z.enum(ACTION_TYPES),
  customerId: z.string().uuid().optional(),
  payload: z.record(z.unknown()).optional(),
});

export type DispatchActionInput = z.infer<typeof dispatchActionSchema>;
