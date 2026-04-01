'use client';

import {useState} from 'react';
import {Button} from '@shory/ui';
import {adminApi} from '@/lib/api-client';

interface StatusActionsProps {
  quoteId: string;
  currentStatus: string;
  token: string;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['expired'],
  submitted: ['quoted', 'rejected'],
  quoted: ['accepted', 'expired', 'rejected'],
};

export function StatusActions({quoteId, currentStatus, token}: StatusActionsProps) {
  const [loading, setLoading] = useState(false);
  const transitions = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) return null;

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    await adminApi.quotes.updateStatus(token, quoteId, newStatus);
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      {transitions.map((status) => (
        <Button
          key={status}
          variant={status === 'rejected' || status === 'expired' ? 'destructive' : 'default'}
          size="sm"
          disabled={loading}
          onClick={() => handleStatusChange(status)}
          className="rounded-xl capitalize"
        >
          {status === 'accepted' ? 'Approve' : status === 'rejected' ? 'Reject' : `Mark ${status}`}
        </Button>
      ))}
    </div>
  );
}
