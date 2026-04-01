'use client';

import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {LottieAnimation} from '@/components/ui/lottie-animation';

export default function QuoteLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col py-8 bg-surface relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LottieAnimation path="/lottie/search.lottie" className="w-52 h-52" />
              <p className="text-base font-medium text-gray-500">Finding the best quotes...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
