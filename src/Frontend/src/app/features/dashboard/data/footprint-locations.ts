import { Company } from '../../companies/models/company.model';
import { JobApplicationStatus } from '../../job-applications/models/application-status.enum';
import { JobApplication } from '../../job-applications/models/job-application.model';
import { WorkplaceType } from '../../job-applications/models/workplace-type.enum';
import { FootprintLocation, FootprintSignalCard } from '../components/global-footprint/global-footprint.models';

interface GeoAnchor {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface MarketOpportunitySeed {
  companyName: string;
  roleTitle: string;
  summary: string;
  workplaceLabel: string;
  techStack: string[];
  emphasis: string;
}

interface LocationBucket {
  geo: GeoAnchor;
  detail: string;
  applications: FootprintSignalCard[];
  nearbyRoles: FootprintSignalCard[];
  pulse: Set<string>;
}

const GEO_LOOKUP: Record<string, GeoAnchor> = {
  london: { city: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  berlin: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  amsterdam: { city: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  paris: { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  dublin: { city: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603 },
  singapore: { city: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  sydney: { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  tokyo: { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  toronto: { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  'new york': { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  chicago: { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  seattle: { city: 'Seattle', country: 'United States', latitude: 47.6062, longitude: -122.3321 },
  austin: { city: 'Austin', country: 'United States', latitude: 30.2672, longitude: -97.7431 },
  'san francisco': {
    city: 'San Francisco',
    country: 'United States',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  'los angeles': {
    city: 'Los Angeles',
    country: 'United States',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  remote: { city: 'Remote', country: 'Distributed', latitude: 18, longitude: -18 },
};

const MARKET_SIGNAL_LIBRARY: Record<string, MarketOpportunitySeed[]> = {
  London: [
    {
      companyName: 'Monzo',
      roleTitle: 'Senior Frontend Engineer',
      summary:
        'Consumer fintech team shipping high-frequency product surfaces and internal design system work.',
      workplaceLabel: 'Hybrid',
      techStack: ['Angular', 'TypeScript', 'Design Systems'],
      emphasis: 'Strong product velocity',
    },
    {
      companyName: 'Synthace',
      roleTitle: 'Platform UI Engineer',
      summary:
        'Scientific workflow platform with data-heavy interfaces and collaborative operations tooling.',
      workplaceLabel: 'Hybrid',
      techStack: ['Angular', 'RxJS', 'Visualization'],
      emphasis: 'Data-rich UI',
    },
  ],
  Berlin: [
    {
      companyName: 'N26',
      roleTitle: 'Staff Product Engineer',
      summary:
        'Mobile-first banking org looking for customer-facing frontend ownership and platform maturity.',
      workplaceLabel: 'Hybrid',
      techStack: ['TypeScript', 'Frontend Architecture', 'Design Systems'],
      emphasis: 'High ownership scope',
    },
  ],
  Amsterdam: [
    {
      companyName: 'Miro',
      roleTitle: 'UI Platform Engineer',
      summary:
        'Collaboration suite expanding shared UI primitives and editor performance work.',
      workplaceLabel: 'Hybrid',
      techStack: ['Angular', 'Canvas', 'Performance'],
      emphasis: 'Platform mission',
    },
  ],
  Dublin: [
    {
      companyName: 'HubSpot',
      roleTitle: 'Senior UI Engineer',
      summary:
        'Growth teams building workflow-heavy CRM experiences with experimentation baked in.',
      workplaceLabel: 'Hybrid',
      techStack: ['TypeScript', 'Testing', 'Accessibility'],
      emphasis: 'Scale + experimentation',
    },
  ],
  'San Francisco': [
    {
      companyName: 'Linear',
      roleTitle: 'Product Engineer',
      summary:
        'Quality-focused product team with a bias for polished interfaces and fast execution cycles.',
      workplaceLabel: 'Remote-friendly',
      techStack: ['TypeScript', 'Interaction Design', 'Performance'],
      emphasis: 'Craft-heavy product culture',
    },
    {
      companyName: 'Anthropic',
      roleTitle: 'Frontend Engineer, Console',
      summary:
        'AI product surfaces around developer workflows, observability, and enterprise controls.',
      workplaceLabel: 'Hybrid',
      techStack: ['Angular', 'Complex Workflows', 'Design Systems'],
      emphasis: 'AI tooling',
    },
  ],
  Remote: [
    {
      companyName: 'Remote-first Watchlist',
      roleTitle: 'Principal Angular Engineer',
      summary:
        'Mock market context for distributed teams with enterprise dashboards and multi-tenant products.',
      workplaceLabel: 'Remote',
      techStack: ['Angular', 'Tailwind', 'Architecture'],
      emphasis: 'Distributed by default',
    },
  ],
};

export function buildFootprintLocations(
  applications: JobApplication[],
  companies: Company[],
): FootprintLocation[] {
  const companyLookup = new Map(companies.map((company) => [company.id, company]));
  const buckets = new Map<string, LocationBucket>();

  for (const application of applications) {
    const company = companyLookup.get(application.companyId);
    const detail = company?.hqLocation?.trim() || 'Remote';
    const geo = resolveGeoAnchor(detail);
    const bucket = getOrCreateBucket(buckets, geo, detail);

    bucket.applications.push(buildApplicationCard(application, company));

    if (company?.industry) {
      bucket.pulse.add(company.industry);
    }
  }

  for (const company of companies.filter((item) => item.totalApplications === 0)) {
    const detail = company.hqLocation?.trim() || 'Remote';
    const geo = resolveGeoAnchor(detail);
    const bucket = getOrCreateBucket(buckets, geo, detail);
    bucket.nearbyRoles.push(buildWatchlistCard(company));
    bucket.pulse.add('Watchlist opportunity');
  }

  for (const bucket of buckets.values()) {
    const seeds = MARKET_SIGNAL_LIBRARY[bucket.geo.city] ?? [];
    const existingCompanies = new Set(
      [...bucket.applications, ...bucket.nearbyRoles].map((card) => card.companyName.toLowerCase()),
    );

    for (const seed of seeds) {
      if (existingCompanies.has(seed.companyName.toLowerCase())) {
        continue;
      }

      bucket.nearbyRoles.push({
        id: `${bucket.geo.city}-${slugify(seed.companyName)}-${slugify(seed.roleTitle)}`,
        companyName: seed.companyName,
        roleTitle: seed.roleTitle,
        summary: seed.summary,
        statusLabel: 'Nearby',
        workplaceLabel: seed.workplaceLabel,
        sourceLabel: 'Mock market context',
        techStack: seed.techStack,
        emphasis: seed.emphasis,
      });
    }
  }

  return [...buckets.values()]
    .map((bucket) => {
      const kind: FootprintLocation['kind'] =
        bucket.applications.length > 0 && bucket.nearbyRoles.length > 0
          ? 'mixed'
          : bucket.applications.length > 0
            ? 'application'
            : 'opportunity';

      return {
        id: `${slugify(bucket.geo.city)}-${slugify(bucket.geo.country)}`,
        city: bucket.geo.city,
        country: bucket.geo.country,
        label: `${bucket.geo.city}, ${bucket.geo.country}`,
        detail: bucket.detail,
        latitude: bucket.geo.latitude,
        longitude: bucket.geo.longitude,
        kind,
        applications: bucket.applications.slice(0, 3),
        nearbyRoles: bucket.nearbyRoles.slice(0, 3),
        pulse: buildPulse(bucket),
      };
    })
    .sort((left, right) => locationWeight(right) - locationWeight(left));
}

function getOrCreateBucket(
  buckets: Map<string, LocationBucket>,
  geo: GeoAnchor,
  detail: string,
): LocationBucket {
  const key = `${geo.city}|${geo.country}`;
  const existing = buckets.get(key);
  if (existing) {
    return existing;
  }

  const next: LocationBucket = {
    geo,
    detail,
    applications: [],
    nearbyRoles: [],
    pulse: new Set<string>(),
  };
  buckets.set(key, next);
  return next;
}

function buildPulse(bucket: LocationBucket): string[] {
  const pulse = [
    `${bucket.applications.length} tracked application${bucket.applications.length === 1 ? '' : 's'}`,
    `${bucket.nearbyRoles.length} nearby context item${bucket.nearbyRoles.length === 1 ? '' : 's'}`,
    ...bucket.pulse,
  ];

  return pulse.slice(0, 4);
}

function buildApplicationCard(
  application: JobApplication,
  company?: Company,
): FootprintSignalCard {
  return {
    id: application.id,
    companyName: company?.name ?? application.companyName ?? 'Tracked company',
    roleTitle: application.position,
    summary:
      company?.description?.trim() ||
      `Tracked application for ${application.position} with ${company?.industry?.toLowerCase() ?? 'product'} context and dashboard-ready overview data.`,
    statusLabel: getStatusLabel(application.status),
    workplaceLabel: getWorkplaceLabel(application.workplaceType),
    sourceLabel: 'Tracked application',
    techStack: company?.techStack?.slice(0, 4) ?? [],
    website: company?.website,
    emphasis: application.matchScore > 0 ? `${application.matchScore}% match` : undefined,
  };
}

function buildWatchlistCard(company: Company): FootprintSignalCard {
  const fallbackRole =
    company.recentApplications[0]?.position ||
    (company.industry ? `${company.industry} opportunity` : 'Open product role');

  return {
    id: `watchlist-${company.id}`,
    companyName: company.name,
    roleTitle: fallbackRole,
    summary:
      company.description?.trim() ||
      `Watchlist company with ${company.compatibilityScore}% compatibility and enough metadata to surface as nearby context.`,
    statusLabel: 'Watchlist',
    workplaceLabel: 'Hybrid-ready',
    sourceLabel: 'Tracked company',
    techStack: company.techStack.slice(0, 4),
    website: company.website,
    emphasis:
      company.compatibilityScore > 0 ? `${company.compatibilityScore}% fit score` : undefined,
  };
}

function resolveGeoAnchor(rawLocation: string): GeoAnchor {
  const normalized = normalizeLocationKey(rawLocation);
  const known = GEO_LOOKUP[normalized];
  if (known) {
    return known;
  }

  const seed = stableHash(normalized || rawLocation);
  return {
    city: extractCity(rawLocation),
    country: 'Unknown region',
    latitude: ((Math.abs(seed) % 120) - 60) || 12,
    longitude: ((Math.abs(seed >> 3) % 320) - 160) || -8,
  };
}

function normalizeLocationKey(rawLocation: string): string {
  const city = extractCity(rawLocation).toLowerCase().trim();
  return city || 'remote';
}

function extractCity(rawLocation: string): string {
  const parts = rawLocation.split(',').map((part) => part.trim()).filter(Boolean);
  return parts[0] || 'Remote';
}

function getStatusLabel(status: JobApplicationStatus): string {
  switch (status) {
    case JobApplicationStatus.Applied:
      return 'Applied';
    case JobApplicationStatus.PhoneScreen:
      return 'Phone screen';
    case JobApplicationStatus.TechnicalTask:
      return 'Technical';
    case JobApplicationStatus.Interviewing:
      return 'Interview';
    case JobApplicationStatus.Offer:
      return 'Offer';
    case JobApplicationStatus.Accepted:
      return 'Accepted';
    case JobApplicationStatus.Rejected:
      return 'Rejected';
    case JobApplicationStatus.Ghosted:
      return 'Ghosted';
    default:
      return 'Active';
  }
}

function getWorkplaceLabel(workplace: WorkplaceType): string {
  switch (workplace) {
    case WorkplaceType.OnSite:
      return 'On-site';
    case WorkplaceType.Hybrid:
      return 'Hybrid';
    case WorkplaceType.Remote:
      return 'Remote';
    default:
      return 'Flexible';
  }
}

function locationWeight(location: FootprintLocation): number {
  return location.applications.length * 2 + location.nearbyRoles.length;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stableHash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return hash;
}
