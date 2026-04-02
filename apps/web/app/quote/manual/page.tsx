'use client';

import {useState, useCallback} from 'react';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {ManualStep1} from '@/components/quote/manual-step1';
import {ManualStep2} from '@/components/quote/manual-step2';
import {useI18n} from '@/lib/i18n';

interface Step1Data {
  classifiedType: string;
  employees: string;
  revenue: string;
}

export default function ManualInputPage() {
  const {t} = useI18n();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    classifiedType: '',
    employees: '',
    revenue: '',
  });

  const goToStep = useCallback((nextStep: number) => {
    setStep(nextStep);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator
        currentStep={2}
        totalSteps={6}
        label={t.progress.business}
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mt-3">
          {step === 1
            ? t.manual.step1Title
            : t.manual.step2Title}
        </h1>
        <p className="mt-2 text-text-muted">
          {step === 1
            ? t.manual.step1Subtitle
            : t.manual.step2Subtitle}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full">
        {step === 1 ? (
          <ManualStep1
            data={step1Data}
            onChange={setStep1Data}
            onContinue={() => goToStep(2)}
          />
        ) : (
          <ManualStep2
            step1Data={step1Data}
            onBack={() => goToStep(1)}
          />
        )}
      </div>
    </div>
  );
}
