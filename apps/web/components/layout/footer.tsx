import Link from 'next/link';

const FOOTER_LINKS = {
  Products: [
    {label: 'Property Insurance', href: '#'},
    {label: 'Liability Insurance', href: '#'},
    {label: "Workers' Compensation", href: '#'},
    {label: 'Fleet Insurance', href: '#'},
  ],
  Company: [
    {label: 'About Us', href: '#'},
    {label: 'Newsroom', href: '#'},
    {label: 'Careers', href: '#'},
  ],
  Support: [
    {label: 'Help Center', href: '#'},
    {label: 'Contact Us', href: '#'},
    {label: 'Legal', href: '#'},
  ],
} as const;

export function Footer() {
  return (
    <footer className="bg-text text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Shory SME</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Compare and buy SME insurance in the UAE. Top insurers, best
              prices.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Shory. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Licensed by the Central Bank of the UAE
          </p>
        </div>
      </div>
    </footer>
  );
}
