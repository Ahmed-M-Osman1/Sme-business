'use client';

import {useI18n} from '@/lib/i18n';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
}

function RelativeTime({date}: {date: string}) {
  const {t} = useI18n();
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return <span>{t.notifications.justNow}</span>;
  if (diffMin < 60) return <span>{t.notifications.minutesAgo.replace('{count}', String(diffMin))}</span>;
  if (diffHr < 24) return <span>{t.notifications.hoursAgo.replace('{count}', String(diffHr))}</span>;
  return <span>{t.notifications.daysAgo.replace('{count}', String(diffDay))}</span>;
}

export function NotificationPanel({notifications, onMarkRead}: NotificationPanelProps) {
  const {t} = useI18n();

  return (
    <div className="absolute top-full end-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text">{t.notifications.title}</h3>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 mb-3"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <p className="text-sm text-text-muted">{t.notifications.empty}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.isRead) onMarkRead(n.id);
              }}
              className={`w-full text-start px-4 py-3 border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-gray-50 ${
                n.isRead ? 'opacity-60' : 'bg-blue-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${n.isRead ? 'font-normal text-text-muted' : 'font-semibold text-text'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                </div>
                {!n.isRead && (
                  <span className="mt-1 shrink-0 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                <RelativeTime date={n.createdAt} />
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
