'use client';

import {Suspense} from 'react';
import {QuoteResults} from '@/components/quote/quote-results';
import {LottieAnimation} from '@/components/ui/lottie-animation';

export default function QuoteResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LottieAnimation path="/lottie/search.lottie" className="w-52 h-52" />
            <p className="text-base font-medium text-gray-500">Finding the best quotes...</p>
          </div>
        </div>
      }
    >
      <QuoteResults />
    </Suspense>
  );
}
