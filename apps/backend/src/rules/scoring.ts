import type {Customer} from '@shory/db';

const MS_PER_DAY = 86_400_000;

export function calculateChurnScore(customer: Customer): number {
  let score = 0;
  if (customer.renewalDays <= 7) score += 30;
  if (customer.claimsOpen > 0) score += 20;
  if (customer.paymentStatus === 'overdue') score += 15;
  if (customer.nps !== null && customer.nps <= 6) score += 15;
  if (customer.lastContact) {
    const daysSinceContact = Math.floor(
      (Date.now() - customer.lastContact.getTime()) / MS_PER_DAY,
    );
    if (daysSinceContact > 30) score += 10;
  }
  if (customer.stage === 'lapsed') score += 10;
  return Math.min(score, 100);
}

export function calculateHealthScore(customer: Customer): number {
  let score = 100;
  const churn = calculateChurnScore(customer);
  if (churn >= 70) score -= 25;
  if (customer.claimsOpen > 0) score -= 15;
  if (customer.paymentStatus === 'overdue') score -= 15;
  if (customer.nps !== null && customer.nps <= 6) score -= 10;
  if (customer.renewalDays < 0) score -= 10;
  if (customer.lastContact) {
    const daysSinceContact = Math.floor(
      (Date.now() - customer.lastContact.getTime()) / MS_PER_DAY,
    );
    if (daysSinceContact > 30) score -= 10;
  }
  return Math.max(score, 0);
}
