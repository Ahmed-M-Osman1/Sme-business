'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {readUaePassSession, type UaePassAccount} from '@/lib/tamm/uaepass-account';
import {useI18n} from '@/lib/i18n';

interface TammUserMenuProps {
  /** Header background — controls "Sign in" button + name color when logged-out / collapsed. */
  variant?: 'dark' | 'light';
}

export function TammUserMenu({variant = 'dark'}: TammUserMenuProps) {
  const router = useRouter();
  const {t} = useI18n();
  const m = t.tamm.userMenu;
  const [account, setAccount] = useState<UaePassAccount | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccount(readUaePassSession());
    const handler = () => setAccount(readUaePassSession());
    window.addEventListener('uaepass-session-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('uaepass-session-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleLogout() {
    sessionStorage.removeItem('uaepass-data');
    sessionStorage.removeItem('tamm-authenticated');
    sessionStorage.removeItem('tamm-selected-company');
    sessionStorage.removeItem('tamm-licence-flow');
    window.dispatchEvent(new Event('uaepass-session-change'));
    setAccount(null);
    setOpen(false);
    router.push('/tamm');
  }

  if (!account) {
    return (
      <button
        type="button"
        onClick={() => router.push('/tamm/quote/login')}
        className={
          variant === 'dark'
            ? 'rounded-md text-xs px-4 py-1.5 bg-primary text-white font-medium hover:opacity-90 transition-opacity'
            : 'rounded-md text-xs px-4 py-1.5 bg-primary text-white font-medium hover:opacity-90 transition-opacity'
        }>
        {m.signIn}
      </button>
    );
  }

  const initials =
    account.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('') || '?';

  const nameColor = variant === 'dark' ? 'text-white/90' : 'text-text';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full ps-1 pe-2 py-1 transition-colors ${
          variant === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
        }`}>
        <span
          className="w-8 h-8 rounded-full bg-[#009688] text-white text-xs font-bold flex items-center justify-center"
          aria-hidden>
          {initials}
        </span>
        <span className={`hidden sm:inline text-sm font-medium ${nameColor}`}>
          {account.name}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`hidden sm:inline transition-transform ${open ? 'rotate-180' : ''} ${
            variant === 'dark' ? 'text-white/70' : 'text-text-muted'
          }`}>
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              {m.signedInAs}
            </div>
            <div className="mt-1 text-sm font-bold text-text truncate">{account.name}</div>
            {account.emiratesId && (
              <div className="text-xs text-text-muted mt-0.5">
                {m.emiratesIdLabel} · {account.emiratesId}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            className="w-full px-4 py-3 text-start text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {m.logOut}
          </button>
        </div>
      )}
    </div>
  );
}
