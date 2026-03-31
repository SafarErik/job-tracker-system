import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { FootprintGeocodingService } from './footprint-geocoding.service';
import { FootprintLocation } from './global-footprint.models';

export type { FootprintLocation, FootprintSignalCard } from './global-footprint.models';

type FootprintFilter = 'all' | 'applications' | 'nearby';
type GlobeMode = 'preview' | 'expanded';

interface GlobePoint {
  id: string;
  lat: number;
  lng: number;
  city: string;
  label: string;
  altitude: number;
  radius: number;
  color: string;
  location: FootprintLocation;
}

interface RingDatum {
  lat: number;
  lng: number;
  color: string;
  maxRadius: number;
  propagationSpeed: number;
  repeatPeriod: number;
}

interface GlobeCameraView {
  lat: number;
  lng: number;
  altitude: number;
}

interface GlobeControls {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enablePan: boolean;
  enableZoom: boolean;
  minDistance?: number;
  maxDistance?: number;
  rotateSpeed: number;
  zoomSpeed: number;
}

interface GlobeInstance {
  width(value: number): GlobeInstance;
  height(value: number): GlobeInstance;
  backgroundColor(value: string): GlobeInstance;
  globeImageUrl(value: string): GlobeInstance;
  bumpImageUrl(value: string): GlobeInstance;
  showAtmosphere(value: boolean): GlobeInstance;
  atmosphereColor(value: string): GlobeInstance;
  atmosphereAltitude(value: number): GlobeInstance;
  pointOfView(view: { lat?: number; lng?: number; altitude?: number }, transitionMs?: number): GlobeInstance;
  pointsData(data: GlobePoint[]): GlobeInstance;
  pointLat(value: string | ((point: GlobePoint) => number)): GlobeInstance;
  pointLng(value: string | ((point: GlobePoint) => number)): GlobeInstance;
  pointAltitude(value: string | ((point: GlobePoint) => number)): GlobeInstance;
  pointRadius(value: string | ((point: GlobePoint) => number)): GlobeInstance;
  pointColor(value: string | ((point: GlobePoint) => string)): GlobeInstance;
  pointLabel(value: string | ((point: GlobePoint) => string)): GlobeInstance;
  pointsTransitionDuration(value: number): GlobeInstance;
  ringsData(data: RingDatum[]): GlobeInstance;
  ringLat(value: string | ((ring: RingDatum) => number)): GlobeInstance;
  ringLng(value: string | ((ring: RingDatum) => number)): GlobeInstance;
  ringColor(value: string | ((ring: RingDatum) => string)): GlobeInstance;
  ringMaxRadius(value: string | ((ring: RingDatum) => number)): GlobeInstance;
  ringPropagationSpeed(value: string | ((ring: RingDatum) => number)): GlobeInstance;
  ringRepeatPeriod(value: string | ((ring: RingDatum) => number)): GlobeInstance;
  onPointClick(callback: (point: GlobePoint) => void): GlobeInstance;
  onPointHover(callback: (point: GlobePoint | null) => void): GlobeInstance;
  controls(): GlobeControls;
  _destructor?(): void;
}

interface GlobeConstructor {
  new (
    hostElement: HTMLElement,
    options?: { animateIn?: boolean; waitForGlobeReady?: boolean; rendererConfig?: object },
  ): GlobeInstance;
}

const EARTH_TEXTURE_URL = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';
const EARTH_BUMP_TEXTURE_URL = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

