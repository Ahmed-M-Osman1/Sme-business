import recommendationRules from '@/config/recommendation-rules.json';
import type {BusinessType, RecommendationConditionKey, RecommendationRule} from '@/types/quote';

const DEFAULT_PRODUCT_ID = 'public-liability';

const PRODUCT_TO_SIGNAL: Partial<Record<string, RecommendationConditionKey>> = {
  'public-liability': 'customerInteraction',
  'professional-indemnity': 'advisoryServices',
  property: 'businessAssets',
  fleet: 'businessVehicles',
};

const EMPLOYEE_FREE_BANDS = new Set(['', '1', 'solo', 'just-me']);

interface RecommendationProfile {
  hasEmployees: boolean;
  customerInteraction: boolean;
  advisoryServices: boolean;
  businessAssets: boolean;
  businessVehicles: boolean;
}

interface EvaluateRecommendationsInput {
  businessType: BusinessType;
  params: URLSearchParams;
}

interface RecommendationResult {
  products: string[];
  triggeredRuleIds: string[];
  profile: RecommendationProfile;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  return undefined;
}

function inferSignalFromBusinessType(
  businessType: BusinessType,
  key: RecommendationConditionKey,
): boolean {
  if (key === 'hasEmployees') {
    return true;
  }

  return businessType.products.some((productId) => PRODUCT_TO_SIGNAL[productId] === key);
}

function hasAssetsInParams(params: URLSearchParams): boolean | undefined {
  if (params.get('highValueAssets') || params.get('assets')) {
    return true;
  }

  const explicit = parseBoolean(params.get('physicalAssets'));
  if (explicit !== undefined) return explicit;

  for (const key of params.keys()) {
    if (key.startsWith('asset_') && params.get(key)) {
      return true;
    }
  }

  return undefined;
}

function buildRecommendationProfile(
  params: URLSearchParams,
  businessType: BusinessType,
): RecommendationProfile {
  const employeeBand = params.get('employees') ?? '';

  return {
    hasEmployees: parseBoolean(params.get('hasEmployees')) ?? !EMPLOYEE_FREE_BANDS.has(employeeBand),
    customerInteraction:
      parseBoolean(params.get('customerInteraction')) ??
      inferSignalFromBusinessType(businessType, 'customerInteraction'),
    advisoryServices:
      parseBoolean(params.get('advisoryServices')) ??
      inferSignalFromBusinessType(businessType, 'advisoryServices'),
    businessAssets:
      hasAssetsInParams(params) ??
      inferSignalFromBusinessType(businessType, 'businessAssets'),
    businessVehicles:
      parseBoolean(params.get('businessVehicles')) ??
      inferSignalFromBusinessType(businessType, 'businessVehicles'),
  };
}

export function evaluateRecommendations({
  businessType,
  params,
}: EvaluateRecommendationsInput): RecommendationResult {
  const source = params.get('source');
  if (source === 'pre-configured') {
    return {
      products: businessType.products,
      triggeredRuleIds: [],
      profile: buildRecommendationProfile(params, businessType),
    };
  }

  const profile = buildRecommendationProfile(params, businessType);
  const rules = recommendationRules as RecommendationRule[];

  const triggered = rules.filter((rule) => profile[rule.conditionKey]);
  const productIds = triggered.map((rule) => rule.productId);

  if (productIds.length === 0) {
    productIds.push(DEFAULT_PRODUCT_ID);
  }

  return {
    products: Array.from(new Set(productIds)),
    triggeredRuleIds: triggered.map((rule) => rule.id),
    profile,
  };
}
