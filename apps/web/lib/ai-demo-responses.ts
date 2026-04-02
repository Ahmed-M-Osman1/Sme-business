/**
 * Scripted fallback responses for when the AI API is unavailable.
 * Matches common business descriptions by keyword and returns a
 * pre-written recommendation.
 */

interface ScriptedResponse {
  keywords: string[];
  businessType: string;
  label: string;
  response: string;
}

const SCRIPTED_RESPONSES: ScriptedResponse[] = [
  {
    keywords: ['cafe', 'café', 'coffee', 'restaurant', 'food', 'catering'],
    businessType: 'cafe-restaurant',
    label: 'Café / Restaurant',
    response:
      "Based on your description, I'd classify your business as **Café / Restaurant**. " +
      'Food & beverage businesses typically need Workers\' Compensation, Public Liability, ' +
      'and Property insurance to cover staff injuries, customer incidents, and equipment damage.',
  },
  {
    keywords: ['consult', 'consulting', 'advisory', 'management', 'strategy'],
    businessType: 'consulting',
    label: 'Consulting / Advisory',
    response:
      "Based on your description, I'd classify your business as **Consulting / Advisory**. " +
      'Professional services firms typically need Workers\' Compensation, Public Liability, ' +
      'and Professional Indemnity insurance to cover advice-related claims and office risks.',
  },
  {
    keywords: ['retail', 'shop', 'store', 'boutique', 'ecommerce', 'e-commerce'],
    businessType: 'retail-trading',
    label: 'Retail / Trading',
    response:
      "Based on your description, I'd classify your business as **Retail / Trading**. " +
      'Retail businesses typically need Workers\' Compensation, Public Liability, ' +
      'and Property insurance to cover inventory, customer incidents, and premises.',
  },
];

export function findScriptedResponse(
  text: string,
): ScriptedResponse | null {
  const lower = text.toLowerCase();
  return (
    SCRIPTED_RESPONSES.find((r) =>
      r.keywords.some((kw) => lower.includes(kw)),
    ) ?? null
  );
}
