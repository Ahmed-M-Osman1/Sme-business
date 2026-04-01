import {Badge} from '@shory/ui';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  quoted: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  expired: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({status}: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`${STATUS_STYLES[status] ?? ''} border-0 capitalize`}>
      {status}
    </Badge>
  );
}
