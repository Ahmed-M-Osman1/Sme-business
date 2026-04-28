'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';

const ACCOUNTS: Record<string, object> = {
  '784197239274828': {
    name: 'Ahmed Osman',
    businessName: 'Al Massry Consulting LLC',
    licenceNumber: 'CN-2025-98765',
    emiratesId: '784197239274828',
    businessType: 'consulting',
    activity: 'Professional Services',
    employees: '2-5',
    revenue: '500k-1m',
    location: 'Abu Dhabi City',
  },
  '784198971460518': {
    name: 'Ed Glenn',
    emiratesId: '784198971460518',
    companies: [
      {
        businessName: 'Al Rashidi Café & Grill',
        licenceNumber: 'CN-2024-44521',
        businessType: 'cafe-restaurant',
        activity: 'Food & Beverage',
        employees: '6-20',
        revenue: '500k-1m',
        location: 'Abu Dhabi City',
      },
      {
        businessName: 'Al Rashidi Tech Hub',
        licenceNumber: 'CN-2024-78903',
        businessType: 'it-technology',
        activity: 'Technology',
        employees: '2-5',
        revenue: 'under-500k',
        location: 'Abu Dhabi City',
      },
    ],
  },
};

export default function TammLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    const cleaned = identifier.replace(/\D/g, '');
    const account = ACCOUNTS[cleaned];
    if (!account) {
      setError(
        'Invalid Emirates ID, email, or phone. Please try again.',
      );
      return;
    }
    setError('');
    setLoading(true);

    sessionStorage.setItem('uaepass-data', JSON.stringify(account));
    sessionStorage.setItem('tamm-authenticated', 'true');

    setTimeout(() => {
      router.push('/tamm/quote/start');
    }, 800);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{background: '#fff'}}>
      {/* Top gradient bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, #00B2A9 0%, #1D68FF 50%, #00B2A9 100%)',
        }}
      />

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm flex flex-col items-center gap-5">
          {/* UAE PASS logo */}
          <Image
            src="/images/uaepass-logo.png"
            alt="UAE PASS"
            width={72}
            height={72}
            className="w-16 h-16 object-contain"
          />

          {/* Title */}
          <h1 className="text-xl font-semibold text-[#1a2233] tracking-tight">
            Login to UAE PASS
          </h1>

          {/* Input */}
          <div className="w-full flex flex-col gap-1">
            <input
              type="text"
              placeholder="Emirates ID, email, or phone eg. 971500000000"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-full px-5 py-3 text-sm text-[#1a2233] outline-none transition-all"
              style={{
                border: error
                  ? '1.5px solid #EF4444'
                  : '1.5px solid #CBD5E0',
                background: '#fff',
              }}
            />
            {error && (
              <p className="text-xs text-red-500 px-2">{error}</p>
            )}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 self-start cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-[#00B2A9] cursor-pointer"
            />
            <span className="text-sm text-[#4a5568]">
              Remember me
            </span>
          </label>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading || !identifier}
            className="w-full rounded-full py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{background: '#5b6d84'}}>
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Login'
            )}
          </button>

          {/* Divider line */}
          <div
            className="w-full h-px"
            style={{background: '#E2E8F0'}}
          />

          {/* Create account row */}
          <p className="text-sm text-[#4a5568] text-center">
            Don&apos;t have UAEPASS account?{' '}
            <span className="text-[#00B2A9] cursor-not-allowed opacity-60">
              Create new account
            </span>
          </p>

          {/* Recover account */}
          <span className="text-sm text-[#00B2A9] cursor-not-allowed opacity-60">
            Recover your account
          </span>
        </div>
      </div>

      {/* Bottom teal separator */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, #00B2A9, transparent)',
        }}
      />

      {/* Footer */}
      <footer className="py-4 px-4">
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-2">
          {[
            'Home',
            'About',
            'Support',
            'FAQ',
            'Kiosk Locations',
            'Service Provider',
          ].map((item) => (
            <span
              key={item}
              className="text-xs text-[#4a5568] cursor-not-allowed hover:text-[#00B2A9] transition-colors">
              {item}
            </span>
          ))}
        </nav>
        <p className="text-center text-[11px] font-medium text-[#1a2233]">
          Copyright © 2026 UAE PASS All rights reserved.
        </p>
      </footer>
    </div>
  );
}
