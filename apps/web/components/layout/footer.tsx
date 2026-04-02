'use client';

import Link from 'next/link';
import {Badge} from '@shory/ui';
import {useI18n} from '@/lib/i18n';

export function Footer() {
  const {t} = useI18n();

  const personalLinks = [
    t.footer.carInsurance,
    t.footer.nonUaeVehicles,
    t.footer.healthInsurance,
    t.footer.homeInsurance,
    t.footer.petInsurance,
  ];

  const corporateLinks = [
    {label: t.footer.smeInsurance, href: '/quote/start'},
    {label: t.footer.travelInsurance, href: '#'},
  ];

  const companyLinks = [
    t.footer.helpAndSupport,
    t.footer.blogs,
    t.footer.newsroom,
    t.footer.sitemap,
    t.footer.legal,
    t.footer.aboutUs,
    t.footer.contactUs,
  ];

  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">{t.footer.personalInsurance}</h4>
            <ul className="space-y-2">
              {personalLinks.map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-text-muted hover:text-text transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text mb-4">{t.footer.corporateInsurance}</h4>
            <ul className="space-y-2">
              {corporateLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-text-muted hover:text-text transition-colors duration-200">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text mb-4">{t.footer.companyAndHelp}</h4>
            <ul className="space-y-2">
              {companyLinks.map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-text-muted hover:text-text transition-colors duration-200">{label}</Link>
                </li>
              ))}
              <li>
                <Badge className="bg-primary text-white text-xs rounded-full px-3 py-1">{t.footer.wereHiring}</Badge>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text mb-4">{t.footer.downloadApp}</h4>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-text text-white rounded-lg px-4 py-2 text-xs font-medium">
                <p>{t.footer.download}</p>
                <p className="font-bold">{t.footer.shoryApp}</p>
              </div>
              <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center">
                <span className="text-xs text-text-muted">QR</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📞</span>
                <span className="text-sm font-semibold text-text">{t.footer.callUsAt}</span>
              </div>
              <div className="border border-border rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-text-muted">{t.footer.callHours}</p>
                <p className="text-sm font-semibold text-primary mt-1" dir="ltr">{t.footer.callNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-black italic text-text">Shory.</span>
            <div className="flex items-center gap-4">
              {['f', '📷', '𝕏', 'in', '💬'].map((icon) => (
                <Link key={icon} href="#" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text text-xs transition-colors duration-200">{icon}</Link>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-[10px] text-text-muted leading-relaxed max-w-2xl">
              <p>{t.footer.licensedBy}</p>
              <p>&copy; 2026 {t.footer.allRightsReserved}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
