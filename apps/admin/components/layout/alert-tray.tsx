'use client';

import {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/navigation';
import {useI18n} from '@/lib/i18n';

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  body: string;
  timeLabel: string;
  customerId?: string | null;
  isPlatform?: boolean;
  isProactive?: boolean;
}

interface AlertTrayProps {
  onClose: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-600',
  high: 'text-amber-600',
  medium: 'text-yellow-600',
  low: 'text-gray-600',
};

export function AlertTray({onClose}: AlertTrayProps) {
  const {t} = useI18n();
  const router = useRouter();
  const trayRef = useRef<HTMLDivElement>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'}/api/admin/alerts`
        );
        if (res.ok) {
          const data = (await res.json()) as Alert[];
          setAlerts(data);
        }
      } catch {
        // Silently fail
      }
    }
    fetchAlerts();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  function handleAlertClick(alert: Alert) {
    if (alert.isPlatform) {
      router.push('/platform');
    } else if (alert.isProactive) {
      router.push('/signals');
    } else if (alert.customerId) {
      router.push(`/customers?id=${alert.customerId}`);
    }
    onClose();
  }

  return (
    <div
      ref={trayRef}
      className="absolute top-12 end-0 w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t.alerts.allAlerts}</h3>
          <p className="text-xs text-gray-500">{t.alerts.customerPlatformProactive}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label={t.common.close}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Alert list */}
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">{t.alerts.noAlerts}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => handleAlertClick(alert)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">
                    {alert.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium truncate ${SEVERITY_COLORS[alert.severity] ?? 'text-gray-900'}`}
                      >
                        {alert.title}
                      </span>
                      {alert.isPlatform && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 uppercase">
                          {t.alerts.platform}
                        </span>
                      )}
                      {alert.isProactive && (
                        <span className="shrink-0 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 uppercase">
                          {t.alerts.signal}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alert.body}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{alert.timeLabel}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
