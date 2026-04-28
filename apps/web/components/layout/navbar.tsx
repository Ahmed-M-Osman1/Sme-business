'use client';

import Link from 'next/link';
import Image from 'next/image';
import {Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {NotificationBell} from '@/components/notifications/notification-bell';
import {useBrand} from '@/lib/brand';

const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

export function Navbar() {
  const {t, toggleLocale} = useI18n();
  const brand = useBrand();
  const isDark = brand.navStyle === 'dark';

  const NAV_LINKS = [{label: t.nav.business, href: `${brand.basePath}/quote/start`}];

  return (
    <nav
      className={
        isDark
          ? 'sticky top-0 z-50 border-b border-white/20'
          : 'sticky top-0 z-50 bg-white border-b border-border'
      }
      style={isDark ? {backgroundColor: 'var(--color-nav-bg, #005C9E)', color: 'var(--color-nav-text, #FFFFFF)'} : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          {isDark ? (
            <Link href="/" className="flex items-center">
              <Image
                src={brand.logoPath}
                alt={brand.logoAlt}
                width={120}
                height={40}
                priority
              />
            </Link>
          ) : (
            <Link
              href="/"
              className="text-2xl font-black italic text-text">
              {brand.displayName}
            </Link>
          )}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  isDark
                    ? 'text-sm font-medium text-white/90 hover:text-white transition-colors duration-200'
                    : 'text-sm font-medium text-text hover:text-text-muted transition-colors duration-200'
                }>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className={
              isDark
                ? 'rounded-full px-4 gap-2 border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors'
                : 'rounded-full px-4 gap-2 border-border text-sm font-medium hover:bg-gray-50 transition-colors'
            }>
            <svg
              width="20"
              height="15"
              viewBox="0 0 12 9"
              className="rounded-sm overflow-hidden shrink-0">
              <rect width="12" height="3" fill="#00732F" />
              <rect width="12" height="3" y="3" fill="#FFFFFF" />
              <rect width="12" height="3" y="6" fill="#000000" />
              <rect width="3" height="9" fill="#EF3340" />
            </svg>
            {t.nav.switchLang}
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className={
                isDark
                  ? 'rounded-full px-6 border-white/30 text-white text-sm font-medium hover:bg-white/10'
                  : 'rounded-full px-6 border-border text-sm font-medium'
              }>
              {t.nav.dashboard}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
