import type {Metadata} from 'next';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';
import {ErrorBoundary} from '@/components/error-boundary';
import {I18nProvider} from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shory — Compare and Buy Insurance in the UAE',
  description:
    'Top insurers. Best prices. One app. Get instant insurance quotes from leading insurers.',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col" style={{fontFamily: "'BlissPro', 'PingARLT', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>
        <ErrorBoundary>
          <I18nProvider>
            <Navbar />
            {children}
            <Footer />
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
