'use client';

import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';

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
      {/* Quote journey header */}
      <header className="border-b border-border bg-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-text transition-colors duration-200 flex items-center gap-1"
          >
            <span>←</span>
            <span>Back</span>
          </Link>
          <span className="text-sm font-medium text-text">
            AI Insurance Advisor
          </span>
          <Link href="/" className="text-xl font-black italic text-text">
            Shory.
          </Link>
        </div>
      </header>

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
