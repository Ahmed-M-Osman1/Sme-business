'use client';

import {useState, useRef, useEffect} from 'react';
import {Button, Card, CardContent, Badge} from '@shory/ui';
import businessTypes from '@/config/business-types.json';
import quoteOptions from '@/config/quote-options.json';

import type {BusinessType} from '@/types/quote';

/** Simulated classification delay. */
const CLASSIFICATION_DELAY_MS = 1500;


interface Step1Data {
  classifiedType: string;
  employees: string;
  revenue: string;
}

interface ManualStep1Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  onContinue: () => void;
}

const KEYWORD_MAP: Record<string, string> = {
  cafe: 'cafe-restaurant',
  café: 'cafe-restaurant',
  restaurant: 'cafe-restaurant',
  food: 'cafe-restaurant',
  coffee: 'cafe-restaurant',
  catering: 'cafe-restaurant',
  law: 'law-firm',
  legal: 'law-firm',
  lawyer: 'law-firm',
  litigation: 'law-firm',
  retail: 'retail-trading',
  shop: 'retail-trading',
  store: 'retail-trading',
  trading: 'retail-trading',
  ecommerce: 'retail-trading',
  tech: 'it-technology',
  software: 'it-technology',
  saas: 'it-technology',
  it: 'it-technology',
  digital: 'it-technology',
  app: 'it-technology',
  construction: 'construction',
  building: 'construction',
  contractor: 'construction',
  'fit-out': 'construction',
  health: 'healthcare',
  clinic: 'healthcare',
  medical: 'healthcare',
  doctor: 'healthcare',
  pharmacy: 'healthcare',
  consult: 'consulting',
  advisory: 'consulting',
  management: 'consulting',
  logistics: 'logistics',
  transport: 'logistics',
  delivery: 'logistics',
  freight: 'logistics',
  courier: 'logistics',
  'real estate': 'real-estate',
  property: 'real-estate',
  brokerage: 'real-estate',
  salon: 'healthcare',
  spa: 'healthcare',
  gym: 'healthcare',
  fitness: 'healthcare',
  wellness: 'healthcare',
  gardening: 'general-trading',
  landscaping: 'construction',
  cleaning: 'general-trading',
  laundry: 'general-trading',
  maintenance: 'construction',
  plumbing: 'construction',
  electrical: 'construction',
  painting: 'construction',
  carpentry: 'construction',
  bakery: 'cafe-restaurant',
  grocery: 'retail-trading',
  supermarket: 'retail-trading',
  fashion: 'retail-trading',
  clothing: 'retail-trading',
  textile: 'retail-trading',
  furniture: 'retail-trading',
  electronics: 'retail-trading',
  automobile: 'general-trading',
  garage: 'general-trading',
  workshop: 'general-trading',
  printing: 'general-trading',
  education: 'consulting',
  training: 'consulting',
  tutoring: 'consulting',
  nursery: 'consulting',
  marketing: 'consulting',
  advertising: 'consulting',
  design: 'consulting',
  accounting: 'consulting',
  audit: 'consulting',
  photography: 'consulting',
  event: 'consulting',
  travel: 'general-trading',
  tourism: 'general-trading',
  hotel: 'general-trading',
  warehouse: 'logistics',
  shipping: 'logistics',
  moving: 'logistics',
  general: 'general-trading',
  import: 'general-trading',
  export: 'general-trading',
  // Arabic keywords
  '\u0637\u0628\u064a\u0628': 'healthcare',
  '\u0645\u0642\u0647\u0649': 'cafe-restaurant',
  '\u0645\u062d\u0627\u0645\u064a': 'law-firm',
  '\u0645\u0637\u0639\u0645': 'cafe-restaurant',
  '\u062a\u0642\u0646\u064a\u0629': 'it-technology',
};

function classifyBusiness(description: string): string | null {
  const lower = description.toLowerCase().trim();

  // Check multi-word keywords first
  for (const [keyword, typeId] of Object.entries(KEYWORD_MAP)) {
    if (keyword.includes(' ') && lower.includes(keyword)) {
      return typeId;
    }
  }

  // Check single-word keywords
  const words = lower.split(/\s+/);
  for (const word of words) {
    for (const [keyword, typeId] of Object.entries(KEYWORD_MAP)) {
      if (!keyword.includes(' ') && (word === keyword || word.startsWith(keyword))) {
        return typeId;
      }
    }
  }

  return null;
}

function getBusinessType(id: string): BusinessType | undefined {
  return (businessTypes as BusinessType[]).find((bt) => bt.id === id);
}

function riskColor(level: string): string {
  if (level === 'low') return 'bg-primary/10 text-primary';
  if (level === 'high') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
}

