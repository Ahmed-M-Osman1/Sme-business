'use client';

import {useState} from 'react';
import {formatPriceWithCurrency} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';

export interface CompareQuote {
  id: string;
  name: string;
  logo: string;
  rating: number;
  shariahCompliant: boolean;
  total: number;
  productLines: {name: string; limit: string; mandatory: boolean}[];
}

interface TammCompareViewProps {
  quotes: CompareQuote[];
  monthly: boolean;
  coverageType: string;
  onSelect: (insurerId: string, total: number) => void;
  onBack: () => void;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#169F9F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DashIcon() {
  return <span className="text-[#CBD5E0]">–</span>;
}

function SectionHeader({label, expanded, onToggle}: {label: string; expanded: boolean; onToggle: () => void}) {
  return (
    <tr style={{background: '#F8FAFB', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0'}}>
      <td colSpan={99} className="px-5 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-semibold text-[#12121B] transition-opacity hover:opacity-70">
          {label}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

function CompareRow({label, cells}: {label: string; cells: React.ReactNode[]}) {
  return (
    <tr style={{borderBottom: '1px solid #F1F5F9'}}>
      <td
        className="sticky inset-s-0 bg-white px-5 py-3 text-xs font-medium text-[#475569]"
        style={{minWidth: '140px', borderRight: '1px solid #F1F5F9'}}>
        {label}
      </td>
      {cells.map((cell, i) => (
        <td key={i} className="px-5 py-3 text-center text-xs text-[#12121B]">
          {cell}
        </td>
      ))}
    </tr>
  );
}

export function TammCompareView({quotes, monthly, coverageType, onSelect, onBack}: TammCompareViewProps) {
  const {t, locale} = useI18n();
  const cp = t.tamm.compare;
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);

  const fmt = (n: number) => formatPriceWithCurrency(n, t.common.currency, locale);
  const monthlyAmt = (annual: number) => Math.round(annual * 1.08 / 12);

  const allProductNames = Array.from(
    new Set(quotes.flatMap((q) => q.productLines.map((p) => p.name))),
  );

  return (
    <div className="pb-12">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#12121B]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#12121B]">{cp.title}</h1>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            {quotes.length} {quotes.length !== 1 ? cp.quotesSelected : cp.quotesSelected}
          </p>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-xl" style={{border: '1px solid #E2E8F0'}}>
        <table className="w-full border-collapse" style={{minWidth: `${140 + quotes.length * 180}px`}}>

          <thead>
            <tr style={{borderBottom: '2px solid #E2E8F0'}}>
              <th
                className="sticky inset-s-0 bg-[#F8FAFB] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]"
                style={{minWidth: '140px', borderRight: '1px solid #F1F5F9'}}>
                {coverageType || 'Coverage'}
              </th>
              {quotes.map((q) => (
                <th key={q.id} className="bg-white px-5 py-4 text-center" style={{minWidth: '180px'}}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg"
                      style={{border: '1px solid #E2E8F0', background: '#F8FAFB'}}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.logo}
                        alt={q.name}
                        className="h-full w-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <p className="text-xs font-bold leading-tight text-[#12121B]">{q.name}</p>
                    <div>
                      <p className="text-lg font-bold text-[#12121B]">
                        {fmt(monthly ? monthlyAmt(q.total) : q.total)}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">{monthly ? `/ ${t.tamm.results.monthly}` : `/ ${t.tamm.results.annual}`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelect(q.id, q.total)}
                      className="w-full rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{background: '#169F9F'}}>
                      {cp.select}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <SectionHeader label={cp.summary} expanded={summaryOpen} onToggle={() => setSummaryOpen((p) => !p)} />
            {summaryOpen && (
              <>
                <CompareRow
                  label={cp.rating}
                  cells={quotes.map((q) => (
                    <span className="font-medium text-[#12121B]">{q.rating.toFixed(1)} ★</span>
                  ))}
                />
                <CompareRow
                  label={cp.shariahCompliant}
                  cells={quotes.map((q) =>
                    q.shariahCompliant ? (
                      <span className="inline-flex items-center gap-1 font-medium text-[#169F9F]">
                        <CheckIcon /> {t.common.yes}
                      </span>
                    ) : (
                      <DashIcon />
                    ),
                  )}
                />
                <CompareRow
                  label={monthly ? cp.annualEquivalent : cp.monthlyEquivalent}
                  cells={quotes.map((q) => (
                    <span className="font-medium text-[#475569]">
                      {monthly ? fmt(q.total) : fmt(monthlyAmt(q.total))}
                    </span>
                  ))}
                />
              </>
            )}

            <SectionHeader
              label={cp.productsCovered}
              expanded={productsOpen}
              onToggle={() => setProductsOpen((p) => !p)}
            />
            {productsOpen &&
              allProductNames.map((productName) => (
                <CompareRow
                  key={productName}
                  label={productName}
                  cells={quotes.map((q) => {
                    const line = q.productLines.find((p) => p.name === productName);
                    if (!line) return <DashIcon />;
                    return <span className="font-medium text-[#169F9F]">{line.limit}</span>;
                  })}
                />
              ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{color: '#169F9F'}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {cp.backToQuotes}
      </button>
    </div>
  );
}
