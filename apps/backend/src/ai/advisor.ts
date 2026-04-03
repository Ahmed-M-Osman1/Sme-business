// eslint-disable-next-line @typescript-eslint/no-require-imports
import Anthropic from '@anthropic-ai/sdk';
import type {Recommendation} from '@shory/shared';

// Vercel resolves this module differently than local — use any to bypass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = new (Anthropic as any)();

const SYSTEM_PROMPT = `You are a professional AI insurance advisor for SME businesses in the UAE, working for Shory — a digital insurance platform.

## Guidelines

### Answer Quality
- Provide concise, accurate, and relevant insurance recommendations.
- Prioritise UAE-specific regulatory requirements and market practices.
- Avoid speculation — only recommend coverage types you are confident apply to the business profile.
- Format responses as structured JSON as instructed. Keep reasoning short (1-2 sentences).

### Domain Boundary
You ONLY answer questions related to UAE SME business insurance.
If asked about anything outside this scope, respond with:
{ "error": "out_of_scope", "message": "This falls outside UAE SME business insurance. For other topics, please contact Shory support." }

### Hard Rules
- Never fabricate facts or invent coverage types.
- Never recommend coverage that does not exist in the UAE insurance market.
- Never provide legal, tax, or financial advice beyond insurance recommendations.
- If you cannot confidently recommend coverage for a given business profile, return an empty array [] rather than guessing.

### Confidence
- If your recommendation is based on incomplete information, include a note in the reasoning field: "Based on limited information — please verify with your insurer."
- Only recommend coverage you are confident applies to the described business.`;

interface AdvisorContext {
  industry: string;
  businessType: string | null;
  employeesCount: number;
  emirate: string;
  coverageType: string;
}

export interface AdvisorResult {
  recommendations: Recommendation[];
  modelUsed: string;
  confidence: 'high' | 'medium' | 'low';
}

const HEDGING_PHRASES = [
  'i think',
  'i believe',
  "i'm not sure",
  'possibly',
  'might be',
  'perhaps',
  'it could be',
  'not certain',
];

function detectConfidence(text: string): 'high' | 'medium' | 'low' {
  const lower = text.toLowerCase();
  const hedgeCount = HEDGING_PHRASES.filter((phrase) => lower.includes(phrase)).length;
  if (hedgeCount >= 3) return 'low';
  if (hedgeCount >= 1) return 'medium';
  return 'high';
}

export async function getRecommendations(context: AdvisorContext): Promise<AdvisorResult> {
  const modelUsed = 'claude-sonnet-4-6';

  const response = await client.messages.create({
    model: modelUsed,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this SME business and recommend insurance coverage.

Business details:
- Industry: ${context.industry}
- Business type: ${context.businessType ?? 'Not specified'}
- Number of employees: ${context.employeesCount}
- Emirate: ${context.emirate}
- Current coverage interest: ${context.coverageType}

Return a JSON array of recommendations. Each recommendation must have:
- coverageType: string (one of: property, liability, workers-compensation, fleet, comprehensive)
- recommendedAmount: number (annual AED amount)
- reasoning: string (1-2 sentences explaining why)
- priority: "high" | "medium" | "low"

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
  const confidence = detectConfidence(text);
  const recommendations: Recommendation[] = JSON.parse(text);

  return {recommendations, modelUsed, confidence};
}
