export interface OcrField {
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface OcrResult {
  success: boolean;
  scenario: string;
  fields: {
    companyName: OcrField;
    licenseNumber: OcrField;
    activity: OcrField;
    emirate: OcrField;
    expiryDate: OcrField;
  };
  warnings: string[];
}

interface Scenario {
  name: string;
  fields: OcrResult['fields'];
  warnings: string[];
}

const scenarios: Scenario[] = [
  {
    name: 'restaurant',
    fields: {
      companyName: { value: 'Al Noor Restaurant LLC', confidence: 'high' },
      licenseNumber: { value: '1518968', confidence: 'high' },
      activity: { value: 'Food & Beverage', confidence: 'high' },
      emirate: { value: 'Dubai', confidence: 'high' },
      expiryDate: { value: '17/06/2026', confidence: 'high' },
    },
    warnings: [],
  },
  {
    name: 'trading',
    fields: {
      companyName: { value: 'Gulf Star Trading LLC', confidence: 'high' },
      licenseNumber: { value: '2847291', confidence: 'high' },
      activity: { value: 'General Trading', confidence: 'high' },
      emirate: { value: 'Sharjah', confidence: 'high' },
      expiryDate: { value: '03/11/2025', confidence: 'high' },
    },
    warnings: [],
  },
  {
    name: 'tech',
    fields: {
      companyName: { value: 'ByteShift Technologies DMCC', confidence: 'high' },
      licenseNumber: { value: '7391024', confidence: 'high' },
      activity: { value: 'IT Consulting', confidence: 'high' },
      emirate: { value: 'Dubai', confidence: 'high' },
      expiryDate: { value: '22/09/2026', confidence: 'high' },
    },
    warnings: [],
  },
  {
    name: 'construction',
    fields: {
      companyName: { value: 'Al Baraka Construction LLC', confidence: 'high' },
      licenseNumber: { value: '4521876', confidence: 'high' },
      activity: { value: 'Building & Construction', confidence: 'medium' },
      emirate: { value: 'Abu Dhabi', confidence: 'high' },
      expiryDate: { value: '15/01/2026', confidence: 'high' },
    },
    warnings: [],
  },
  {
    name: 'salon',
    fields: {
      companyName: { value: 'Luxe Beauty Salon', confidence: 'high' },
      licenseNumber: { value: '3298145', confidence: 'high' },
      activity: { value: 'Beauty Services', confidence: 'high' },
      emirate: { value: 'Ajman', confidence: 'high' },
      expiryDate: { value: '08/03/2025', confidence: 'low' },
    },
    warnings: ['Trade license appears to be expired — please renew before purchasing a policy'],
  },
  {
    name: 'blurry',
    fields: {
      companyName: { value: 'Al ??? General Tr...', confidence: 'low' },
      licenseNumber: { value: '98???41', confidence: 'low' },
      activity: { value: 'General Trading', confidence: 'medium' },
      emirate: { value: 'Dubai', confidence: 'high' },
      expiryDate: { value: 'Unclear', confidence: 'low' },
    },
    warnings: ['Some fields could not be read clearly. Please review.'],
  },
];

const happyScenarios = scenarios.slice(0, 4);

function pickScenario(fileName: string): Scenario {
  const lower = fileName.toLowerCase();

  if (lower.includes('restaurant') || lower.includes('cafe')) {
    return scenarios[0];
  }
  if (lower.includes('trading')) {
    return scenarios[1];
  }
  if (lower.includes('tech') || lower.includes('it')) {
    return scenarios[2];
  }
  if (lower.includes('construction')) {
    return scenarios[3];
  }
  if (lower.includes('salon') || lower.includes('beauty')) {
    return scenarios[4];
  }
  if (lower.includes('blurry') || lower.includes('low')) {
    return scenarios[5];
  }

  return happyScenarios[Math.floor(Math.random() * happyScenarios.length)];
}

const stages: Array<{ pct: number; label: string }> = [
  { pct: 0, label: 'Uploading document...' },
  { pct: 30, label: 'Reading trade license...' },
  { pct: 60, label: 'Extracting company details...' },
  { pct: 90, label: 'Done' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockOcrExtract(
  file: File,
  onProgress?: (pct: number, stage: string) => void,
): Promise<OcrResult> {
  const stageDelay = 750; // ~3 seconds total across 4 stages

  for (const stage of stages) {
    onProgress?.(stage.pct, stage.label);
    await delay(stageDelay);
  }

  onProgress?.(100, 'Done');

  const scenario = pickScenario(file.name);

  return {
    success: true,
    scenario: scenario.name,
    fields: scenario.fields,
    warnings: scenario.warnings,
  };
}
