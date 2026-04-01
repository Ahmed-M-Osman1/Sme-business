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
  _fallback?: boolean;
};

export function CompanyDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if we already have trade license data from previous steps
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

  // Simulate file upload + OCR processing
  const processFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setPct(10);

    // Simulate upload progress
    await new Promise((r) => setTimeout(r, 500));
    setPct(40);

    // Simulate OCR processing
    let animPct = 40;
    const anim = setInterval(() => {
      animPct = Math.min(animPct + 4, 85);
      setPct(animPct);
    }, 500);

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 2000));
    clearInterval(anim);
    setPct(90);

    // Mock OCR result
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

  // Simulate manual verification via UAE government API
  const verifyManual = async () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = 'Company name required';
    if (!form.licenseNumber.trim())
      e.licenseNumber = 'License number required';
    setErrs(e);
    if (Object.keys(e).length) return;

    setVerifying(true);
    // Simulate government API lookup
    await new Promise((r) => setTimeout(r, 1200));
    setVerifying(false);
    setVerified({...form, source: 'manual'});
    setMode('confirmed');
  };

  // Proceed to next step (checkout), passing company data via URL params
  const proceed = () => {
    const existing = new URLSearchParams(searchParams.toString());

    // Add/update company verification data
    if (verified) {
      if (verified.companyName) existing.set('businessName', verified.companyName);
      if (verified.licenseNumber) existing.set('licenseNumber', verified.licenseNumber);
      if (verified.emirate) existing.set('emirate', verified.emirate);
      existing.set('companyVerified', 'true');
      existing.set('companySource', verified.source || 'none');
    } else {
      existing.set('companyVerified', 'false');
      existing.set('companySource', 'none');
    }

    router.push(`/quote/checkout?${existing.toString()}`);
  };

  // Uploading state
  if (uploading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-5xl">
          {pct < 40 ? '📄' : pct < 80 ? '🔍' : '✨'}
        </div>
        <p className="text-base font-semibold text-text">
          {pct < 40
            ? 'Uploading…'
            : pct < 80
              ? 'Reading trade licence…'
              : 'Extracting company details…'}
        </p>
        <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
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
      <ProgressIndicator
        currentStep={4}
        label="Company details"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Company details
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Required by the insurer to issue your policy
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {/* Already confirmed from trade license */}
        {mode === 'confirmed' && verified && (
          <>
            <Card className="rounded-2xl border-2 border-green-500 bg-white">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <p className="font-semibold text-text">
                      {verified.companyName || 'Company verified'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {verified.source === 'ocr'
                        ? 'Read from trade licence ✓'
                        : verified.source === 'manual'
                          ? 'Verified via UAE government API ✓'
                          : 'From trade licence ✓'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMode('choice');
                      setVerified(null);
                    }}
                    className="text-xs text-text-muted hover:text-text"
                  >
                    Change
                  </button>
                </div>

                {[
                  {label: 'License No.', val: verified.licenseNumber},
                  {label: 'Activity', val: verified.activity},
                  {label: 'Emirate', val: verified.emirate},
                  {label: 'Expiry', val: verified.expiry},
                ]
                  .filter((f) => f.val)
                  .map((f) => (
                    <div
                      key={f.label}
                      className="flex justify-between border-t border-border pt-2"
                    >
                      <span className="text-xs text-text-muted">
                        {f.label}
                      </span>
                      <span className="text-xs font-medium text-text">
                        {f.val}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Button
              onClick={proceed}
              className="w-full rounded-xl bg-primary text-white py-3 font-medium"
            >
              Continue →
            </Button>
          </>
        )}

        {/* Choice mode — two options */}
        {mode === 'choice' && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-primary text-left hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-2xl shrink-0">
                📄
              </div>
              <div>
                <p className="font-semibold text-text">
                  Upload trade licence
                </p>
                <p className="text-xs text-text-muted">
                  AI reads it instantly — no typing needed
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode('manual')}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border text-left hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl shrink-0">
                ✏️
              </div>
              <div>
                <p className="font-semibold text-text">
                  Enter details manually
                </p>
                <p className="text-xs text-text-muted">
                  We'll verify with UAE government database
                </p>
              </div>
            </button>

            <button
              onClick={proceed}
              className="w-full py-3 rounded-xl text-sm font-medium text-text-muted border border-dashed border-border hover:border-text-muted transition-colors"
            >
              Skip for now — I'll provide these later
            </button>
          </>
        )}

        {/* Manual entry form */}
        {mode === 'manual' && (
          <Card className="rounded-2xl border border-border bg-white">
            <CardContent className="flex flex-col gap-4 p-5">
              <button
                onClick={() => setMode('choice')}
                className="text-sm text-text-muted hover:text-text self-start"
              >
                ← Back
              </button>

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
                    className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errs[k] ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errs[k] && (
                    <p className="mt-1 text-xs text-red-500">⚠️ {errs[k]}</p>
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
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full rounded-xl bg-primary text-white py-3 font-medium disabled:opacity-50"
              >
                {verifying
                  ? 'Verifying with UAE govt…'
                  : 'Verify & Continue →'}
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
