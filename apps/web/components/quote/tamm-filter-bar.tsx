'use client';

import {Button} from '@shory/ui';

interface TammFilterBarProps {
  sortOrder: 'low-high' | 'high-low';
  onSortChange: (order: 'low-high' | 'high-low') => void;
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0">
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterPill({label}: {label: string}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 border border-[#DEE2E6] rounded-full px-4 py-1.5 text-sm text-gray-700 hover:border-gray-400 transition-colors">
      {label}
      <ChevronDown />
    </button>
  );
}

export function TammFilterBar({sortOrder, onSortChange}: TammFilterBarProps) {
  const toggleSort = () => {
    onSortChange(sortOrder === 'low-high' ? 'high-low' : 'low-high');
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left side: filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <FilterPill label="Coverage" />
          <FilterPill label="Industry" />
          <FilterPill label="All Filters" />
        </div>

        {/* Right side: sort */}
        <button
          type="button"
          onClick={toggleSort}
          className="inline-flex items-center gap-1.5 border border-[#DEE2E6] rounded-full px-4 py-1.5 text-sm text-gray-700 hover:border-gray-400 transition-colors">
          {sortOrder === 'low-high' ? 'Price: Low to High' : 'Price: High to Low'}
          <ChevronDown />
        </button>
      </div>

      {/* Compare button */}
      <div className="mt-3">
        <Button
          variant="default"
          className="rounded-full">
          Compare Quotes
        </Button>
      </div>
    </div>
  );
}
