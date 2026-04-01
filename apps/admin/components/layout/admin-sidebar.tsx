'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const NAV_ITEMS = [
  {label: 'Dashboard', href: '/', icon: '□'},
  {label: 'Quotes', href: '/quotes', icon: '≡'},
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white min-h-screen p-4">
      <Link href="/" className="text-2xl font-black italic text-gray-900 block mb-8 px-3">
        Shory.
      </Link>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-[#1D68FF]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
