import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import {AdminSidebar} from '@/components/layout/admin-sidebar';
import {AdminHeader} from '@/components/layout/admin-header';
import {ClientLayoutWrapper} from '@/components/layout/client-layout-wrapper';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shory Admin — Dashboard',
  description: 'Shory SME Admin Portal',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex font-sans">
        <ClientLayoutWrapper>
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 bg-gray-50">{children}</main>
          </div>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
