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

/* ── TAMM SVG Icons (extracted from tamm.abudhabi) ── */

function ChevronRight({className}: {className?: string}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M7.642.151a.5.5 0 0 0 .01.707L14.994 8 7.65 15.142a.5.5 0 0 0 .698.716l7.349-7.146a.992.992 0 0 0 0-1.424L8.348.142a.5.5 0 0 0-.706.01Z" />
    </svg>
  );
}

function ChevronLeft({className}: {className?: string}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.471 13.752.327 8.732a1.08 1.08 0 0 1 0-1.546l5.144-5.02a.727.727 0 0 1 1.032.015c.28.29.274.753-.015 1.035L1.627 7.959l4.861 4.744a.734.734 0 0 1 .015 1.035.727.727 0 0 1-1.032.014" />
    </svg>
  );
}

function SearchIcon({className}: {className?: string}) {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" className={className} fill="currentColor">
      <path d="M2.682 3.175a5.869 5.869 0 1 1 9.377 7.06 5.869 5.869 0 0 1-9.377-7.06Zm5.28-1.303a4.869 4.869 0 1 0-1.183 9.665 4.869 4.869 0 0 0 1.183-9.665Z" />
      <path d="M10.813 10.147a.5.5 0 0 1 .707 0l4.164 4.164a.5.5 0 0 1-.708.707l-4.163-4.164a.5.5 0 0 1 0-.707Z" />
    </svg>
  );
}

function GlobeIcon({className}: {className?: string}) {
  return (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" className={className}>
      <path d="M12 22.0586C17.5228 22.0586 22 17.5814 22 12.0586C22 6.53575 17.5228 2.05859 12 2.05859C6.47715 2.05859 2 6.53575 2 12.0586C2 17.5814 6.47715 22.0586 12 22.0586Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.99961 3.05859H8.99961C7.04961 8.89859 7.04961 15.2186 8.99961 21.0586H7.99961" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3.05859C16.95 8.89859 16.95 15.2186 15 21.0586" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16.0586V15.0586C8.84 17.0086 15.16 17.0086 21 15.0586V16.0586" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9.0582C8.84 7.1082 15.16 7.1082 21 9.0582" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccessibilityIcon({className}: {className?: string}) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className={className} fill="currentColor">
      <g stroke="none" strokeWidth="1" fillRule="evenodd">
        <g transform="translate(0, 4)" fillRule="nonzero">
          <path d="M5.44782871,4.37271117 L1.58059332,15.0196037 L0,15.0196037 L4.45293331,3.33769883 L5.47190122,3.33769883 L5.44782871,4.37271117 Z M8.68924924,15.0196037 L4.81398577,4.37271117 L4.78991325,3.33769883 L5.80888116,3.33769883 L10.2778472,15.0196037 L8.68924924,15.0196037 Z M8.48866454,10.6951197 L8.48866454,11.9627117 L1.92558961,11.9627117 L1.92558961,10.6951197 L8.48866454,10.6951197 Z" />
          <path d="M17.7899729,1.33072512 L12.8178433,15.0196037 L10.7855882,15.0196037 L16.5108787,0 L17.8209585,0 L17.7899729,1.33072512 Z M21.9575337,15.0196037 L16.9750756,1.33072512 L16.94409,0 L18.2541698,0 L24,15.0196037 L21.9575337,15.0196037 Z M21.6996726,9.45945222 L21.6996726,11.0893643 L13.2613831,11.0893643 L13.2613831,9.45945222 L21.6996726,9.45945222 Z" />
        </g>
      </g>
    </svg>
  );
}

function ThemeIcon({className}: {className?: string}) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className={className} fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.155.011a1.668 1.668 0 0 0-.382.108 10.577 10.577 0 0 0-3.87 3.33A10.336 10.336 0 0 0 .029 8.64c-.058.75-.024 1.634.091 2.408.286 1.918 1.159 3.77 2.494 5.294 1.674 1.91 3.953 3.167 6.378 3.517.263.038.542.066.948.093a13.01 13.01 0 0 0 1.38-.008 10.31 10.31 0 0 0 4.575-1.434 10.157 10.157 0 0 0 3.891-4.186c.055-.11.113-.235.13-.278a1.41 1.41 0 0 0 .016-.91 1.351 1.351 0 0 0-.348-.56 1.448 1.448 0 0 0-.996-.43 1.31 1.31 0 0 0-.407.04c-.183.045-.307.102-.541.246a6.765 6.765 0 0 1-2.932.955 7.372 7.372 0 0 1-1.48-.02c-1.247-.146-2.51-.66-3.56-1.446a8.044 8.044 0 0 1-1.313-1.25 7.42 7.42 0 0 1-1.63-3.57 7.598 7.598 0 0 1 .765-4.652l.17-.335c.127-.25.18-.495.163-.766A1.42 1.42 0 0 0 7.199.253a1.482 1.482 0 0 0-.558-.23A1.97 1.97 0 0 0 6.155.01Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="m12.994 3.691-2.12 1.167a.585.585 0 0 0-.298.499v.007a.588.588 0 0 0 .298.492l2.12 1.15 1.161 2.134.004.006a.584.584 0 0 0 .992 0l1.164-2.141 2.118-1.166a.56.56 0 0 0 .215-.787.584.584 0 0 0-.211-.21L16.315 3.69l-1.161-2.135-.003-.006a.585.585 0 0 0-.78-.204.584.584 0 0 0-.213.204L12.995 3.69Z" />
    </svg>
  );
}

function CalendarIcon({className}: {className?: string}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M1.547 3A.547.547 0 0 0 1 3.546v10.907c0 .302.245.547.547.547h12.907a.546.546 0 0 0 .546-.546V3.546A.546.546 0 0 0 14.454 3H1.546ZM0 3.546C0 2.692.692 2 1.547 2h12.907C15.307 2 16 2.692 16 3.546v10.907c0 .855-.692 1.547-1.546 1.547H1.546A1.547 1.547 0 0 1 0 14.454V3.546Z" />
      <path d="M0 6.5A.5.5 0 0 1 .5 6h15a.5.5 0 1 1 0 1H.5a.5.5 0 0 1-.5-.5ZM4.5 0a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5Zm7 0a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5Z" />
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
          <div className="flex items-center gap-2">
            <button className="p-2 text-white/80 hover:text-white" aria-label="Search">
              <SearchIcon className="w-4.25 h-4" />
            </button>
            <button className="p-2 text-white/80 hover:text-white" aria-label="Accessibility">
              <AccessibilityIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/80 hover:text-white flex items-center gap-1.5 text-sm">
              <GlobeIcon className="w-5 h-5" />
              English
            </button>
            <button className="p-2 text-white/80 hover:text-white" aria-label="Theme">
              <ThemeIcon className="w-5 h-5" />
            </button>
            <Button size="sm" className="rounded-md text-xs px-4 bg-primary text-white ms-1">
              Sign in
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="hover:underline cursor-pointer">Home</span>
          <ChevronRight className="w-3 h-3" />
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
                  <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                  {item.date}
                </div>
                <p className="text-sm font-medium text-[#12121B]">{item.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
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
            <ChevronRight className="w-3 h-3" />
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
