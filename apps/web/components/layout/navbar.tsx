'use client';

import Link from 'next/link';
import {Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

export function Navbar() {
  const {t, toggleLocale} = useI18n();

  const NAV_LINKS = [
    {label: t.nav.personal, href: '#'},
    {label: t.nav.business, href: '#'},
    {label: t.nav.company, href: '#'},
    {label: t.nav.help, href: '#'},
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black italic text-text">
            {t.common.appName}
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text hover:text-text-muted transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className="rounded-full px-4 gap-2 border-border text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="15" viewBox="0 0 12 9" className="rounded-sm overflow-hidden shrink-0">
              <rect width="12" height="3" fill="#00732F" />
              <rect width="12" height="3" y="3" fill="#FFFFFF" />
              <rect width="12" height="3" y="6" fill="#000000" />
              <rect width="3" height="9" fill="#EF3340" />
            </svg>
            {t.nav.switchLang}
          </Button>
          <Link
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-6 border-border text-sm font-medium"
            >
              {t.nav.dashboard}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
