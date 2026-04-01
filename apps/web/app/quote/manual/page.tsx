'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

const BUSINESS_ACTIVITIES = [
  {label: 'General Trading', value: 'general-trading'},
  {label: 'Retail & E-commerce', value: 'retail-trading'},
  {label: 'Food & Beverage', value: 'cafe-restaurant'},
  {label: 'Professional Consulting', value: 'consulting'},
  {label: 'Technology & IT', value: 'it-technology'},
  {label: 'Healthcare', value: 'healthcare'},
  {label: 'Construction & Contracting', value: 'construction'},
  {label: 'Logistics & Transport', value: 'logistics'},
  {label: 'Education & Training', value: 'consulting'},
  {label: 'Real Estate', value: 'real-estate'},
  {label: 'Manufacturing', value: 'general-trading'},
  {label: 'Events & Hospitality', value: 'cafe-restaurant'},
] as const;

const EMPLOYEE_BANDS = [
  {label: 'Just me (1)', value: '1', sizeFactor: 1.0},
  {label: '2–5', value: '2-5', sizeFactor: 1.1},
  {label: '6–10', value: '6-10', sizeFactor: 1.2},
  {label: '11–25', value: '11-25', sizeFactor: 1.3},
  {label: '26–50', value: '26-50', sizeFactor: 1.4},
  {label: '51–100', value: '51-100', sizeFactor: 1.5},
  {label: '100+', value: '100+', sizeFactor: 1.6},
] as const;

interface FormState {
  activity: string;
  employees: string;
  customerInteraction: boolean;
  advisoryServices: boolean;
  physicalAssets: boolean;
  businessVehicles: boolean;
}

export default function ManualInputPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    activity: '',
    employees: '',
    customerInteraction: false,
    advisoryServices: false,
    physicalAssets: false,
    businessVehicles: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.activity) newErrors.activity = 'This field is required';
    if (!form.employees) newErrors.employees = 'This field is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    // Build query params for the results page
    const params = new URLSearchParams({
      type: form.activity,
      source: 'manual',
      employees: form.employees,
      customerInteraction: String(form.customerInteraction),
      advisoryServices: String(form.advisoryServices),
      physicalAssets: String(form.physicalAssets),
      businessVehicles: String(form.businessVehicles),
    });

    router.push(`/quote/results?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator
        currentStep={2}
        label="Business details"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Tell us about your business
        </h1>
        <p className="mt-2 text-text-muted">
          Just 6 questions — we'll handle the rest
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-6">
        {/* Mandatory Fields */}
        <Card className="rounded-2xl border border-border bg-white">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            {/* Business Activity */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Business Activity <span className="text-red-500">*</span>
              </label>
              <select
                value={form.activity}
                onChange={(e) => {
                  setForm((prev) => ({...prev, activity: e.target.value}));
                  if (errors.activity) {
                    setErrors((prev) => {
                      const next = {...prev};
                      delete next.activity;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.activity ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Select your business activity</option>
                {BUSINESS_ACTIVITIES.map((a) => (
                  <option key={a.value + a.label} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              {errors.activity && (
                <p className="mt-1 text-xs text-red-500">{errors.activity}</p>
              )}
            </div>

            {/* Number of Employees */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Number of Employees <span className="text-red-500">*</span>
              </label>
              <select
                value={form.employees}
                onChange={(e) => {
                  setForm((prev) => ({...prev, employees: e.target.value}));
                  if (errors.employees) {
                    setErrors((prev) => {
                      const next = {...prev};
                      delete next.employees;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.employees ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Select employee count</option>
                {EMPLOYEE_BANDS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              {errors.employees && (
                <p className="mt-1 text-xs text-red-500">{errors.employees}</p>
              )}
            </div>

            {/* Customer Interaction Toggle */}
            <ToggleField
              label="Do you interact with customers?"
              description="Triggers Public Liability coverage"
              checked={form.customerInteraction}
              onChange={(v) =>
                setForm((prev) => ({...prev, customerInteraction: v}))
              }
            />

            {/* Advisory Services Toggle */}
            <ToggleField
              label="Do you provide advisory services?"
              description="Triggers Professional Indemnity coverage"
              checked={form.advisoryServices}
              onChange={(v) =>
                setForm((prev) => ({...prev, advisoryServices: v}))
              }
            />
          </CardContent>
        </Card>

        {/* Optional Fields */}
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
            Optional
          </p>
          <Card className="rounded-2xl border border-border bg-white">
            <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
              <ToggleField
                label="Do you have physical business assets?"
                description="Triggers Property Insurance coverage"
                checked={form.physicalAssets}
                onChange={(v) =>
                  setForm((prev) => ({...prev, physicalAssets: v}))
                }
              />
              <ToggleField
                label="Do you operate business vehicles?"
                description="Triggers Fleet Insurance coverage"
                checked={form.businessVehicles}
                onChange={(v) =>
                  setForm((prev) => ({...prev, businessVehicles: v}))
                }
              />
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary text-white py-3 font-medium"
        >
          Show me my quotes →
        </Button>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
