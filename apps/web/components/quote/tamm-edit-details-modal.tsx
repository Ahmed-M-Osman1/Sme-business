'use client';

import {useEffect, useState} from 'react';
import {useI18n} from '@/lib/i18n';

interface TammEditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (next: EditDetailsValues) => void;

  /** Read-only display: business type label */
  businessTypeLabel: string;
  /** Read-only display: business name (optional) */
  businessName?: string;

  initialEmployees: string;
  initialRevenue: string;
  initialEmirate: string;
  /** Active product IDs that should expose a coverage limit selector. */
  activeProducts: Array<{id: string; name: string; mandatory?: boolean}>;
  initialLimits: Record<string, string>;

  emirateOptions: Array<{label: string; value: string}>;
}

export interface EditDetailsValues {
  employees: string;
  revenue: string;
  emirate: string;
  limits: Record<string, string>;
}

const EMPLOYEE_BANDS: string[] = ['1', '2-5', '6-20', '21-50', '51-100', '100+'];
const REVENUE_BANDS: string[] = [
  'under-500k',
  '500k-1m',
  '1m-5m',
  '5m-10m',
  'over-10m',
];
const LIMIT_OPTIONS: Array<'1M' | '2M' | '5M'> = ['1M', '2M', '5M'];

export function TammEditDetailsModal({
  open,
  onClose,
  onConfirm,
  businessTypeLabel,
  businessName,
  initialEmployees,
  initialRevenue,
  initialEmirate,
  activeProducts,
  initialLimits,
  emirateOptions,
}: TammEditDetailsModalProps) {
  const {t} = useI18n();
  const ed = t.tamm.editDetails;

  const [employees, setEmployees] = useState(initialEmployees);
  const [revenue, setRevenue] = useState(initialRevenue);
  const [emirate, setEmirate] = useState(initialEmirate);
  const [limits, setLimits] = useState<Record<string, string>>(initialLimits);

  // Reset internal state every time the modal is reopened
  useEffect(() => {
    if (open) {
      setEmployees(initialEmployees);
      setRevenue(initialRevenue);
      setEmirate(initialEmirate);
      setLimits(initialLimits);
    }
  }, [open, initialEmployees, initialRevenue, initialEmirate, initialLimits]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const employeeLabels = t.options.employeeBands as Record<string, string>;
  const revenueLabels = t.options.revenueBands as Record<string, string>;

  function handleConfirm() {
    onConfirm({employees, revenue, emirate, limits});
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-details-title">
      {/* Backdrop */}
      <button
        type="button"
        aria-label={ed.cancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="edit-details-title" className="text-lg font-bold text-text">
              {ed.title}
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">{ed.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={ed.cancel}
            className="shrink-0 -mt-1 -me-1 w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {businessName ? (
            <ReadOnlyField label={ed.businessName} value={businessName} />
          ) : null}
          <ReadOnlyField label={ed.businessType} value={businessTypeLabel} />

          <SelectField
            label={ed.employees}
            value={employees}
            onChange={setEmployees}
            options={EMPLOYEE_BANDS.map((b) => ({value: b, label: employeeLabels[b] ?? b}))}
          />

          <SelectField
            label={ed.revenue}
            value={revenue}
            onChange={setRevenue}
            options={REVENUE_BANDS.map((b) => ({value: b, label: revenueLabels[b] ?? b}))}
          />

          <SelectField
            label={ed.location}
            value={emirate}
            onChange={setEmirate}
            options={emirateOptions}
          />

          {activeProducts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
                {ed.coverageLimits}
              </div>
              <div className="flex flex-col gap-2">
                {activeProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAFB] border border-border">
                    <span className="text-sm font-medium text-text">{product.name}</span>
                    <div className="flex gap-1">
                      {LIMIT_OPTIONS.map((lm) => {
                        const active = (limits[product.id] ?? '1M') === lm;
                        return (
                          <button
                            key={lm}
                            type="button"
                            onClick={() => setLimits((prev) => ({...prev, [product.id]: lm}))}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                              active
                                ? 'bg-[#169F9F] text-white'
                                : 'bg-white text-text-muted border border-border hover:border-[#169F9F]/60'
                            }`}>
                            {lm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-text-muted hover:text-text bg-white border border-border hover:bg-gray-50 transition-colors">
            {ed.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-[#169F9F] hover:bg-[#0E8B8B] transition-colors">
            {ed.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({label, value}: {label: string; value: string}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">{label}</div>
      <div className="px-3.5 py-2.5 rounded-lg bg-[#F1F5F9] border border-border text-sm font-medium text-text">
        {value}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{label: string; value: string}>;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full rounded-lg border-[1.5px] border-[#D1D5DB] bg-white ps-3.5 pe-10 py-2.5 text-sm font-medium text-text outline-none transition-colors focus:border-[#169F9F]">
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-[#475569]">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
