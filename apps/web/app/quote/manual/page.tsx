'use client';

import {useState, useCallback} from 'react';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {ManualStep1} from '@/components/quote/manual-step1';
import {ManualStep2} from '@/components/quote/manual-step2';

interface Step1Data {
  classifiedType: string;
  employees: string;
  revenue: string;
}

export default function ManualInputPage() {
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
        label="Business details"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">
            Step {step} of 2
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mt-3">
          {step === 1
            ? 'Tell us about your business'
            : 'Location, coverage & assets'}
        </h1>
        <p className="mt-2 text-text-muted">
          {step === 1
            ? 'Describe your business and we\'ll classify it automatically'
            : 'Almost done — just a few more details'}
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
