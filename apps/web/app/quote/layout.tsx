'use client';

import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';

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
      {/* Quote content */}
      <div className="flex-1 flex flex-col py-8 bg-surface relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Loading...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
