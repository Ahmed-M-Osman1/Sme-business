import Link from 'next/link';
import {Button} from '@shory/ui';

const NAV_LINKS = [
  {label: 'Business Insurance', href: '#products'},
  {label: 'About', href: '#about'},
  {label: 'Help', href: '#help'},
] as const;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-primary">
          Shory SME
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted hover:text-text transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-primary text-white rounded-xl px-6 hover:opacity-80 transition-all duration-200"
          >
            <Link href="/quote/start">Start Quote</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
