import Link from 'next/link';

export default function QuoteLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
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
          <Link
            href="/"
            className="text-xl font-black italic text-text"
          >
            Shory.
          </Link>
        </div>
      </header>

      {/* Quote content */}
      <div className="flex-1 flex flex-col py-8 bg-surface">
        {children}
      </div>
    </div>
  );
}
