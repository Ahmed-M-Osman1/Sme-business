'use client';

import {Suspense} from 'react';
import {CompanyDetails} from '@/components/quote/company-details';

export default function CompanyDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CompanyDetails />
    </Suspense>
  );
}