export function ManualStep1({data, onChange, onContinue}: ManualStep1Props) {
  const [description, setDescription] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState('');
  const [showTypeList, setShowTypeList] = useState(false);
  const [classified, setClassified] = useState<BusinessType | null>(
    data.classifiedType ? getBusinessType(data.classifiedType) ?? null : null,
  );
  const [locked, setLocked] = useState(!!data.classifiedType);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!locked) {
      inputRef.current?.focus();
    }
  }, [locked]);

  function handleClassify() {
    if (description.trim().length < 3) return;
    setClassifying(true);
    setClassificationError('');

    setTimeout(() => {
      const words = description.trim().split(/\s+/);
      const match = classifyBusiness(description);

      if (!match && words.length < 3) {
        setClassificationError(
          "We need a bit more detail. Can you describe what your business actually does?",
        );
        setClassifying(false);
        return;
      }

      const typeId = match ?? 'general-trading';
      const bt = getBusinessType(typeId);
      if (bt) {
        setClassified(bt);
        onChange({...data, classifiedType: bt.id});
      }
      setClassifying(false);
    }, CLASSIFICATION_DELAY_MS);
  }

  function handleConfirm() {
    setLocked(true);
  }

  function handleChangeType() {
    setShowTypeList(true);
  }

  function handleSelectType(bt: BusinessType) {
    setClassified(bt);
    onChange({...data, classifiedType: bt.id});
    setShowTypeList(false);
    setLocked(true);
  }

  function handleRestart() {
    setClassified(null);
    setLocked(false);
    setShowTypeList(false);
    setDescription('');
    onChange({...data, classifiedType: ''});
  }

  const canContinue = locked && data.employees && data.revenue;

  return (
    <div className="flex flex-col gap-6">
      {/* Business Classification */}
      <Card className="rounded-2xl border border-border bg-white">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Describe your business
            </label>
            {!locked && !classified ? (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setClassificationError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && description.trim().length >= 3) {
                      handleClassify();
                    }
                  }}
                  placeholder="e.g. Café serving coffee and light meals in Dubai Marina"
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
                {classificationError && (
                  <p className="mt-2 text-sm text-amber-600">{classificationError}</p>
                )}
                <Button
                  onClick={handleClassify}
                  disabled={description.trim().length < 3 || classifying}
                  className="w-full mt-3 rounded-xl bg-primary text-white py-3 font-medium disabled:opacity-50"
                >
                  {classifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Classifying...
                    </span>
                  ) : (
                    'Classify my business'
                  )}
                </Button>
              </>
            ) : showTypeList ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-text-muted mb-1">Select your business type:</p>
                {(businessTypes as BusinessType[]).map((bt) => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => handleSelectType(bt)}
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-start hover:border-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    <span className="text-xl">{bt.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">{bt.title}</p>
                      <p className="text-xs text-text-muted">{bt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : classified ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <span className="text-2xl">{classified.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text">{classified.title}</p>
                      <Badge className={`text-[10px] px-1.5 py-0 ${riskColor(classified.riskLevel)}`}>
                        {classified.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      We've identified your business as: <strong>{classified.title}</strong>
                    </p>
                  </div>
                </div>
                {!locked && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 rounded-xl bg-primary text-white py-2.5 font-medium"
                    >
                      Yes, that's right
                    </Button>
                    <Button
                      onClick={handleChangeType}
                      variant="outline"
                      className="flex-1 rounded-xl py-2.5 font-medium"
                    >
                      Change it
                    </Button>
                  </div>
                )}
                {locked && (
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="text-xs text-primary hover:underline self-start"
                  >
                    Re-classify
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Employees */}
      <Card className="rounded-2xl border border-border bg-white">
        <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-text">
              Number of employees
            </label>
            <p className="text-xs text-text-muted mt-0.5">(including yourself)</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quoteOptions.employeeBands.map((band) => (
              <button
                key={band.value}
                type="button"
                onClick={() => onChange({...data, employees: band.value})}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  data.employees === band.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text border-border hover:border-primary/50'
                }`}
              >
                {band.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card className="rounded-2xl border border-border bg-white">
        <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-text">
              Estimated annual revenue (next 12 months)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Used to calculate your Business Interruption and Liability limits
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {quoteOptions.revenueBands.map((band) => (
              <button
                key={band.value}
                type="button"
                onClick={() => onChange({...data, revenue: band.value})}
                className={`rounded-xl border px-4 py-3 text-sm text-start font-medium transition-all duration-200 ${
                  data.revenue === band.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'bg-white text-text border-border hover:border-primary/50'
                }`}
              >
                {band.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue */}
      <div className="sticky bottom-4 z-10">
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full rounded-xl bg-primary text-white py-3 font-medium disabled:opacity-50 shadow-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
