import Link from 'next/link';
import {Button} from '@shory/ui';

const NAV_LINKS = [
  {label: 'Personal', href: '#'},
  {label: 'Business', href: '#'},
  {label: 'Company', href: '#'},
  {label: 'Help', href: '#'},
] as const;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black italic text-text">
            Shory.
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text hover:text-text-muted transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 gap-2 border-border text-sm font-medium"
          >
            <span className="inline-block w-6 h-4 rounded-sm overflow-hidden relative">
              <span className="absolute inset-0 bg-[#00732F]" />
              <span className="absolute inset-0 bg-[#EF3340]" style={{clipPath: 'polygon(0 0, 33% 0, 33% 100%, 0 100%)'}} />
              <span className="absolute top-0 left-0 w-full h-1/3 bg-[#00732F]" />
              <span className="absolute bottom-0 left-0 w-full h-1/3 bg-black" />
            </span>
            عربي
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-6 border-border text-sm font-medium"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}
