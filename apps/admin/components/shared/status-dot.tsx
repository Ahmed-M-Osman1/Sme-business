'use client';

type Status = 'operational' | 'degraded' | 'down';

interface StatusDotProps {
  status: Status;
  pulse?: boolean;
}

const STATUS_COLORS: Record<Status, {dot: string; ring: string}> = {
  operational: {dot: 'bg-green-500', ring: 'bg-green-400'},
  degraded: {dot: 'bg-amber-500', ring: 'bg-amber-400'},
  down: {dot: 'bg-red-500', ring: 'bg-red-400'},
};

export function StatusDot({status, pulse = false}: StatusDotProps) {
  const colors = STATUS_COLORS[status];

  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {pulse && (
        <span
          className={`absolute inset-0 rounded-full ${colors.ring} animate-ping opacity-75`}
        />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colors.dot}`} />
    </span>
  );
}
