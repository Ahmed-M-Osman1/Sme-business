export interface UaePassCompany {
  id: string;
  businessName: string;
  licenceNumber: string;
  businessType: string;
  businessLabel: string;
  activity: string;
  employees: string;
  revenue: string;
  revenueLabel: string;
  location: string;
  /** ISO date string yyyy-mm-dd */
  licenceExpiry: string;
}

export interface UaePassAccount {
  name: string;
  email?: string;
  phone?: string;
  emiratesId: string;
  /** Multi-business profile (used by the licence flow). */
  companies?: UaePassCompany[];
  /** Legacy single-business shape (used by older quote flows). */
  businessName?: string;
  licenceNumber?: string;
  businessType?: string;
  activity?: string;
  employees?: string;
  revenue?: string;
  location?: string;
}

export function readUaePassSession(): UaePassAccount | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('uaepass-data');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UaePassAccount;
  } catch {
    return null;
  }
}

export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const target = new Date(isoDate + 'T00:00:00Z');
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const diffMs = target.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatExpiryDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'});
}

const EXPIRY_WARNING_DAYS = 60;

export function isLicenceExpiringSoon(isoDate: string): boolean {
  const days = daysUntil(isoDate);
  return days >= 0 && days <= EXPIRY_WARNING_DAYS;
}
