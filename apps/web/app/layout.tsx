import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {Navbar} from '@/components/layout/navbar';
import {Footer} from '@/components/layout/footer';
import {I18nProvider} from '@/lib/i18n';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider>
          <Navbar />
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
