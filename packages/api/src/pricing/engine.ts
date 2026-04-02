import type {QuoteInput, PricingResult, PricingProvider} from './types';
import {mockProviders} from './providers/mock';

export async function calculateQuotes(
  input: QuoteInput,
  providers: PricingProvider[] = mockProviders,
): Promise<PricingResult[]> {
  const results = await Promise.allSettled(providers.map((p) => p.getQuote(input)));

  const successful = results
    .filter((r): r is PromiseFulfilledResult<PricingResult> => r.status === 'fulfilled')
    .map((r) => r.value);

  if (successful.length === 0) {
    throw new Error('All pricing providers failed');
  }

  return successful.sort((a, b) => a.annualPremium - b.annualPremium);
}
