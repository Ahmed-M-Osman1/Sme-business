import Link from 'next/link';
import {Badge} from '@shory/ui';

const PERSONAL_LINKS = [
  'Car Insurance',
  'Non-UAE Vehicles Insurance',
  'Health insurance',
  'Home Insurance',
  'Pet insurance',
] as const;

const CORPORATE_LINKS = ['Travel Insurance for Agencies'] as const;

const COMPANY_LINKS = [
  'Help and Support',
  'Blogs',
  'Newsroom',
  'Sitemap',
  'Legal',
  'About Us',
  'Contact us',
] as const;

const SOCIAL_ICONS = ['f', '📷', '𝕏', 'in', '💬'] as const;

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Personal Insurance */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Personal Insurance
            </h4>
            <ul className="space-y-2">
              {PERSONAL_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate Insurance */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Corporate Insurance
            </h4>
            <ul className="space-y-2">
              {CORPORATE_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Help */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Company &amp; Help
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Badge className="bg-primary text-white text-xs rounded-full px-3 py-1">
                  We&apos;re Hiring
                </Badge>
              </li>
            </ul>
          </div>

          {/* Download & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">
              Download our app
            </h4>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-text text-white rounded-lg px-4 py-2 text-xs font-medium">
                <p>Download</p>
                <p className="font-bold">Shory App</p>
              </div>
              <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center">
                <span className="text-xs text-text-muted">QR</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📞</span>
                <span className="text-sm font-semibold text-text">
                  Call us at
                </span>
              </div>
              <div className="border border-border rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-text-muted">
                  Mon - Sun: 08:00 AM - 10:00 PM
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  800 SHORY (74679)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-black italic text-text">Shory.</span>
            <div className="flex items-center gap-4">
              {SOCIAL_ICONS.map((icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text text-xs transition-colors duration-200"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-[10px] text-text-muted leading-relaxed max-w-2xl">
              <p>
                Shory Insurance Brokers LLC is authorized, regulated and
                licensed by the Central Bank of the UAE with License Number 287.
              </p>
              <p>
                Shory Insurance Brokers LLC is located in 29th Floor Al Khatem
                Tower, Al Maryah Island, Abu Dhabi, UAE &copy; 2026 Shory. All
                rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {['MC', 'V', 'AP', 'AE', 'TB', 'MP'].map((pay) => (
                  <div
                    key={pay}
                    className="w-8 h-5 bg-surface rounded text-[8px] flex items-center justify-center text-text-muted"
                  >
                    {pay}
                  </div>
                ))}
              </div>
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
                <span className="text-[6px] text-text-muted text-center leading-tight">
                  Central
                  <br />
                  Bank
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
