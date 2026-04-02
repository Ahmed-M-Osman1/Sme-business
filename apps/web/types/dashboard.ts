export interface EnrichedPolicy {
  id: string;
  policyNumber: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  products: string[];
  businessName: string;
  providerId: string;
  providerName: string;
  annualPremium: string;
}

export interface UserStats {
  activePolicies: number;
  annualSpend: number;
  daysToRenewal: number | null;
}

export type DashboardTab = 'policies' | 'claims' | 'documents' | 'settings';
