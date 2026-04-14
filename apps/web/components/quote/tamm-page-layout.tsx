'use client';

import {TammStepper, TammStepperCompact} from './tamm-stepper';

interface TammPageLayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

export function TammPageLayout({currentStep, children}: TammPageLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mobile stepper */}
      <div className="lg:hidden mb-6">
        <TammStepperCompact currentStep={currentStep} />
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>

        {/* Sidebar stepper — desktop only */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <TammStepper currentStep={currentStep} />
          </div>
        </aside>
      </div>
    </div>
  );
}
