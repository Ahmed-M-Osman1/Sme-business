'use client';

import {Suspense} from 'react';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';
import {TammReviewPay} from '@/components/quote/tamm-review-pay';

export default function TammCheckoutPage() {
  return (
    <TammPageLayout currentStep={5}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#009688] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <TammReviewPay />
      </Suspense>
    </TammPageLayout>
  );
}
