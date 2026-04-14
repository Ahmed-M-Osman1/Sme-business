import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Source_Sans_3} from 'next/font/google';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';
import {ErrorBoundary} from '@/components/error-boundary';
import {I18nProvider} from '@/lib/i18n';
import {SessionProviderWrapper} from '@/components/layout/session-provider-wrapper';
import {getBrand} from '@/lib/brand';

import './globals.css';
import './globals-tamm.css';

/* ── Shory fonts ── */
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

/* ── TAMM font (Google Fonts) ── */
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

/* ── Arabic font (shared) ── */
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

const brand = getBrand();
const isTamm = brand.id === 'tamm';

export const metadata: Metadata = {
  title: brand.metadata.title,
  description: brand.metadata.description,
};

const fontVariables = isTamm
  ? `${sourceSans.variable} ${pingArLt.variable}`
  : `${blissPro.variable} ${pingArLt.variable}`;

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      data-brand={brand.id}
      className={`h-full antialiased ${fontVariables}`}
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