@Component({
  selector: 'app-global-footprint',
  imports: [...HlmSkeletonImports, ...HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-footprint.component.html',
  styleUrl: './global-footprint.component.css',
})
export class GlobalFootprintComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly geocodingService = inject(FootprintGeocodingService);

  readonly locations = input<FootprintLocation[]>([]);
  readonly loading = input(false);

  readonly previewGlobeHost = viewChild<ElementRef<HTMLElement>>('previewGlobeHost');
  readonly expandedGlobeHost = viewChild<ElementRef<HTMLElement>>('expandedGlobeHost');

  readonly activeFilter = signal<FootprintFilter>('all');
  readonly selectedLocationId = signal<string | null>(null);
  readonly hoveredLocationId = signal<string | null>(null);
  readonly isExpanded = signal(false);
  readonly autoOrbitEnabled = signal(true);
  readonly resolvedLocations = signal<FootprintLocation[]>([]);

  readonly filteredLocations = computed(() => {
    const filter = this.activeFilter();
    const locations = this.resolvedLocations().length ? this.resolvedLocations() : this.locations();

    if (filter === 'applications') {
      return locations.filter((location) => location.applications.length > 0);
    }

    if (filter === 'nearby') {
      return locations.filter((location) => location.nearbyRoles.length > 0);
    }

    return locations;
  });

  readonly selectedLocation = computed(() => {
    const locationId = this.selectedLocationId();
    const locations = this.filteredLocations();

    return locations.find((location) => location.id === locationId) ?? locations[0] ?? null;
  });

  readonly selectedLocationKey = computed(() => this.selectedLocation()?.id ?? null);
  readonly hoveredLocation = computed(() => {
    const hoveredId = this.hoveredLocationId();
    return this.filteredLocations().find((location) => location.id === hoveredId) ?? null;
  });
  readonly hoveredLocationKey = computed(() => this.hoveredLocation()?.id ?? null);

  readonly locationStats = computed(() => {
    const locations = this.filteredLocations();
    return {
      total: locations.length,
      applicationHubs: locations.filter((location) => location.applications.length > 0).length,
      totalNearbyRoles: locations.reduce(
        (total, location) => total + location.nearbyRoles.length,
        0,
      ),
    };
  });

  readonly quickJumpLocations = computed(() =>
    [...this.filteredLocations()]
      .sort((left, right) => locationWeight(right) - locationWeight(left))
      .slice(0, 5),
  );

  private globeModulePromise: Promise<GlobeConstructor> | null = null;
  private previewGlobe: GlobeInstance | null = null;
  private expandedGlobe: GlobeInstance | null = null;
  private geocodeVersion = 0;

  constructor() {
    effect(
      () => {
        const locations = this.locations();
        const requestVersion = ++this.geocodeVersion;

        void this.geocodingService.resolveLocations(locations).then((resolvedLocations) => {
          if (requestVersion !== this.geocodeVersion) {
            return;
          }

          this.resolvedLocations.set(resolvedLocations);

          if (!this.selectedLocationId() && resolvedLocations[0]) {
            this.selectedLocationId.set(resolvedLocations[0].id);
          }
        });
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        const locations = this.filteredLocations();
        if (!locations.length) {
          return;
        }

        if (!this.selectedLocationId()) {
          this.selectedLocationId.set(locations[0].id);
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      const host = this.previewGlobeHost()?.nativeElement;
      const loading = this.loading();
      const locations = this.filteredLocations();

      if (!host || loading || !locations.length) {
        return;
      }

      void this.ensureGlobe('preview', host);
    });

    effect(() => {
      const host = this.expandedGlobeHost()?.nativeElement;
      const expanded = this.isExpanded();
      const loading = this.loading();
      const locations = this.filteredLocations();

      if (!expanded || !host || loading || !locations.length) {
        return;
      }

      void this.ensureGlobe('expanded', host);
    });

    effect(() => {
      this.filteredLocations();
      this.selectedLocationKey();
      this.hoveredLocationKey();
      this.autoOrbitEnabled();

      this.updateGlobeScene('preview');
      this.updateGlobeScene('expanded');
    });

    this.destroyRef.onDestroy(() => {
      this.previewGlobe?._destructor?.();
      this.expandedGlobe?._destructor?.();
    });
  }

  setFilter(filter: FootprintFilter): void {
    this.activeFilter.set(filter);
  }

  openExpandedView(): void {
    if (!this.filteredLocations().length) {
      return;
    }

    this.autoOrbitEnabled.set(true);
    this.isExpanded.set(true);
  }

  closeExpandedView(): void {
    this.isExpanded.set(false);
  }

  toggleAutoOrbit(): void {
    this.autoOrbitEnabled.update((value) => !value);
  }

  focusLocation(location: FootprintLocation): void {
    this.selectedLocationId.set(location.id);
    this.hoveredLocationId.set(location.id);
    this.autoOrbitEnabled.set(false);
    this.flyToLocation(this.expandedGlobe, location, 1200, true);
  }

  onLocationEnter(locationId: string): void {
    this.hoveredLocationId.set(locationId);
  }

  onLocationLeave(locationId: string): void {
    if (this.hoveredLocationId() === locationId) {
      this.hoveredLocationId.set(null);
    }
  }

  trackByLocation(_: number, location: FootprintLocation): string {
    return location.id;
  }

  private async ensureGlobe(mode: GlobeMode, host: HTMLElement): Promise<void> {
    const existing = mode === 'preview' ? this.previewGlobe : this.expandedGlobe;
    if (existing) {
      this.resizeGlobe(existing, host);
      this.updateGlobeScene(mode);
      return;
    }

    const Globe = await this.loadGlobeConstructor();
    if (mode === 'preview') {
      host.style.pointerEvents = 'none';
    }

    const globe = new Globe(host, {
      animateIn: mode === 'expanded',
      waitForGlobeReady: true,
      rendererConfig: { antialias: true, alpha: true },
    });

    globe
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(EARTH_TEXTURE_URL)
      .bumpImageUrl(EARTH_BUMP_TEXTURE_URL)
      .showAtmosphere(true)
      .atmosphereColor('#4b8dff')
      .atmosphereAltitude(mode === 'expanded' ? 0.2 : 0.12)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude((point) => point.altitude)
      .pointRadius((point) => point.radius)
      .pointColor((point) => point.color)
      .pointLabel((point) => this.buildPointLabel(point.location))
      .pointsTransitionDuration(700)
      .ringLat('lat')
      .ringLng('lng')
      .ringColor((ring) => ring.color)
      .ringMaxRadius((ring) => ring.maxRadius)
      .ringPropagationSpeed((ring) => ring.propagationSpeed)
      .ringRepeatPeriod((ring) => ring.repeatPeriod)
      .onPointHover((point) => this.hoveredLocationId.set(point?.location.id ?? null));

    if (mode === 'expanded') {
      globe.onPointClick((point) => this.focusLocation(point.location));
    } else {
      const controls = globe.controls();
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0;
      controls.zoomSpeed = 0;
    }

    const controls = globe.controls();
    controls.autoRotate = mode === 'preview' ? true : this.autoOrbitEnabled();
    controls.autoRotateSpeed = mode === 'preview' ? 0.45 : 0.7;
    controls.enablePan = false;
    controls.enableZoom = mode === 'expanded';
    controls.rotateSpeed = mode === 'expanded' ? 0.9 : 0;
    controls.zoomSpeed = mode === 'expanded' ? 0.85 : 0;
    controls.minDistance = 140;
    controls.maxDistance = mode === 'expanded' ? 420 : 260;

    this.resizeGlobe(globe, host);

    if (mode === 'preview') {
      this.previewGlobe = globe;
    } else {
      this.expandedGlobe = globe;
    }

    this.updateGlobeScene(mode);
  }

  private updateGlobeScene(mode: GlobeMode): void {
    const globe = mode === 'preview' ? this.previewGlobe : this.expandedGlobe;
    const host = mode === 'preview'
      ? this.previewGlobeHost()?.nativeElement
      : this.expandedGlobeHost()?.nativeElement;

    if (!globe || !host) {
      return;
    }

    this.resizeGlobe(globe, host);

    const points = this.filteredLocations().map((location) => this.toGlobePoint(location));
    globe.pointsData(points);

    const selected = this.selectedLocation();
    globe.ringsData(selected ? [this.toRingDatum(selected)] : []);

    const controls = globe.controls();
    controls.autoRotate = mode === 'preview' ? true : this.autoOrbitEnabled();

    if (mode === 'preview') {
      globe.pointOfView({ lat: 18, lng: 10, altitude: 2.35 }, 600);
      return;
    }

    if (this.autoOrbitEnabled()) {
      globe.pointOfView(getWorldView(), 900);
      return;
    }

    if (selected) {
      this.flyToLocation(globe, selected, 900, true);
    }
  }

  private resizeGlobe(globe: GlobeInstance, host: HTMLElement): void {
    const rect = host.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width), 1);
    const height = Math.max(Math.floor(rect.height), 1);
    globe.width(width).height(height);
  }

  private flyToLocation(
    globe: GlobeInstance | null,
    location: FootprintLocation,
    transitionMs: number,
    closeUp: boolean,
  ): void {
    globe?.pointOfView(getLocationView(location, closeUp), transitionMs);
  }

  private toGlobePoint(location: FootprintLocation): GlobePoint {
    return {
      id: location.id,
      lat: location.latitude,
      lng: location.longitude,
      city: location.city,
      label: location.label,
      altitude: location.kind === 'application' ? 0.16 : location.kind === 'mixed' ? 0.2 : 0.11,
      radius: location.kind === 'mixed' ? 0.6 : 0.48,
      color:
        location.kind === 'application'
          ? '#4f8dff'
          : location.kind === 'mixed'
            ? '#7fb3ff'
            : '#6be3ff',
      location,
    };
  }

  private toRingDatum(location: FootprintLocation): RingDatum {
    return {
      lat: location.latitude,
      lng: location.longitude,
      color: '#7fb3ff',
      maxRadius: 4.8,
      propagationSpeed: 1.2,
      repeatPeriod: 900,
    };
  }

  private buildPointLabel(location: FootprintLocation): string {
    return `
      <div style="padding:8px 10px;border-radius:12px;background:rgba(11,18,32,.9);border:1px solid rgba(95,152,255,.22);color:#f8fafc;min-width:180px">
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7fb3ff;font-weight:700">${escapeHtml(location.city)}, ${escapeHtml(location.country)}</div>
        <div style="margin-top:6px;font-size:13px;font-weight:700">${escapeHtml(location.detail)}</div>
        <div style="margin-top:6px;font-size:12px;color:#cbd5e1">${location.applications.length} tracked role${location.applications.length === 1 ? '' : 's'} | ${location.nearbyRoles.length} nearby</div>
      </div>
    `;
  }

  private async loadGlobeConstructor(): Promise<GlobeConstructor> {
    if (!this.globeModulePromise) {
      this.globeModulePromise = import('globe.gl').then(
        (module) => module.default as GlobeConstructor,
      );
    }

    return this.globeModulePromise;
  }
}

function locationWeight(location: FootprintLocation): number {
  return location.applications.length * 2 + location.nearbyRoles.length;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getWorldView(): GlobeCameraView {
  return {
    lat: 18,
    lng: 10,
    altitude: 2.45,
  };
}

function getLocationView(location: FootprintLocation, closeUp: boolean): GlobeCameraView {
  const isRemoteCluster =
    location.city.toLowerCase() === 'remote' || location.country.toLowerCase() === 'distributed';

  if (isRemoteCluster) {
    return closeUp
      ? { lat: 20, lng: -12, altitude: 2.1 }
      : getWorldView();
  }

  return {
    lat: location.latitude,
    lng: location.longitude,
    altitude: closeUp ? 1.95 : 2.2,
  };
}
