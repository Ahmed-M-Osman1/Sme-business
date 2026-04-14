'use client';

import {useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button, Card, CardContent, Badge} from '@shory/ui';
import {getBrand} from '@/lib/brand';

const MOCK_SERVICES = [
  {
    id: 'trade-licence',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Trade Licence Renewal',
    titleAr: 'تجديد الرخصة التجارية',
    description: 'Renew your Abu Dhabi trade licence online',
    active: false,
  },
  {
    id: 'business-registration',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: 'Business Registration',
    titleAr: 'تسجيل الأعمال',
    description: 'Register a new business in Abu Dhabi',
    active: false,
  },
  {
    id: 'business-insurance',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Business Insurance',
    titleAr: 'تأمين الأعمال',
    description: 'Get SME insurance coverage for your business',
    active: true,
    badge: 'Popular',
  },
  {
    id: 'visa-services',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Visa Services',
    titleAr: 'خدمات التأشيرات',
    description: 'Apply for employee and investor visas',
    active: false,
  },
  {
    id: 'tax-registration',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Tax Registration',
    titleAr: 'التسجيل الضريبي',
    description: 'Register for VAT and corporate tax',
    active: false,
  },
  {
    id: 'labour-permits',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Labour Permits',
    titleAr: 'تصاريح العمل',
    description: 'Apply for work permits and labour cards',
    active: false,
  },
] as const;

export default function TammEntryPage() {
  const brand = getBrand();
  const router = useRouter();

  useEffect(() => {
    if (brand.id !== 'tamm') {
      router.replace('/');
    }
  }, [brand.id, router]);

  if (brand.id !== 'tamm') {
    return null;
  }

  function handleUaePassQuote() {
    const d = brand.uaePassMockData;
    if (!d) return;
    sessionStorage.setItem('uaepass-data', JSON.stringify(d));
    router.push(
      `/quote/results?uaepass=true&businessType=${d.businessType}&employees=${d.employees}&revenue=${d.revenue}&emirate=${encodeURIComponent(d.location)}`,
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* TAMM Business Space Header */}
      <header className="bg-[var(--color-nav-bg)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-white/70 mb-1">
                tamm.abudhabi
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Business Space
              </h1>
              <p className="text-lg sm:text-xl font-semibold mt-0.5" dir="rtl">
                مساحة الأعمال
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white/70">Abu Dhabi Government</p>
              <p className="text-sm text-white/70" dir="rtl">حكومة أبوظبي</p>
            </div>
          </div>
        </div>
      </header>

      {/* Service Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-lg sm:text-xl font-semibold text-text mb-6">
          Business Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {MOCK_SERVICES.map((service) => (
            <Card
              key={service.id}
              className={`rounded-lg border border-border p-0 transition-all duration-200 ${
                service.active
                  ? 'hover:shadow-md hover:border-primary/40'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                {/* Icon + Badge row */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-nav-bg)]/10 flex items-center justify-center text-[var(--color-nav-bg)]">
                    {service.icon}
                  </div>
                  {service.active && service.badge && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 rounded px-2 py-0.5 text-xs font-medium">
                      {service.badge}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-bold text-text">
                    {service.title}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {service.description}
                  </p>
                </div>

                {/* CTAs — only for active tile */}
                {service.active ? (
                  <div className="flex flex-col gap-2 mt-auto pt-2">
                    <Link href="/quote/start">
                      <Button className="w-full rounded-md text-sm">
                        Get a quote &rarr;
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full rounded-md text-sm border-green-300 text-green-700 hover:bg-green-50"
                      onClick={handleUaePassQuote}
                    >
                      Get a quote with UAE PASS &#10003;
                    </Button>
                  </div>
                ) : (
                  <div className="mt-auto pt-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-md text-sm"
                      disabled
                    >
                      Coming soon
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
