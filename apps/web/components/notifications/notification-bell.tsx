'use client';

import {useState, useEffect, useCallback, useRef} from 'react';
import {useI18n} from '@/lib/i18n';
import {NotificationPanel} from './notification-panel';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const POLL_INTERVAL = 30_000;
const QUOTE_SESSION_KEY = 'shory-quote-id';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const {t} = useI18n();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Read quoteId from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(QUOTE_SESSION_KEY);
      if (stored) setQuoteId(stored);
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Poll for notifications
  const fetchNotifications = useCallback(async () => {
    if (!quoteId) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications?quoteId=${encodeURIComponent(quoteId)}`);
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications(data);
      }
    } catch {
      // Network error — silently ignore, will retry on next poll
    }
  }, [quoteId]);

  useEffect(() => {
    if (!quoteId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [quoteId, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {method: 'PATCH'});
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? {...n, isRead: true} : n)),
          );
        }
      } catch {
        // Network error — silently ignore
      }
    },
    [],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Don't render anything if there's no quote context
  if (!quoteId) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center h-9 w-9 rounded-full border border-border hover:bg-gray-50 transition-colors duration-200"
        aria-label={t.notifications.title}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
