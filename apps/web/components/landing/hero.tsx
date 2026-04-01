'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Button, Card, CardContent} from '@shory/ui';
import {BusinessBundleIcon} from '@/components/icons/insurance-icons';

const PERSONAL_PRODUCTS = [
  {title: 'Car\nInsurance', imageBg: 'bg-white', href: '#'},
  {title: 'Health\nInsurance', imageBg: 'bg-white', href: '#'},
  {title: 'Home\nInsurance', imageBg: 'bg-white', href: '#'},
  {title: 'Pet\nInsurance', imageBg: 'bg-white', href: '#'},
] as const;

const BUSINESS_PRODUCTS = [
  {
    title: 'Visit Visa\nfor Agencies',
    imageBg: 'bg-white',
    href: '#',
    buttons: [
      {label: 'Buy a quota', variant: 'default' as const},
      {label: 'Learn more', variant: 'outline' as const},
    ],
  },
  {
    title: 'SME Business\nInsurance',
    imageBg: 'bg-white',
    href: '/quote/start',
    buttons: [{label: 'Get a quote', variant: 'default' as const}],
  },
] as const;

export function Hero() {
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>(
    'personal',
  );

  return (
    <section className="pt-12 pb-8 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-text mb-3">
          Compare and buy insurance in the UAE
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight">
          Top insurers. Best prices. One app.
        </h1>

        {/* Tab Toggle */}
        <div className="mt-8 inline-flex rounded-full border border-border bg-white p-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'personal'
                ? 'bg-text text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'business'
                ? 'bg-text text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Business
          </button>
        </div>

        {/* Product Cards */}
        <div className="mt-10 flex justify-center gap-6">
          {activeTab === 'personal' ? (
            <>
              {PERSONAL_PRODUCTS.map((product) => (
                <Card
                  key={product.title}
                  className="w-40 sm:w-44 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <CardContent className="flex flex-col items-center gap-3 p-5">
                    <h3 className="font-semibold text-text text-sm whitespace-pre-line text-center leading-tight">
                      {product.title}
                    </h3>
                    {/* Image placeholder */}
                    <div className="w-24 h-20 rounded-lg bg-surface flex items-center justify-center">
                      <span className="text-3xl text-text-muted">
                        {product.title.includes('Car')
                          ? '🚗'
                          : product.title.includes('Health')
                            ? '❤️'
                            : product.title.includes('Home')
                              ? '🏠'
                              : '🐾'}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="w-full rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all duration-200"
                    >
                      <Link href={product.href}>Get a quote</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {BUSINESS_PRODUCTS.map((product) => (
                <Card
                  key={product.title}
                  className="w-52 sm:w-56 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <h3 className="font-semibold text-text text-sm whitespace-pre-line text-center leading-tight">
                      {product.title}
                    </h3>
                    {/* Image placeholder */}
                    <div className="w-32 h-24 rounded-lg bg-surface flex items-center justify-center">
                      {product.title.includes('SME') ? (
                        <BusinessBundleIcon className="w-16 h-16" />
                      ) : (
                        <span className="text-3xl text-text-muted">✈️</span>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      {product.buttons.map((btn) => (
                        <Button
                          key={btn.label}
                          asChild
                          size="sm"
                          variant={btn.variant}
                          className={`flex-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            btn.variant === 'default'
                              ? 'bg-primary text-white hover:bg-primary-hover'
                              : 'border-border text-text hover:bg-surface'
                          }`}
                        >
                          <Link href={product.href}>{btn.label}</Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
