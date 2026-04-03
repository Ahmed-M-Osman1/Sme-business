// eslint-disable-next-line @typescript-eslint/no-require-imports
import Anthropic from '@anthropic-ai/sdk';
import type {Recommendation} from '@shory/shared';

// Vercel resolves this module differently than local — use any to bypass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = new (Anthropic as any)();

interface AdvisorContext {
  industry: string;
  businessType: string | null;
  employeesCount: number;
  emirate: string;
  coverageType: string;
}

export async function getRecommendations(context: AdvisorContext): Promise<{
  recommendations: Recommendation[];
  modelUsed: string;
}> {
  const modelUsed = 'claude-sonnet-4-6';

  const response = await client.messages.create({
    model: modelUsed,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an insurance advisor for SME businesses in the UAE. Analyze this business and recommend insurance coverage.

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
  const recommendations: Recommendation[] = JSON.parse(text);

  return {recommendations, modelUsed};
}
