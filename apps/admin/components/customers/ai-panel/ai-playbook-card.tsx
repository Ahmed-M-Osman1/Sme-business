'use client';

import {useState} from 'react';
import type {PlaybookResult} from '@shory/shared';
import {Button, Card, CardContent} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {AiBadge} from '@/components/shared/ai-badge';

interface AiPlaybookCardProps {
  playbook: PlaybookResult;
  customerId: string;
  onDispatch: (actionType: string, customerId: string) => Promise<void>;
}

const ACTION_LABEL_MAP: Record<string, string> = {
  send_email: 'actionSendEmail',
  send_renewal_reminder: 'actionSendRenewalReminder',
  send_retention_email: 'actionSendRetentionEmail',
  apply_discount: 'actionApplyDiscount',
  schedule_call: 'actionScheduleCall',
  schedule_urgent_call: 'actionScheduleUrgentCall',
  prepare_upsell_proposal: 'actionPrepareUpsell',
  escalate: 'actionEscalate',
  escalate_to_manager: 'actionEscalateToManager',
  send_compliance_notice: 'actionSendComplianceNotice',
  send_whatsapp: 'actionSendWhatsApp',
  suppress_card: 'actionSuppressCard',
};

export function AiPlaybookCard({playbook, customerId, onDispatch}: AiPlaybookCardProps) {
  const {t} = useI18n();
  const [dispatched, setDispatched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(actionType: string) {
    setLoading(actionType);
    try {
      await onDispatch(actionType, customerId);
      setDispatched((prev) => new Set(prev).add(actionType));
    } catch {
      // Error handled by parent
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="rounded-xl border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white shadow-sm">
      <CardContent className="p-4">
        <div className="mb-2">
          <AiBadge label={playbook.badge} />
        </div>
        <p className="text-sm font-semibold text-gray-900">{playbook.headline}</p>
        <p className="mt-1 text-xs text-gray-600">{playbook.body}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {playbook.actions.map((action) => {
            const isDone = dispatched.has(action);
            const isLoading = loading === action;
            const labelKey = ACTION_LABEL_MAP[action] as keyof typeof t.playbooks | undefined;
            const label = labelKey ? t.playbooks[labelKey] : action;

            return (
              <Button
                key={action}
                variant={isDone ? 'outline' : 'default'}
                size="sm"
                disabled={isDone || isLoading}
                onClick={() => handleAction(action)}
                className="text-xs"
              >
                {isDone ? t.aiPanel.done : isLoading ? t.actions.dispatching : label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
