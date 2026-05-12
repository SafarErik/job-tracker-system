import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FootprintLocation } from './global-footprint.models';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

const KNOWN_LOCATION_LOOKUP: Record<string, GeocodingResult> = {
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

@Injectable({ providedIn: 'root' })
export class FootprintGeocodingService {
  private readonly cache = new Map<string, Promise<GeocodingResult>>();

  async resolveLocations(locations: FootprintLocation[]): Promise<FootprintLocation[]> {
    const resolved = await Promise.all(
      locations.map(async (location) => ({
        ...location,
        ...(await this.resolveLocation(location.detail)),
      })),
    );

    return resolved;
  }

  private resolveLocation(query: string): Promise<GeocodingResult> {
    const normalized = normalizeLocationKey(query);

    if (!this.cache.has(normalized)) {
      this.cache.set(normalized, this.fetchLocation(normalized, query));
    }

    return this.cache.get(normalized)!;
  }

  private async fetchLocation(normalized: string, rawQuery: string): Promise<GeocodingResult> {
    const fallback = getFallbackLocation(rawQuery, normalized);
    const token = environment.mapboxAccessToken?.trim();

    if (!token) {
      return fallback;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(rawQuery)}.json?access_token=${encodeURIComponent(token)}&types=place,locality,district,region,country&limit=1`,
      );

      if (!response.ok) {
        return fallback;
      }

      const payload = (await response.json()) as {
        features?: Array<{
          center?: [number, number];
          text?: string;
          place_name?: string;
        }>;
      };

      const feature = payload.features?.[0];
      const center = feature?.center;

      if (!center || center.length < 2) {
        return fallback;
      }

      return {
        latitude: center[1],
        longitude: center[0],
        city: feature.text?.trim() || fallback.city,
        country: extractCountry(feature.place_name) || fallback.country,
      };
    } catch {
      return fallback;
    }
  }
}

function getFallbackLocation(rawQuery: string, normalized: string): GeocodingResult {
  const known = KNOWN_LOCATION_LOOKUP[normalized];
  if (known) {
    return known;
  }

  const seed = stableHash(normalized || rawQuery);
  return {
    city: extractCity(rawQuery),
    country: 'Unknown region',
    latitude: ((Math.abs(seed) % 120) - 60) || 12,
    longitude: ((Math.abs(seed >> 3) % 320) - 160) || -8,
  };
}

function normalizeLocationKey(rawLocation: string): string {
  return extractCity(rawLocation).toLowerCase().trim() || 'remote';
}

function extractCity(rawLocation: string): string {
  const parts = rawLocation.split(',').map((part) => part.trim()).filter(Boolean);
  return parts[0] || 'Remote';
}

function extractCountry(placeName?: string): string | null {
  if (!placeName) {
    return null;
  }

  const parts = placeName.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) ?? null;
}

function stableHash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return hash;
}
