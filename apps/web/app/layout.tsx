import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';
import {ErrorBoundary} from '@/components/error-boundary';
import {I18nProvider} from '@/lib/i18n';
import {SessionProviderWrapper} from '@/components/layout/session-provider-wrapper';
import './globals.css';

const blissPro = localFont({
  src: [
    {
      path: '../public/fonts/BlissProLight.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/BlissProRegular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/BlissProMedium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/BlissProExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-bliss-pro',
  display: 'swap',
});

const pingArLt = localFont({
  src: [
    {
      path: '../public/fonts/PingARLTRegular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PingARLTMedium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/PingARLTBold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ping-arlt',
  display: 'swap',
});

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
      className={`h-full antialiased ${blissPro.variable} ${pingArLt.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <SessionProviderWrapper>
            <I18nProvider>
              <Navbar />
              {children}
              <Footer />
            </I18nProvider>
          </SessionProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
