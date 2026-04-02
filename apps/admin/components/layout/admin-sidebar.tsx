'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useI18n} from '@/lib/i18n';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FileWarning,
  Radio,
  Activity,
  FileText,
  BarChart3,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

interface NavItem {
  labelKey: 'dashboard' | 'customers' | 'renewals' | 'claims' | 'signals' | 'platform' | 'quotes' | 'reports';
  href: string;
  icon: LucideIcon;
  dot?: 'amber' | 'teal';
}

const NAV_ITEMS: NavItem[] = [
  {labelKey: 'dashboard', href: '/', icon: LayoutDashboard},
  {labelKey: 'customers', href: '/customers', icon: Users},
  {labelKey: 'renewals', href: '/renewals', icon: CalendarClock},
  {labelKey: 'claims', href: '/claims', icon: FileWarning},
  {labelKey: 'signals', href: '/signals', icon: Radio, dot: 'teal'},
  {labelKey: 'platform', href: '/platform', icon: Activity, dot: 'amber'},
  {labelKey: 'quotes', href: '/quotes', icon: FileText},
  {labelKey: 'reports', href: '/reports', icon: BarChart3},
];

const DOT_COLORS = {
  amber: 'bg-amber-500',
  teal: 'bg-teal-500',
} as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const {t, locale, toggleLocale} = useI18n();

  return (
    <aside className="w-64 border-e border-gray-200 bg-white min-h-screen p-4 flex flex-col">
      <Link href="/" className="text-2xl font-black italic text-gray-900 block mb-8 px-3">
        {t.common.appName}
      </Link>
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-[#1D68FF]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{t.nav[item.labelKey]}</span>
              {item.dot && (
                <span
                  className={`h-2 w-2 rounded-full ${DOT_COLORS[item.dot]}`}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={toggleLocale}
        className="mx-3 mb-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors text-start"
      >
        {locale === 'en' ? 'عربي' : 'English'}
      </button>
    </aside>
  );
}
