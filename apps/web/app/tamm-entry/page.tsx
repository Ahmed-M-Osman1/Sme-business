'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button} from '@shory/ui';
import {getBrand} from '@/lib/brand';

/* ── Guide cards for the carousel ── */
const GUIDES = [
  {
    title: 'Why Abu Dhabi?',
    description:
      "Abu Dhabi's diverse economy offers individuals the opportunity to set up and operate businesses across a wide range of growing sectors.",
  },
  {
    title: 'Set Up Easily with Few Steps',
    description:
      'Starting a business in Abu Dhabi is easy with our streamlined, step-by-step guidance, minimizing paperwork and ensuring smooth progress.',
  },
  {
    title: 'Prosper Whether in Mainland or Free Zone',
    description:
      "Abu Dhabi's mainland and free zones offer a range of incentives making them attractive business and investment options.",
  },
];

/* ── Service cards (bottom carousel) ── */
const SERVICES = [
  {
    title: 'Trade Name Check',
    entity: 'Department of Economic Development',
    icon: 'https://static.tamm.abudhabi/cms-media/Project/TAMM/TAMM-v2/Mobile-Service-Icons/trade-license.png',
    href: '#',
  },
  {
    title: 'Business Insurance',
    entity: 'Shory Insurance Broker',
    icon: '/images/tamm-logo.svg',
    href: '/quote/start',
    highlighted: true,
  },
  {
    title: 'Investor Compass',
    entity: 'Department of Economic Development',
    icon: 'https://static.tamm.abudhabi/cms-media/Project/TAMM/TAMM-v2/Mobile-Service-Icons/compass-money-coins.png',
    href: '#',
  },
  {
    title: 'Apply for a Trade Licence',
    entity: 'Department of Economic Development',
    icon: 'https://static.tamm.abudhabi/cms-media/Project/TAMM/TAMM-v2/Mobile-Service-Icons/trade-license.png',
    href: '#',
  },
];

/* ── News items ── */
const NEWS = [
  {date: '15 August 2024', title: "ADDED includes 30 new activities to 'Freelancer Licence'"},
  {date: '30 July 2024', title: 'Tajer Abu Dhabi introduces 12 new activities'},
  {date: '06 June 2024', title: 'Abu Dhabi launches the unified economic licence'},
];

/* ── Chevron SVG ── */
function Chevron({className}: {className?: string}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
    >
      <path d="M7.642.151a.5.5 0 0 0 .01.707L14.994 8 7.65 15.142a.5.5 0 0 0 .698.716l7.349-7.146a.992.992 0 0 0 0-1.424L8.348.142a.5.5 0 0 0-.706.01Z" />
    </svg>
  );
}

