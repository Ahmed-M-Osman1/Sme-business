export interface DashboardStatsResponse {
  totalQuotes: number;
  quotesThisWeek: number;
  acceptedQuotes: number;
  pendingQuotes: number;
  totalCustomers: number;
  activeIncidents: number;
  degradedServices: number;
  unreadAlerts: number;
}

export interface CustomerPlatformContext {
  flag: boolean;
  issue: string | null;
  detail: string | null;
  severity: 'low' | 'medium' | 'high' | null;
}

export interface PlaybookResult {
  type: string;
  urgency: string;
  badge: string;
  headline: string;
  body: string;
  actions: string[];
  inboundGuide: {
    title: string;
    points: string[];
    contextNote: string;
  };
}
