export interface FootprintSignalCard {
  id: string;
  companyName: string;
  roleTitle: string;
  summary: string;
  statusLabel: string;
  workplaceLabel: string;
  sourceLabel: string;
  techStack: string[];
  website?: string;
  emphasis?: string;
}

export interface FootprintLocation {
  id: string;
  city: string;
  country: string;
  label: string;
  detail: string;
  latitude: number;
  longitude: number;
  kind: 'application' | 'opportunity' | 'mixed';
  applications: FootprintSignalCard[];
  nearbyRoles: FootprintSignalCard[];
  pulse: string[];
}
