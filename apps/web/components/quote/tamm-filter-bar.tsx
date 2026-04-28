'use client';

import {useI18n} from '@/lib/i18n';

interface TammFilterBarProps {
  sortOrder: 'low-high' | 'high-low';
  onSortChange: (order: 'low-high' | 'high-low') => void;
  tabCounts?: Record<string, number>;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onFilterClick?: () => void;
  shariahOnly?: boolean;
  onShariahChange?: (v: boolean) => void;
  compareCount?: number;
  onCompareClick?: () => void;
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 3.5H12.5M3.5 7H10.5M5.5 10.5H8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function TammFilterBar({
  sortOrder,
  onSortChange,
  tabCounts = {},
  activeTab,
  onTabChange,
  onFilterClick,
  shariahOnly = false,
  onShariahChange,
  compareCount = 0,
  onCompareClick,
}: TammFilterBarProps) {
  const {t} = useI18n();
  const fb = t.tamm.filterBar;

  const TABS = [fb.individualQuotes, fb.bundleDeals];
  const currentTab = activeTab ?? TABS[0];

  const toggleSort = () => {
    onSortChange(sortOrder === 'low-high' ? 'high-low' : 'low-high');
  };

  return (
    <div className="space-y-3">
      {/* Coverage type tabs */}
      <div className="flex items-center gap-0 border-b border-[#E2E8F0]">
        {TABS.map((tab) => {
          const isActive = tab === currentTab;
          const count = tabCounts[tab];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange?.(tab)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all relative"
              style={{
                color: isActive ? '#12121B' : '#94A3B8',
                borderBottom: isActive ? '2px solid #169F9F' : '2px solid transparent',
                marginBottom: '-1px',
              }}>
              {tab}
              {count !== undefined && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: isActive ? '#E8F7F7' : '#F1F5F9',
                    color: isActive ? '#169F9F' : '#94A3B8',
                  }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort + All Filters + Compare row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* All Filters pill */}
          <button
            type="button"
            onClick={onFilterClick}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              border: '1px solid #E2E8F0',
              color: '#475569',
              background: 'white',
            }}>
            <FilterIcon />
            {fb.allFilters}
          </button>

          {/* Shariah Compliant pill */}
          <button
            type="button"
            onClick={() => onShariahChange?.(!shariahOnly)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              border: shariahOnly ? '1.5px solid #169F9F' : '1px solid #E2E8F0',
              color: shariahOnly ? '#169F9F' : '#475569',
              background: shariahOnly ? '#E8F7F7' : 'white',
            }}>
            {shariahOnly && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4.5 7.5L8 3" stroke="#169F9F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {fb.shariahCompliant}
          </button>
        </div>

        <div className="flex items-center gap-2 ms-auto">
          {/* Sort button */}
          <button
            type="button"
            onClick={toggleSort}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              border: '1px solid #E2E8F0',
              color: '#475569',
              background: 'white',
            }}>
            {fb.sortByPrice} ({sortOrder === 'low-high' ? fb.lowHigh : fb.highLow})
            <ChevronDown />
          </button>

          {/* Compare Quotes */}
          <button
            type="button"
            onClick={onCompareClick}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: compareCount > 0 ? '#169F9F' : '#E8F7F7',
              color: compareCount > 0 ? 'white' : '#169F9F',
            }}>
            {fb.compareQuotes}
            {compareCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
                {compareCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
