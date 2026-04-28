export type BrandId = 'shory' | 'tamm';

export interface LocationOption {
  label: string;
  value: string;
}

export interface TrustBadge {
  label: string;
  icon: string;
}

export interface LegalReferences {
  healthInsuranceLaw: string;
  healthAuthority: string;
  economicDept: string;
  workersCompLaw: string;
  freeZone: string;
  freeZoneRequirement: string;
  motorLaw: string;
}

export interface UaePassMockData {
  businessName: string;
  licenceNumber: string;
  activity: string;
  location: string;
  legalForm: string;
  ownerName: string;
  emiratesId: string;
  employees: string;
  revenue: string;
  businessType: string;
  businessLabel: string;
}

export interface ComplianceItem {
  category: string;
  items: { name: string; law: string }[];
}

export interface BrandConfig {
  id: BrandId;
  displayName: string;
  tagline: string;
  logoPath: string;
  logoAlt: string;

  // Geography
  locations: LocationOption[];
  locationLabel: string;
  locationMultipliers: Record<string, number>;
  defaultLocation: string;

  // Legal
  legalReferences: LegalReferences;
  compliancePanel: ComplianceItem[];
  /** Locations where employee health insurance is legally mandatory. Use ['*'] for all locations. */
  healthInsuranceMandatoryLocations: string[];

  // Trust & branding
  trustBadges: TrustBadge[];
  footerText: string;
  footerCopyright: string;

  // UAE PASS
  uaePassEnabled: boolean;
  uaePassMockData: UaePassMockData | null;

  // AI
  aiPromptVariant: BrandId;

  // Metadata
  metadata: {
    title: string;
    description: string;
  };

  // Styling hints (for things CSS alone can't handle)
  navStyle: 'light' | 'dark';
  issuingAuthorities: string[];
  basePath: string;
}
