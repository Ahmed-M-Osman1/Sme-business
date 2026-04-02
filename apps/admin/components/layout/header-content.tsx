'use client';

import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import {useI18n} from '@/lib/i18n';
import {StatusDot} from '@/components/shared/status-dot';
import {AlertTray} from './alert-tray';

interface HeaderContentProps {
  session: {user?: {email?: string | null; name?: string | null}} | null;
  token: string;
}

interface ServiceStatus {
  id: string;
  status: 'operational' | 'degraded' | 'down';
}

interface AlertSummary {
  criticalCount: number;
  highCount: number;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function HeaderContent({session, token}: HeaderContentProps) {
  const {t} = useI18n();
  const [degradedCount, setDegradedCount] = useState(0);
  const [alertCounts, setAlertCounts] = useState<AlertSummary>({criticalCount: 0, highCount: 0});
  const [trayOpen, setTrayOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchServiceStatus() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'}/api/admin/platform/services`,
          {headers: {Authorization: `Bearer ${token}`}}
        );
        if (res.ok) {
          const data = (await res.json()) as ServiceStatus[];
          const count = data.filter(
            (s) => s.status === 'degraded' || s.status === 'down'
          ).length;
          setDegradedCount(count);
        }
      } catch {
        // Silently fail — pill stays green
      }
    }
    fetchServiceStatus();
  }, []);

  useEffect(() => {
    async function fetchAlertCounts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'}/api/admin/alerts`,
          {headers: {Authorization: `Bearer ${token}`}}
        );
        if (res.ok) {
          const data = (await res.json()) as Array<{severity: string}>;
          const critical = data.filter((a) => a.severity === 'critical').length;
          const high = data.filter((a) => a.severity === 'high').length;
          setAlertCounts({criticalCount: critical, highCount: high});
        }
      } catch {
        // Silently fail
      }
    }
    fetchAlertCounts();
  }, []);

  const totalAlertBadge = alertCounts.criticalCount + alertCounts.highCount;
  const isHealthy = degradedCount === 0;
  const initials = getInitials(session?.user?.name);

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900">{t.header.systemStatus}</h1>
      <div className="flex items-center gap-3">
        {/* Platform health pill */}
        <Link
          href="/platform"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            isHealthy
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <StatusDot status={isHealthy ? 'operational' : 'degraded'} pulse={!isHealthy} />
          {isHealthy
            ? t.header.allSystemsOk
            : `${degradedCount} ${t.header.apisDegraded}`}
        </Link>

        {/* AI Active badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <span aria-hidden="true">&#10022;</span>
          {t.header.aiActive}
        </span>

        {/* Inbound badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
          {t.header.inbound}: 0
        </span>

        {/* Alert bell */}
        <div className="relative">
          <button
            ref={bellRef}
            type="button"
            onClick={() => setTrayOpen((prev) => !prev)}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label={t.header.alerts}
          >
            <span className="text-lg" aria-hidden="true">
              &#x1F514;
            </span>
            {totalAlertBadge > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {totalAlertBadge}
              </span>
            )}
          </button>
          {trayOpen && <AlertTray onClose={() => setTrayOpen(false)} token={token} />}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 ms-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D68FF] text-xs font-bold text-white">
            {initials}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {session?.user?.name ?? session?.user?.email}
          </span>
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t.header.signOut}
          </button>
        </form>
      </div>
    </>
  );
}
