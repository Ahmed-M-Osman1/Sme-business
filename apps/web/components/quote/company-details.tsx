'use client';

import {useState, useRef} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

type VerifiedData = {
  companyName: string;
  licenseNumber: string;
  activity: string;
  emirate: string;
  expiry: string;
  source: string;
};

export function CompanyDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hasLicenseNumber = !!searchParams.get('licenseNumber');
  const prefilled = searchParams.get('prefilled') === 'true';
  const hasTradeLicense = hasLicenseNumber || prefilled;

  const [mode, setMode] = useState<
    'choice' | 'upload' | 'manual' | 'confirmed'
  >(hasTradeLicense ? 'confirmed' : 'choice');

  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const [verified, setVerified] = useState<VerifiedData | null>(
    hasTradeLicense
      ? {
          companyName:
            searchParams.get('businessName') ||
            searchParams.get('activity') ||
            '',
          licenseNumber: searchParams.get('licenseNumber') || '',
          activity: searchParams.get('activity') || '',
          emirate: searchParams.get('emirate') || 'Dubai',
          expiry: searchParams.get('expiry') || '',
          source: 'trade_license',
        }
      : null,
  );

  const [form, setForm] = useState({
    companyName: searchParams.get('businessName') || '',
    licenseNumber: searchParams.get('licenseNumber') || '',
    activity: searchParams.get('activity') || '',
    emirate: searchParams.get('emirate') || 'Dubai',
    expiry: '',
  });

  const [errs, setErrs] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const setF = (k: string, v: string) => {
    setForm((p) => ({...p, [k]: v}));
    setErrs((e) => {
      const next = {...e};
      delete next[k];
      return next;
    });
  };

  const processFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setPct(10);
    await new Promise((r) => setTimeout(r, 500));
    setPct(40);
    let animPct = 40;
    const anim = setInterval(() => {
      animPct = Math.min(animPct + 4, 85);
      setPct(animPct);
    }, 500);
    await new Promise((r) => setTimeout(r, 2000));
    clearInterval(anim);
    setPct(90);
    const mockResult: VerifiedData = {
      companyName: 'Al Noor Trading LLC',
      licenseNumber: '1518968',
      activity: 'General Trading',
      emirate: 'Dubai',
      expiry: '17/06/2026',
      source: 'ocr',
    };
    setPct(100);
    await new Promise((r) => setTimeout(r, 400));
    setUploading(false);
    setPct(0);
    setVerified(mockResult);
    setMode('confirmed');
  };

  const verifyManual = async () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = 'Company name required';
    if (!form.licenseNumber.trim())
      e.licenseNumber = 'License number required';
    setErrs(e);
    if (Object.keys(e).length) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setVerifying(false);
    setVerified({...form, source: 'manual'});
    setMode('confirmed');
  };

  const proceed = () => {
    const existing = new URLSearchParams(searchParams.toString());
    if (verified) {
      if (verified.companyName)
        existing.set('businessName', verified.companyName);
      if (verified.licenseNumber)
        existing.set('licenseNumber', verified.licenseNumber);
      if (verified.emirate) existing.set('emirate', verified.emirate);
      existing.set('companyVerified', 'true');
      existing.set('companySource', verified.source || 'none');
    } else {
      existing.set('companyVerified', 'false');
      existing.set('companySource', 'none');
    }
    router.push(`/quote/checkout?${existing.toString()}`);
  };

  if (uploading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
          {pct < 40 ? '📄' : pct < 80 ? '🔍' : '✨'}
        </div>
        <p className="text-base font-semibold text-text">
          {pct < 40
            ? 'Uploading...'
            : pct < 80
              ? 'Reading trade licence...'
              : 'Extracting company details...'}
        </p>
        <div className="w-56 h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{width: `${pct}%`}}
          />
        </div>
        <p className="text-xs text-text-muted">{pct}%</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={4} label="Company details" />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Company details
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Required by the insurer to issue your policy
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {/* Confirmed */}
        {mode === 'confirmed' && verified && (
          <>
            <Card className="rounded-2xl border-2 border-green-500 bg-linear-to-r from-green-50 to-white overflow-hidden">
              <div className="bg-green-50 px-5 py-2 flex items-center gap-2 text-xs font-medium text-green-700">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3.5 7.5L6 10L10.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {verified.source === 'ocr'
                  ? 'Read from trade licence'
                  : verified.source === 'manual'
                    ? 'Verified via UAE government API'
                    : 'From trade licence'}
              </div>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-text text-base">
                    {verified.companyName || 'Company verified'}
                  </p>
                  <button
                    onClick={() => {
                      setMode('choice');
                      setVerified(null);
                    }}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {label: 'License No.', val: verified.licenseNumber},
                    {label: 'Activity', val: verified.activity},
                    {label: 'Emirate', val: verified.emirate},
                    {label: 'Expiry', val: verified.expiry},
                  ]
                    .filter((f) => f.val)
                    .map((f) => (
                      <div key={f.label} className="bg-surface rounded-lg px-3 py-2">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">
                          {f.label}
                        </p>
                        <p className="text-sm font-medium text-text mt-0.5">
                          {f.val}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={proceed}
              className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm"
            >
              Continue
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="ml-2 inline"
              >
                <path
                  d="M6 3.333L10.667 8L6 12.667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </>
        )}

        {/* Choice mode */}
        {mode === 'choice' && (
          <>
            {/* Featured: upload */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full text-left"
            >
              <Card className="rounded-2xl border-2 border-primary bg-linear-to-br from-primary/5 to-white hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    📄
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text text-base">
                      Upload trade licence
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      AI reads it instantly — no typing needed
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-primary shrink-0"
                  >
                    <path
                      d="M7.5 4.167L13.333 10L7.5 15.833"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </CardContent>
              </Card>
            </button>

            {/* Manual entry */}
            <button
              onClick={() => setMode('manual')}
              className="w-full text-left"
            >
              <Card className="rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-2xl shrink-0">
                    ✏️
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text">
                      Enter details manually
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      We&apos;ll verify with UAE government database
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>

            {/* Skip */}
            <button
              onClick={proceed}
              className="w-full py-3 rounded-xl text-sm font-medium text-text-muted border-2 border-dashed border-border hover:border-primary/40 transition-colors"
            >
              Skip for now — I&apos;ll provide these later
            </button>
          </>
        )}

        {/* Manual form */}
        {mode === 'manual' && (
          <Card className="rounded-2xl border-2 border-primary bg-white shadow-md overflow-hidden">
            <div className="bg-linear-to-r from-primary/5 to-transparent px-5 py-3 border-b border-primary/10">
              <button
                onClick={() => setMode('choice')}
                className="text-sm text-text-muted hover:text-text flex items-center gap-1"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M8.75 10.5L5.25 7L8.75 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
            </div>
            <CardContent className="flex flex-col gap-4 p-5">
              {[
                {
                  k: 'companyName',
                  label: 'Company name',
                  ph: 'Al Noor Trading LLC',
                },
                {
                  k: 'licenseNumber',
                  label: 'Trade licence No.',
                  ph: 'e.g. 1234567',
                },
                {
                  k: 'activity',
                  label: 'Business activity',
                  ph: 'e.g. Food & Beverage',
                },
                {
                  k: 'expiry',
                  label: 'Licence expiry date',
                  ph: 'DD/MM/YYYY',
                },
              ].map(({k, label, ph}) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[k as keyof typeof form]}
                    onChange={(e) => setF(k, e.target.value)}
                    placeholder={ph}
                    className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errs[k] ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errs[k] && (
                    <p className="mt-1 text-[11px] text-red-500">{errs[k]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Emirate
                </label>
                <select
                  value={form.emirate}
                  onChange={(e) => setF('emirate', e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  {[
                    'Dubai',
                    'Abu Dhabi',
                    'Sharjah',
                    'Ajman',
                    'RAK',
                    'Fujairah',
                    'UAQ',
                    'DIFC',
                    'ADGM',
                  ].map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={verifyManual}
                disabled={verifying}
                className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold disabled:opacity-50 shadow-sm"
              >
                {verifying ? 'Verifying with UAE govt...' : 'Verify & Continue'}
                {!verifying && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="ml-2 inline"
                  >
                    <path
                      d="M6 3.333L10.667 8L6 12.667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
    </div>
  );
}