export default function TammEntryPage() {
  const brand = getBrand();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'guides' | 'resources'>('guides');

  useEffect(() => {
    if (brand.id !== 'tamm') {
      router.replace('/');
    }
  }, [brand.id, router]);

  if (brand.id !== 'tamm') return null;

  function handleUaePassQuote() {
    const d = brand.uaePassMockData;
    if (!d) return;
    sessionStorage.setItem('uaepass-data', JSON.stringify(d));
    router.push(
      `/quote/results?uaepass=true&businessType=${d.businessType}&employees=${d.employees}&revenue=${d.revenue}&emirate=${encodeURIComponent(d.location)}`,
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(0deg, #FFFFFF 45%, #BBC3ED 100%)'}}>
      {/* ── TAMM Header ── */}
      <header className="bg-[#12121B] text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/tamm-entry" className="font-bold text-lg tracking-tight">
              TAMM
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {['My TAMM', 'Services', 'Government Entities', 'Support'].map((label) => (
                <span key={label} className="text-sm font-semibold text-white/90 hover:text-white cursor-default">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-white/80 hover:text-white flex items-center gap-1.5">
              <svg width="18" height="18" viewBox="0 0 24 25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              English
            </button>
            <Button size="sm" className="rounded-md text-xs px-4 bg-primary text-white">
              Sign in
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="hover:underline cursor-pointer">Home</span>
          <Chevron className="w-3 h-3" />
          <span className="text-text font-medium">Business</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#12121B] leading-tight">
          Embark on a Successful<br />Business Journey
        </h1>
        <p className="mt-3 text-base text-[#12121B]/70 max-w-xl">
          A step-by-step guide on how to start a business in Abu Dhabi.
        </p>
      </div>

      {/* ── Pill Tabs ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2">
          {(['guides', 'resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#12121B] text-white'
                  : 'bg-white border border-[#DEE2E6] text-[#12121B] hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Guide Cards Carousel ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <div
              key={guide.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-4 border border-white/60 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-bold text-[#12121B]">{guide.title}</h3>
              <p className="text-sm text-[#12121B]/60 leading-relaxed flex-1">
                {guide.description}
              </p>
              <button className="self-start px-4 py-2 rounded-full text-sm font-medium bg-white/80 backdrop-blur border border-[#DEE2E6] text-[#12121B] hover:bg-white transition-colors">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exploration Banner (Insurance CTA) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div
          className="relative rounded-2xl overflow-hidden p-8 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, #005C9E 0%, #003A66 100%)',
          }}
        >
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              Protect Your Business Today
            </h2>
            <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed">
              Get comprehensive SME insurance coverage in minutes. Workers Compensation, Liability, Property and more — all from top UAE insurers at competitive prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/quote/start">
                <Button className="rounded-full px-6 py-2.5 bg-white text-[#005C9E] font-semibold text-sm hover:bg-white/90">
                  Start your Journey
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full px-6 py-2.5 border-white/40 text-white font-semibold text-sm hover:bg-white/10"
                onClick={handleUaePassQuote}
              >
                Quick Quote with UAE PASS ✓
              </Button>
            </div>
          </div>
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="150" cy="100" r="120" fill="white" />
              <circle cx="180" cy="60" r="80" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── News Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-xl font-bold text-[#12121B] mb-4">News</h2>
        <div className="bg-white rounded-xl border border-[#DEE2E6] divide-y divide-[#DEE2E6]">
          {NEWS.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="opacity-50">
                    <path d="M1.547 3A.547.547 0 0 0 1 3.546v10.907c0 .302.245.547.547.547h12.907a.546.546 0 0 0 .546-.546V3.546A.546.546 0 0 0 14.454 3H1.546ZM0 3.546C0 2.692.692 2 1.547 2h12.907C15.307 2 16 2.692 16 3.546v10.907c0 .855-.692 1.547-1.546 1.547H1.546A1.547 1.547 0 0 1 0 14.454V3.546Z" />
                    <path d="M0 6.5A.5.5 0 0 1 .5 6h15a.5.5 0 1 1 0 1H.5a.5.5 0 0 1-.5-.5ZM4.5 0a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5Zm7 0a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5Z" />
                  </svg>
                  {item.date}
                </div>
                <p className="text-sm font-medium text-[#12121B]">{item.title}</p>
              </div>
              <Chevron className="w-4 h-4 text-text-muted shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Services Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#12121B]">Services</h2>
          <button className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            View All
            <Chevron className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service) => {
            const inner = (
              <div
                className={`bg-white rounded-xl border p-5 flex flex-col items-center text-center gap-3 h-full transition-all ${
                  service.highlighted
                    ? 'border-primary/30 ring-1 ring-primary/10 hover:shadow-md'
                    : 'border-[#DEE2E6] hover:shadow-sm'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.icon}
                  alt=""
                  className="w-16 h-16 rounded-md object-contain"
                />
                <h3 className="text-sm font-bold text-[#12121B]">{service.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-text-muted">
                  {service.entity}
                </span>
              </div>
            );
            return service.href !== '#' ? (
              <Link key={service.title} href={service.href}>{inner}</Link>
            ) : (
              <div key={service.title} className="opacity-60 cursor-not-allowed">{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
