'use client';

import Link from 'next/link';
import {useI18n} from '@/lib/i18n';
import {TammUserMenu} from './tamm-user-menu';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TammDarkHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

function ChevronRight({className}: {className?: string}) {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M7.642.151a.5.5 0 0 0 .01.707L14.994 8 7.65 15.142a.5.5 0 0 0 .698.716l7.349-7.146a.992.992 0 0 0 0-1.424L8.348.142a.5.5 0 0 0-.706.01Z" />
    </svg>
  );
}

export function TammDarkHeader({breadcrumbs}: TammDarkHeaderProps) {
  const {t, toggleLocale} = useI18n();
  const navLabels = [
    t.tamm.nav.myTamm,
    t.tamm.nav.services,
    t.tamm.nav.governmentEntities,
    t.tamm.nav.support,
  ];

  return (
    <>
      <header className="bg-[#12121B] text-white sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/tamm" className="font-bold text-lg tracking-tight">
              TAMM
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLabels.map((label) => (
                <span key={label} className="text-sm font-semibold text-white/90 hover:text-white cursor-default">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="text-sm text-white/80 hover:text-white">
              {t.tamm.nav.langToggle}
            </button>
            <TammUserMenu variant="dark" />
          </div>
        </nav>
      </header>

      {breadcrumbs && breadcrumbs.length > 0 ? (
        <div className="bg-white border-b border-[#E8ECF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center gap-1.5 text-xs">
              {breadcrumbs.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="text-[#94A3B8]" />}
                  {item.href ? (
                    <Link href={item.href} className="text-[#169F9F] hover:underline font-medium">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-[#4A5568] font-medium">{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
