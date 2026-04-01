'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadState = 'idle' | 'selected' | 'processing' | 'done';

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PDF or image file (JPG or PNG)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('This file is too large. Please upload a file under 10MB');
      return;
    }

    setFileName(file.name);
    setState('selected');
  }

  function handleProcess() {
    setState('processing');

    // Simulate OCR processing (1.5-2s)
    setTimeout(() => {
      setState('done');
    }, 1800);
  }

  function handleContinue() {
    // OCR mock pre-fills: General Trading, Dubai
    router.push('/quote/results?type=general-trading&source=upload');
  }

  function handleRemove() {
    setState('idle');
    setFileName('');
    setError('');
  }

  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator
        currentStep={2}
        totalSteps={6}
        label="Upload document"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Upload trade licence
        </h1>
        <p className="mt-2 text-text-muted">
          We'll read your document and pre-fill your details automatically.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full">
        {state === 'idle' && (
          <>
            <label className="block cursor-pointer">
              <Card className="rounded-2xl border-2 border-dashed border-border bg-white hover:border-primary transition-all duration-200">
                <CardContent className="flex flex-col items-center gap-4 py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-3xl">
                    📄
                  </div>
                  <p className="text-sm font-medium text-text">
                    Upload your Trade Licence or business document
                  </p>
                  <p className="text-xs text-text-muted">
                    PDF, JPG, or PNG — max 10MB
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full bg-primary text-white px-6"
                  >
                    Choose file
                  </Button>
                </CardContent>
              </Card>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </>
        )}

        {state === 'selected' && (
          <Card className="rounded-2xl border border-border bg-white">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {fileName}
                </p>
                <p className="text-xs text-text-muted">Ready to process</p>
              </div>
              <button
                onClick={handleRemove}
                className="text-xs text-text-muted hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </CardContent>
          </Card>
        )}

        {state === 'processing' && (
          <Card className="rounded-2xl border border-border bg-white">
            <CardContent className="flex flex-col items-center gap-4 py-12 px-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-sm font-medium text-text">
                Claude Vision is reading your document...
              </p>
              <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[loading_1.8s_ease-in-out]" />
              </div>
            </CardContent>
          </Card>
        )}

        {state === 'done' && (
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium">
                ✓ We've prefilled your details — please review and confirm
              </p>
            </div>
            <Card className="rounded-2xl border border-border bg-white">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Business Name</span>
                  <span className="text-sm font-medium text-text">
                    Al Noor Trading LLC
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">
                    Business Activity
                  </span>
                  <span className="text-sm font-medium text-text">
                    General Trading
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Location</span>
                  <span className="text-sm font-medium text-text">
                    Dubai, UAE
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-3">
        {state === 'selected' && (
          <Button
            onClick={handleProcess}
            className="w-full rounded-xl bg-primary text-white py-3 font-medium"
          >
            Process document
          </Button>
        )}
        {state === 'done' && (
          <Button
            onClick={handleContinue}
            className="w-full rounded-xl bg-primary text-white py-3 font-medium"
          >
            Looks good — show me quotes →
          </Button>
        )}
        <Link
          href="/quote/manual"
          className="text-center text-sm text-text-muted hover:text-text transition-colors"
        >
          Skip — enter details manually
        </Link>
      </div>
    </div>
  );
}
