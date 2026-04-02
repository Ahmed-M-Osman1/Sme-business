'use client';

import {useState, useRef, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {mockOcrExtract} from '@/lib/mock-ocr';
import type {OcrResult} from '@/lib/mock-ocr';
import {EditableField} from '@/components/quote/company-details-fields';
import {useI18n} from '@/lib/i18n';
import quoteOptions from '@/config/quote-options.json';
import businessTypes from '@/config/business-types.json';

type Step = 'upload' | 'processing' | 'review' | 'details';

const FIELD_META: Array<{key: keyof OcrResult['fields']; label: string}> = [
  {key: 'companyName', label: 'Company Name'},
  {key: 'licenseNumber', label: 'License Number'},
  {key: 'activity', label: 'Business Activity'},
  {key: 'emirate', label: 'Emirate'},
  {key: 'expiryDate', label: 'Expiry Date'},
];

export default function UploadPage() {
  const {t} = useI18n();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState({pct: 0, stage: ''});
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  // Step 2: additional details
  const [employees, setEmployees] = useState('');
  const [revenue, setRevenue] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({});

  function toggleAsset(id: string) {
    setSelectedAssets((prev) => {
      const next = {...prev};
      if (id in next) { delete next[id]; } else { next[id] = ''; }
      return next;
    });
  }

  function setAssetValue(id: string, value: string) {
    setSelectedAssets((prev) => ({...prev, [id]: value}));
  }

  const processFile = useCallback(async (file: File) => {
    if (!file || file.size > 10 * 1024 * 1024) return;
    setStep('processing');
    const result = await mockOcrExtract(file, (pct, stage) => {
      setProgress({pct, stage});
    });
    setOcrResult(result);
    setEditedFields({});
    setStep('review');
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function resolveBusinessType(): string {
    const activity = (editedFields.activity ?? ocrResult?.fields.activity.value ?? '').toLowerCase();
    const match = businessTypes.find((bt) => {
      const desc = bt.description.toLowerCase();
      const title = bt.title.toLowerCase();
      return activity.includes(title.split('/')[0].trim()) || desc.split(',').some((w) => activity.includes(w.trim()));
    });
    return match?.id ?? 'general-trading';
  }

  function handleGetQuotes() {
    if (!ocrResult || !employees || !revenue) return;
    const type = resolveBusinessType();
    const emirate = editedFields.emirate || ocrResult.fields.emirate.value || 'Dubai';
    const companyName = editedFields.companyName ?? ocrResult.fields.companyName.value;
    const licenseNumber = editedFields.licenseNumber ?? ocrResult.fields.licenseNumber.value;

    const params = new URLSearchParams({
      type,
      source: 'upload',
      employees,
      revenue,
      emirate,
      businessName: companyName,
      licenseNumber,
    });
    router.push(`/quote/results?${params.toString()}`);
  }

  const stageIcon = progress.pct < 30 ? '📤' : progress.pct < 60 ? '🔍' : '✨';

  // --- Processing screen ---
  if (step === 'processing') {
    return (
      <div className="flex flex-col gap-8">
        <ProgressIndicator currentStep={2} label="Upload document" />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            {stageIcon}
          </div>
          <p className="text-base font-semibold text-gray-900">{progress.stage}</p>
          <div className="w-56 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{width: `${progress.pct}%`}}
            />
          </div>
          <p className="text-xs text-gray-400">{progress.pct}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ProgressIndicator currentStep={2} label="Upload document" />

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <button
          onClick={() => {
            if (step === 'details') setStep('review');
            else if (step === 'review') { setOcrResult(null); setStep('upload'); }
            else router.back();
          }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
            <path d="M10 12.667L5.333 8L10 3.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.common.back}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {step === 'upload' ? t.upload.title : step === 'review' ? t.upload.titleReview : t.upload.titleDetails}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === 'upload'
            ? t.upload.subtitleUpload
            : step === 'review'
              ? t.upload.subtitleReview
              : t.upload.subtitleDetails}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {/* --- STEP: Upload --- */}
        {step === 'upload' && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative min-h-52 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-gray-300 hover:border-primary/40 bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200 ${dragOver ? 'bg-primary/10' : 'bg-gray-100'}`}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M12 16V8M12 8L9 11M12 8L15 11M4 14.899A6.002 6.002 0 0 1 8.465 4.135a8.001 8.001 0 0 1 13.535 4.76A4.5 4.5 0 0 1 19.5 18H6a5 5 0 0 1-2-9.101Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900">{t.upload.dropHere}</p>
                <p className="text-sm text-gray-500 mt-1">
                  or <span className="text-primary font-medium underline underline-offset-2">{t.upload.browseFiles}</span>
                </p>
              </div>
              <p className="text-xs text-gray-400">{t.upload.fileHint}</p>
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
            </div>

            {/* What happens next */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.upload.whatHappens}</p>
              <div className="flex flex-col gap-3">
                {[
                  {icon: '📤', text: t.upload.stepUpload},
                  {icon: '🔍', text: t.upload.stepRead},
                  {icon: '✏️', text: t.upload.stepReview},
                  {icon: '📊', text: t.upload.stepGenerate},
                ].map((s) => (
                  <div key={s.text} className="flex items-center gap-3">
                    <span className="text-base">{s.icon}</span>
                    <p className="text-sm text-gray-600">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alt paths */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push('/quote/ai-advisor')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                🤖 {t.upload.tryAi}
              </button>
              <button
                onClick={() => router.push('/quote/manual')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                ✏️ {t.upload.enterManually}
              </button>
            </div>
          </>
        )}

        {/* --- STEP: Review OCR results --- */}
        {step === 'review' && ocrResult && (
          <>
            {ocrResult.warnings.length > 0 && (
              <div className="flex flex-col gap-2">
                {ocrResult.warnings.map((w) => (
                  <div key={w} className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-600 shrink-0 mt-0.5">
                      <path d="M8 5.333V8M8 10.667H8.007M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-amber-800">{w}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-primary/5 px-5 py-2.5 border-b border-primary/10 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                  <path d="M3.5 7.5L6 10L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-medium text-primary">{t.upload.extractedFrom}</span>
              </div>
              <div className="flex flex-col gap-2 p-4">
                {FIELD_META.map(({key, label}) => {
                  const field = ocrResult.fields[key];
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
              </div>
            </div>

            {/* Employees — not from OCR, collect here */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1.5">
                {t.upload.employees} <span className="text-gray-400 font-normal">{t.upload.includingYourself}</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {quoteOptions.employeeBands.map((band) => (
                  <button
                    key={band.value}
                    onClick={() => setEmployees(band.value)}
                    className={`rounded-xl border py-3 text-sm font-medium transition-all duration-200 ${
                      employees === band.value
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep('details')}
              disabled={!employees}
              className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors gap-2"
            >
              {t.common.continue}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
                <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setOcrResult(null); setEditedFields({}); setStep('upload'); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M2 8C2 4.686 4.686 2 8 2C10.21 2 12.117 3.273 13.064 5.143M14 8C14 11.314 11.314 14 8 14C5.79 14 3.883 12.727 2.936 10.857M2 8V4M2 8H6M14 8V12M14 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.upload.reUpload}
              </button>
              <button
                onClick={() => router.push('/quote/manual')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <path d="M11.333 2L14 4.667M1.333 14.667L2.067 11.72L10.067 3.72C10.333 3.453 10.733 3.453 11 3.72L12.333 5.053C12.6 5.32 12.6 5.72 12.333 5.987L4.333 13.987L1.333 14.667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.upload.enterManuallyInstead}
              </button>
            </div>
          </>
        )}

        {/* --- STEP: Additional details (employees + emirate) --- */}
        {step === 'details' && (
          <>
            {/* Estimated revenue */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1.5">
                {t.upload.estimatedRevenue} <span className="text-gray-400 font-normal">{t.upload.next12Months}</span>
              </p>
              <p className="text-xs text-gray-400 mb-3">{t.upload.revenueHelper}</p>
              <div className="flex flex-col gap-2">
                {quoteOptions.revenueBands.map((band) => (
                  <button
                    key={band.value}
                    onClick={() => setRevenue(band.value)}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      revenue === band.value
                        ? 'bg-primary/5 text-primary border-primary'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High-value assets */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1.5">
                {t.upload.highValueAssets} <span className="text-gray-400 font-normal">{t.upload.tickOver5k}</span>
              </p>
              <div className="flex flex-col gap-2">
                {quoteOptions.highValueAssets.map((asset) => {
                  const isSelected = asset.id in selectedAssets;
                  return (
                    <div key={asset.id}>
                      <button
                        onClick={() => toggleAsset(asset.id)}
                        className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary/5 border-primary'
                            : 'bg-white border-gray-200 hover:border-primary/40'
                        }`}
                      >
                        <span className="text-lg">{asset.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                            {asset.label}
                          </p>
                          <p className="text-xs text-gray-400">{asset.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isSelected ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3.5 7.5L6 10L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 3.5V10.5M3.5 7H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                      {isSelected && (
                        <div className="mt-1 ml-10 mr-4">
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                            <span className="text-xs text-gray-400 font-medium">AED</span>
                            <input
                              type="text"
                              value={selectedAssets[asset.id]}
                              onChange={(e) => setAssetValue(asset.id, e.target.value.replace(/[^0-9,]/g, ''))}
                              placeholder={t.upload.estimatedValue}
                              className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Get quotes */}
            <Button
              onClick={handleGetQuotes}
              disabled={!employees || !revenue}
              className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors gap-2"
            >
              {t.upload.getMyQuotes}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
                <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
