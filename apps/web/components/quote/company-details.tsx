'use client';

import {useState, useRef, useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {mockOcrExtract} from '@/lib/mock-ocr';
import type {OcrResult} from '@/lib/mock-ocr';
import {DragDropZone, EditableField, formatDateInput, ACTIVITIES, isUnreadableValue, isValidDate} from '@/components/quote/company-details-fields';
import {useI18n} from '@/lib/i18n';

type Mode = 'choice' | 'uploading' | 'manual' | 'confirmed';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ', 'DIFC', 'ADGM'];
const STORAGE_KEY = 'shory-company-details-draft';

/** Simulated government API verification delay. */
const VERIFY_DELAY_MS = 1200;

function isExpiredDate(value: string): boolean {
  if (!isValidDate(value)) return false;
  const [day, month, year] = value.split('/').map(Number);
  const expiry = new Date(year, month - 1, day, 23, 59, 59, 999);
  return expiry.getTime() < Date.now();
}

function loadDraft() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      mode: Mode;
      ocrResult: OcrResult | null;
      editedFields: Record<string, string>;
      form: {
        companyName: string;
        licenseNumber: string;
        activity: string;
        emirate: string;
        expiryDate: string;
      };
      expiredAcknowledged: boolean;
    };
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function CompanyDetails() {
  const {t, locale} = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const hasLicenseNumber = !!searchParams.get('licenseNumber');
  const prefilled = searchParams.get('prefilled') === 'true';
  const hasTradeLicense = hasLicenseNumber || prefilled;
  const draft = !hasTradeLicense ? loadDraft() : null;

  const [mode, setMode] = useState<Mode>(draft?.mode ?? (hasTradeLicense ? 'confirmed' : 'choice'));
  const [progress, setProgress] = useState({pct: 0, stage: ''});
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(draft?.ocrResult ?? null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>(draft?.editedFields ?? {});
  const [verifying, setVerifying] = useState(false);
  const [fileError, setFileError] = useState('');
  const [expiredAcknowledged, setExpiredAcknowledged] = useState(draft?.expiredAcknowledged ?? false);
  const [form, setForm] = useState({
    companyName: draft?.form.companyName ?? (searchParams.get('businessName') || ''),
    licenseNumber: draft?.form.licenseNumber ?? (searchParams.get('licenseNumber') || ''),
    activity: draft?.form.activity ?? (searchParams.get('activity') || ''),
    emirate: draft?.form.emirate ?? (searchParams.get('emirate') || 'Dubai'),
    expiryDate: draft?.form.expiryDate ?? '',
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const fieldMeta: Array<{key: keyof OcrResult['fields']; label: string}> = [
    {key: 'companyName', label: t.companyDetails.companyName},
    {key: 'licenseNumber', label: t.companyDetails.licenseNumber},
    {key: 'activity', label: t.companyDetails.businessActivity},
    {key: 'emirate', label: t.confirmation.emirate},
    {key: 'expiryDate', label: t.companyDetails.expiryDate},
  ];

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
  const hasInvalidActiveFields = !!activeResult && Object.entries(activeResult.fields).some(([key, field]) => {
    const value = editedFields[key] ?? field.value;
    if (key === 'expiryDate') {
      return value.length > 0 && !isValidDate(value);
    }
    return isUnreadableValue(value);
  });
  const activeExpiryDate = activeResult
    ? editedFields.expiryDate ?? activeResult.fields.expiryDate.value
    : '';
  const requiresExpiryAcknowledgement = isExpiredDate(activeExpiryDate);
  const canProceed = !!activeResult && !hasInvalidActiveFields && !requiresExpiryAcknowledgement;

  useEffect(() => {
    if (hasTradeLicense) {
      clearDraft();
      return;
    }

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode,
          ocrResult,
          editedFields,
          form,
          expiredAcknowledged,
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, [editedFields, expiredAcknowledged, form, hasTradeLicense, mode, ocrResult]);

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
    if (file.size > 10 * 1024 * 1024) {
      setFileError(t.companyDetails.fileTooLarge);
      return;
    }
    setFileError('');
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
    if (!form.companyName.trim()) e.companyName = t.companyDetails.companyNameRequired;
    if (!form.licenseNumber.trim()) e.licenseNumber = t.companyDetails.licenseNumberRequired;
    if (form.expiryDate && !isValidDate(form.expiryDate)) e.expiryDate = t.upload.invalidDateFormat;
    setErrs(e);
    if (Object.keys(e).length) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, VERIFY_DELAY_MS));
    setVerifying(false);
    const expiryValue = form.expiryDate || '';
    setOcrResult({
      success: true,
      scenario: 'manual',
      fields: {
        companyName: {value: form.companyName, confidence: 'high'},
        licenseNumber: {value: form.licenseNumber, confidence: 'high'},
        activity: {value: form.activity || t.companyDetails.notSpecified, confidence: 'high'},
        emirate: {value: form.emirate, confidence: 'high'},
        expiryDate: {value: expiryValue, confidence: 'high'},
      },
      warnings: isExpiredDate(expiryValue)
        ? ['Trade license appears to be expired — please renew before purchasing a policy']
        : [],
    });
    setExpiredAcknowledged(false);
    setMode('confirmed');
  };

  const proceed = () => {
    if (!canProceed) return;
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
    clearDraft();
    window.scrollTo({top: 0, behavior: 'smooth'});
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
      <ProgressIndicator currentStep={5} totalSteps={6} label={t.progress.company} />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">{t.companyDetails.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{t.companyDetails.subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {mode === 'choice' && (
          <>
            <DragDropZone onFile={processFile} fileRef={fileRef} />

            {fileError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {fileError}
              </div>
            )}

            <button onClick={() => setMode('manual')} className="w-full text-start">
              <Card className="rounded-xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
                    {'\u270F\uFE0F'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text">{t.companyDetails.manualEntry}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t.companyDetails.manualDesc}</p>
                  </div>
                </CardContent>
              </Card>
            </button>

            <p className="text-center text-xs text-text-muted">
              {locale === 'ar' ? 'الرخصة التجارية مطلوبة للمتابعة' : 'Trade license verification is required to proceed'}
            </p>
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
                    <p className="text-sm text-amber-800">
                      {!activeResult.success
                        ? t.upload.unsupportedDocument
                        : warning.toLowerCase().includes('expired')
                          ? t.companyDetails.expiredNotice
                          : t.upload.unreadableWarning}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {hasInvalidActiveFields && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {t.companyDetails.reviewHighlightedFields}
              </div>
            )}

            {requiresExpiryAcknowledgement && (
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <input
                  type="checkbox"
                  checked={expiredAcknowledged}
                  onChange={(e) => setExpiredAcknowledged(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary"
                />
                <span>{t.companyDetails.acknowledgeExpired}</span>
              </label>
            )}

            <Card className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="bg-primary/5 px-5 py-2.5 border-b border-primary/10 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                  <path d="M3.5 7.5L6 10L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-medium text-primary">
                  {activeResult.scenario === 'manual'
                    ? t.companyDetails.verifiedVia
                    : activeResult.scenario === 'prefilled'
                      ? t.companyDetails.fromLicense
                      : t.companyDetails.extractedFrom}
                </span>
              </div>
              <CardContent className="flex flex-col gap-2 p-4">
                {fieldMeta.map(({key, label}) => {
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
              disabled={!canProceed}
              className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm"
            >
              {t.common.continue}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ms-2 inline rtl:rotate-180">
                <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setOcrResult(null);
                  setEditedFields({});
                  setExpiredAcknowledged(false);
                  setMode('choice');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M2 8C2 4.686 4.686 2 8 2C10.21 2 12.117 3.273 13.064 5.143M14 8C14 11.314 11.314 14 8 14C5.79 14 3.883 12.727 2.936 10.857M2 8V4M2 8H6M14 8V12M14 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.companyDetails.reUploadDocument}
              </button>
              <button
                onClick={() => setMode('manual')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M11.333 2L14 4.667M1.333 14.667L2.067 11.72L10.067 3.72C10.333 3.453 10.733 3.453 11 3.72L12.333 5.053C12.6 5.32 12.6 5.72 12.333 5.987L4.333 13.987L1.333 14.667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.companyDetails.enterManuallyInstead}
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
                {t.common.back}
              </button>
            </div>
            <CardContent className="flex flex-col gap-4 p-5">
              {[
                {k: 'companyName', label: t.companyDetails.companyName, ph: t.companyDetails.companyNamePlaceholder},
                {k: 'licenseNumber', label: t.companyDetails.tradeLicenseNo, ph: t.companyDetails.licensePlaceholder},
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
                <label className="block text-sm font-medium text-text mb-1.5">{t.companyDetails.businessActivity}</label>
                <select
                  value={form.activity}
                  onChange={(e) => setF('activity', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all duration-200"
                >
                  <option value="">{t.companyDetails.selectActivity}</option>
                  {ACTIVITIES.map((a) => (
                    <option key={a} value={a}>
                      {(t.options.activities as Record<string, string>)[a] ?? a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">{t.companyDetails.licenseExpiryDate}</label>
                <input
                  type="text"
                  value={form.expiryDate}
                  onChange={(e) => setF('expiryDate', formatDateInput(e.target.value))}
                  placeholder={t.companyDetails.datePlaceholder}
                  maxLength={10}
                  className={`w-full rounded-lg border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errs.expiryDate ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errs.expiryDate && <p className="mt-1 text-[11px] text-red-500">{errs.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">{t.confirmation.emirate}</label>
                <select
                  value={form.emirate}
                  onChange={(e) => setF('emirate', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all duration-200"
                >
                  {EMIRATES.map((e) => (
                    <option key={e} value={e}>
                      {(t.options.emirates as Record<string, string>)[e] ?? e}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={verifyManual}
                disabled={verifying}
                className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold disabled:opacity-50 shadow-sm"
              >
                {verifying ? t.companyDetails.verifyingWithGovt : t.companyDetails.verifyAndContinue}
                {!verifying && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ms-2 inline rtl:rotate-180">
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
