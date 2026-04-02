/**
 * Shared TypeScript interfaces for the quote journey.
 *
 * These types are used across multiple quote-step components
 * (results, checkout, company-details, ai-advisor, upload).
 */

export interface BusinessType {
  id: string;
  title: string;
  description: string;
  icon: string;
  riskLevel: string;
  riskFactor: number;
  products: string[];
}

export interface Insurer {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  shariahCompliant: boolean;
  priceMultiplier: number;
}

export interface InsurerQuote extends Insurer {
  total: number;
}

export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
}

export interface QuoteBenefit {
  name: string;
  included: boolean;
}

/** Chip option shown in the AI advisor flow. */
export interface ChipOption {
  label: string;
  value: string;
}

/** AI advisor conversation state. */
export type ConvoStep = 'business' | 'employees' | 'revenue' | 'emirate' | 'done';

export interface ConvoState {
  step: ConvoStep;
  businessType: string;
  businessLabel: string;
  employees: string;
  revenue: string;
  emirate: string;
}

/** Chat message in the AI advisor. */
export interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
  cta?: { label: string; href: string };
  chips?: ChipOption[];
  chipKey?: string;
  fallback?: boolean;
}
