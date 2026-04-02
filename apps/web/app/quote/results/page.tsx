'use client';

import {Suspense} from 'react';
import {QuoteResults} from '@/components/quote/quote-results';
import {LottieAnimation} from '@/components/ui/lottie-animation';
import {useI18n} from '@/lib/i18n';

export default function QuoteResultsPage() {
  const {t} = useI18n();

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LottieAnimation path="/lottie/search.lottie" className="w-52 h-52" />
            <p className="text-base font-medium text-gray-500">{t.results.findingQuotes}</p>
          </div>
        </div>
      }
    >
      <QuoteResults />
    </Suspense>
  );
}
