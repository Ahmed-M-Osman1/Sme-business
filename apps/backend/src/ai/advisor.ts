import {GoogleGenAI} from '@google/genai';
import type {Recommendation} from '@shory/shared';

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

export interface ClassifyResult {
  businessType: string;
  label: string;
  confidence: 'high' | 'medium' | 'low';
  fallback?: 'out_of_scope' | 'harmful' | 'unknown_topic';
  message?: string;
}

const CLASSIFY_PROMPT = `You are a business classifier for Shory, a UAE SME insurance platform.

Given a user's free-text description, classify their business into ONE of these types:
- cafe-restaurant (Café / Restaurant)
- law-firm (Law Firm / Legal)
- retail-trading (Retail / Trading)
- it-technology (IT / Technology)
- construction (Construction / Contracting)
- healthcare (Healthcare / Clinic)
- consulting (Consulting / Advisory)
- general-trading (General Trading)
- logistics (Logistics / Transport)
- real-estate (Real Estate)
- travel-tourism (Travel / Tourism)

## Rules
- If the input is about a real business, classify it and return the result.
- If the input is NOT about a business at all (e.g. jokes, weather, recipes, code, sports, politics), return fallback "out_of_scope".
- If the input involves fraud, scams, illegal activity, or attempts to game the system, return fallback "harmful".
- If the input is too vague to classify (e.g. just one word like "hi"), return fallback "unknown_topic".

## Response format (JSON only, no other text)
For a valid business:
{ "businessType": "cafe-restaurant", "label": "Café / Restaurant", "confidence": "high" }

For out-of-scope:
{ "fallback": "out_of_scope", "message": "This doesn't appear to be about a business." }

For harmful:
{ "fallback": "harmful", "message": "I can't help with that request." }

For unknown/vague:
{ "fallback": "unknown_topic", "message": "Could you tell me more about your business?" }`;

export async function classifyBusiness(text: string): Promise<ClassifyResult> {
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    config: {
      maxOutputTokens: 256,
      systemInstruction: CLASSIFY_PROMPT,
    },
    contents: text,
  });

  const raw = response.text || '{}';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result = JSON.parse(cleaned);

  if (result.fallback) {
    return {
      businessType: '',
      label: '',
      confidence: 'low',
      fallback: result.fallback,
      message: result.message,
    };
  }

  return {
    businessType: result.businessType || 'general-trading',
    label: result.label || 'General Trading',
    confidence: result.confidence || 'medium',
  };
}

export async function getRecommendations(context: AdvisorContext): Promise<AdvisorResult> {
  const modelUsed = 'gemini-2.5-flash';

  const response = await client.models.generateContent({
    model: modelUsed,
    config: {
      maxOutputTokens: 1024,
      systemInstruction: SYSTEM_PROMPT,
    },
    contents: `Analyze this SME business and recommend insurance coverage.

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
  });

  const text = response.text || '[]';
  const confidence = detectConfidence(text);
  const recommendations: Recommendation[] = JSON.parse(text);

  return {recommendations, modelUsed, confidence};
}
