'use client';

import {useI18n} from '@/lib/i18n';

export function TrustBadges() {
  const {t} = useI18n();
  return (
    <section className="py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-4 sm:flex-row sm:gap-16 sm:px-6 lg:px-8">
        {/* Central Bank Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-4h6v4" />
              <path d="M3 7h18" />
            </svg>
          </div>
          <p className="text-xs leading-tight text-gray-500">
            {t.footer.licensedBy}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-gray-200 sm:block" />

        {/* Google Rating */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[#4285F4]">G</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">4.9</span>
              <div className="flex">
                {Array.from({length: 5}).map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              More than 8,000 reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
