'use client';

import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useI18n} from '@/lib/i18n';

const VERSION = 'V4.22.81';
const BUILD_HASH = 'Q8OHSXMN4I';

export interface TammActionRowProps {
  onBack?: () => void;
  onExit?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function TammActionRow({
  onBack,
  onExit,
  onNext,
  nextLabel,
  nextDisabled = false,
}: TammActionRowProps) {
  const router = useRouter();
  const {t} = useI18n();
  const f = t.tamm.footer;

  const handleBack = onBack ?? (() => router.back());
  const handleExit = onExit ?? (() => router.push('/tamm'));

  return (
    <div className="border-t border-[#E8ECF0] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-base font-semibold text-[#169F9F] hover:opacity-80 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {f.back}
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={handleExit}
            className="text-base font-semibold text-[#169F9F] hover:opacity-80 transition-opacity">
            {f.exitService}
          </button>
          {onNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className={`rounded-full px-7 py-3 text-base font-semibold text-white transition-all min-w-32 ${
                nextDisabled
                  ? 'bg-[#169F9F] opacity-40 cursor-not-allowed'
                  : 'bg-[#169F9F] hover:bg-[#0E8B8B] cursor-pointer'
              }`}>
              {nextLabel ?? f.next}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TammFooter() {
  const {t} = useI18n();
  const f = t.tamm.footer;

  return (
    <footer className="bg-[#12121B] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Brand */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/images/tamm-logo.svg"
                alt=""
                width={48}
                height={48}
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight">
                {f.brandName}
              </p>
              <p className="text-sm text-white/60 mt-1">{f.getItOnApps}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <StoreBadge label={f.appStore} icon="apple" />
                <StoreBadge label={f.googlePlay} icon="google" />
                <StoreBadge label={f.appGallery} icon="huawei" />
              </div>
            </div>
          </div>

          {/* Links + copyright */}
          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
              <button type="button" className="hover:text-white transition-colors cursor-default">
                {f.copyrights}
              </button>
              <button type="button" className="hover:text-white transition-colors cursor-default">
                {f.termsConditions}
              </button>
              <button type="button" className="hover:text-white transition-colors cursor-default">
                {f.privacyPolicy}
              </button>
            </nav>
            <p className="text-sm text-white/70">{f.rightsReserved}</p>
            <p className="text-[11px] text-white/40 font-mono tracking-wider">
              {BUILD_HASH} &nbsp; {VERSION}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StoreBadge({label, icon}: {label: string; icon: 'apple' | 'google' | 'huawei'}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black border border-white/15 cursor-default"
      title={label}>
      <StoreIcon kind={icon} />
      <div className="text-start leading-tight">
        <div className="text-[8px] uppercase tracking-wider text-white/60">
          {icon === 'huawei' ? 'Explore it on' : 'Get it on'}
        </div>
        <div className="text-[11px] font-semibold">
          {icon === 'apple' ? 'App Store' : icon === 'google' ? 'Google Play' : 'AppGallery'}
        </div>
      </div>
    </div>
  );
}

function StoreIcon({kind}: {kind: 'apple' | 'google' | 'huawei'}) {
  if (kind === 'apple') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    );
  }
  if (kind === 'google') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path fill="#34A853" d="M3.6 20.5L13 11l3.5 3.5-9.4 9.4c-.7.4-1.5.6-2.3.4-.9-.2-1.6-1-1.8-1.9-.1-.7 0-1.4.6-1.9z" />
        <path fill="#FBBC04" d="M21 11l-3.5 2-4-4 4-4 3.5 2c.9.5 1.4 1.4 1.4 2.4 0 1.1-.5 1.9-1.4 1.6z" />
        <path fill="#4285F4" d="M13 11L3.6 1.5c-.6-.5-1-1-1-1.4 0-.4.4-.8 1-1.1.3-.1.6-.2.9-.2.4 0 .8.1 1.1.3L17 7l-4 4z" />
        <path fill="#EA4335" d="M13 11l4 4-12 7c-.4.2-.8.3-1.2.3-.4 0-.7-.1-1.1-.3-.6-.3-1-.7-1-1.1-.1-.5.4-.9 1-1.4L13 11z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#C8102E" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path
        d="M7 9c0 1.5 1 3 3 3M17 9c0 1.5-1 3-3 3M12 8v8M8 16h8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
