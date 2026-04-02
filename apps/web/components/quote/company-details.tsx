'use client';

import {useState, useRef} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {mockOcrExtract} from '@/lib/mock-ocr';
import type {OcrResult} from '@/lib/mock-ocr';
import {DragDropZone, EditableField, formatDateInput, ACTIVITIES} from '@/components/quote/company-details-fields';
import {useI18n} from '@/lib/i18n';

type Mode = 'choice' | 'uploading' | 'manual' | 'confirmed';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ', 'DIFC', 'ADGM'];

const FIELD_META: Array<{key: keyof OcrResult['fields']; label: string}> = [
  {key: 'companyName', label: 'Company Name'},
  {key: 'licenseNumber', label: 'License Number'},
  {key: 'activity', label: 'Business Activity'},
  {key: 'emirate', label: 'Emirate'},
  {key: 'expiryDate', label: 'Expiry Date'},
];

export function CompanyDetails() {
  const {t} = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const hasLicenseNumber = !!searchParams.get('licenseNumber');
  const prefilled = searchParams.get('prefilled') === 'true';
  const hasTradeLicense = hasLicenseNumber || prefilled;

  const [mode, setMode] = useState<Mode>(hasTradeLicense ? 'confirmed' : 'choice');
  const [progress, setProgress] = useState({pct: 0, stage: ''});
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState(false);
  const [form, setForm] = useState({
    companyName: searchParams.get('businessName') || '',
    licenseNumber: searchParams.get('licenseNumber') || '',
    activity: searchParams.get('activity') || '',
    emirate: searchParams.get('emirate') || 'Dubai',
    expiryDate: '',
  });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const prefilledResult: OcrResult | null = hasTradeLicense
    ? {
        success: true,
        scenario: 'prefilled',
        fields: {
          companyName: {value: searchParams.get('businessName') || searchParams.get('activity') || '', confidence: 'high' as const},
          licenseNumber: {value: searchParams.get('licenseNumber') || '', confidence: 'high' as const},
          activity: {value: searchParams.get('activity') || '', confidence: 'high' as const},
          emirate: {value: searchParams.get('emirate') || 'Dubai', confidence: 'high' as const},
          expiryDate: {value: searchParams.get('expiry') || '', confidence: 'high' as const},
        },
        warnings: [],
      }
    : null;

  const activeResult = ocrResult || prefilledResult;

  const setF = (k: string, v: string) => {
    setForm((p) => ({...p, [k]: v}));
    setErrs((e) => {
      const next = {...e};
      delete next[k];
      return next;
    });
  };

  const processFile = async (file: File) => {
    if (!file || file.size > 10 * 1024 * 1024) return;
    setMode('uploading');
    const result = await mockOcrExtract(file, (pct, stage) => {
      setProgress({pct, stage});
    });
    setOcrResult(result);
    setEditedFields({});
    setMode('confirmed');
  };

  const verifyManual = async () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = 'Company name required';
    if (!form.licenseNumber.trim()) e.licenseNumber = 'License number required';
    setErrs(e);
    if (Object.keys(e).length) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setVerifying(false);
    setOcrResult({
      success: true,
      scenario: 'manual',
      fields: {
        companyName: {value: form.companyName, confidence: 'high'},
        licenseNumber: {value: form.licenseNumber, confidence: 'high'},
        activity: {value: form.activity || 'Not specified', confidence: 'high'},
        emirate: {value: form.emirate, confidence: 'high'},
        expiryDate: {value: form.expiryDate || '', confidence: 'high'},
      },
      warnings: [],
    });
    setMode('confirmed');
  };

  const proceed = () => {
    const existing = new URLSearchParams(searchParams.toString());
    if (activeResult) {
      const fields = activeResult.fields;
      const name = editedFields.companyName ?? fields.companyName.value;
      const license = editedFields.licenseNumber ?? fields.licenseNumber.value;
      const emirate = editedFields.emirate ?? fields.emirate.value;
      if (name) existing.set('businessName', name);
      if (license) existing.set('licenseNumber', license);
      if (emirate) existing.set('emirate', emirate);
      existing.set('companyVerified', 'true');
      existing.set('companySource', activeResult.scenario === 'manual' ? 'manual' : 'ocr');
    } else {
      existing.set('companyVerified', 'false');
      existing.set('companySource', 'none');
    }
    router.push(`/quote/checkout?${existing.toString()}`);
  };

  const stageIcon = progress.pct < 30 ? '\u{1F4E4}' : progress.pct < 60 ? '\u{1F50D}' : '\u2728';

  if (mode === 'uploading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
          {stageIcon}
        </div>
        <p className="text-base font-semibold text-text">{progress.stage}</p>
        <div className="w-56 h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{width: `${progress.pct}%`}}
          />
        </div>
        <p className="text-xs text-text-muted">{progress.pct}%</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={6} label={t.progress.company} />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">Company details</h1>
        <p className="mt-1 text-sm text-text-muted">Required by the insurer to issue your policy</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {mode === 'choice' && (
          <>
            <DragDropZone onFile={processFile} fileRef={fileRef} />

            <button onClick={() => setMode('manual')} className="w-full text-left">
              <Card className="rounded-xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
                    {'\u270F\uFE0F'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text">Enter details manually</p>
                    <p className="text-xs text-text-muted mt-0.5">We&apos;ll verify with UAE government database</p>
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={proceed}
              className="w-full py-3 rounded-xl text-sm font-medium text-text-muted border-2 border-dashed border-border hover:border-primary/40 transition-colors"
            >
              Skip for now — I&apos;ll provide these later
            </button>
          </>
        )}

        {mode === 'confirmed' && activeResult && (
          <>
            {activeResult.warnings.length > 0 && (
              <div className="flex flex-col gap-2">
                {activeResult.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-600 shrink-0 mt-0.5">
                      <path
                        d="M8 5.333V8M8 10.667H8.007M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-sm text-amber-800">{warning}</p>
                  </div>
                ))}
              </div>
            )}

            <Card className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="bg-primary/5 px-5 py-2.5 border-b border-primary/10 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                  <path d="M3.5 7.5L6 10L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-medium text-primary">
                  {activeResult.scenario === 'manual'
                    ? 'Verified via UAE government API'
                    : activeResult.scenario === 'prefilled'
                      ? 'From trade license'
                      : 'Extracted from trade license'}
                </span>
              </div>
              <CardContent className="flex flex-col gap-2 p-4">
                {FIELD_META.map(({key, label}) => {
                  const field = activeResult.fields[key];
                  if (!field || (!field.value && field.confidence === 'high')) return null;
                  return (
                    <EditableField
                      key={key}
                      field={{...field, value: editedFields[key] ?? field.value}}
                      label={label}
                      fieldKey={key}
                      onUpdate={(val) => setEditedFields((prev) => ({...prev, [key]: val}))}
                    />
                  );
                })}
              </CardContent>
            </Card>

            <Button
              onClick={proceed}
              className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm"
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2 inline">
                <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setOcrResult(null);
                  setEditedFields({});
                  setMode('choice');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M2 8C2 4.686 4.686 2 8 2C10.21 2 12.117 3.273 13.064 5.143M14 8C14 11.314 11.314 14 8 14C5.79 14 3.883 12.727 2.936 10.857M2 8V4M2 8H6M14 8V12M14 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Re-upload document
              </button>
              <button
                onClick={() => setMode('manual')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M11.333 2L14 4.667M1.333 14.667L2.067 11.72L10.067 3.72C10.333 3.453 10.733 3.453 11 3.72L12.333 5.053C12.6 5.32 12.6 5.72 12.333 5.987L4.333 13.987L1.333 14.667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Enter manually instead
              </button>
            </div>
          </>
        )}

        {mode === 'manual' && (
          <Card className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="bg-surface px-5 py-3 border-b border-border">
              <button
                onClick={() => setMode('choice')}
                className="text-sm text-text-muted hover:text-text flex items-center gap-1 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.75 10.5L5.25 7L8.75 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
            </div>
            <CardContent className="flex flex-col gap-4 p-5">
              {[
                {k: 'companyName', label: 'Company name', ph: 'Al Noor Trading LLC'},
                {k: 'licenseNumber', label: 'Trade license No.', ph: 'e.g. 1234567'},
              ].map(({k, label, ph}) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-text mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={form[k as keyof typeof form]}
                    onChange={(e) => setF(k, e.target.value)}
                    placeholder={ph}
                    className={`w-full rounded-lg border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                      errs[k] ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errs[k] && <p className="mt-1 text-[11px] text-red-500">{errs[k]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Business activity</label>
                <select
                  value={form.activity}
                  onChange={(e) => setF('activity', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all duration-200"
                >
                  <option value="">Select activity</option>
                  {ACTIVITIES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">License expiry date</label>
                <input
                  type="text"
                  value={form.expiryDate}
                  onChange={(e) => setF('expiryDate', formatDateInput(e.target.value))}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  className={`w-full rounded-lg border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errs.expiryDate ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errs.expiryDate && <p className="mt-1 text-[11px] text-red-500">{errs.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Emirate</label>
                <select
                  value={form.emirate}
                  onChange={(e) => setF('emirate', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all duration-200"
                >
                  {EMIRATES.map((e) => (
                    <option key={e} value={e}>{e}</option>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2 inline">
                    <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
