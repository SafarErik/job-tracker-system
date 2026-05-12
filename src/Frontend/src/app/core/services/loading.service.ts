import { Injectable, signal, computed } from '@angular/core';

export interface LoadingState {
  /** Global loading state for the entire application */
  global: boolean;
  /** Individual feature loading states */
  features: {
    companies: boolean;
    jobApplications: boolean;
    documents: boolean;
    profile: boolean;
    dashboard: boolean;
  };
}

/**
 * LoadingService - Global loading state management
 *
 * Provides a centralized way to track and manage loading states across the application.
 * Can be used to show/hide global loading indicators (spinners, skeletons).
 *
 * Usage:
 * ```typescript
 * // Show loading
 * this.loadingService.show();
 * this.loadingService.showFeature('companies');
 *
 * // Hide loading
 * this.loadingService.hide();
 * this.loadingService.hideFeature('companies');
 *
 * // In template
 * @if (loadingService.isLoading()) {
 *   <app-spinner />
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // ── State Signals ─────────────────────────────────────────────

  private readonly _globalLoading = signal<boolean>(false);
  private readonly _featureLoading = signal<LoadingState['features']>({
    companies: false,
    jobApplications: false,
    documents: false,
    profile: false,
    dashboard: false,
  });

  // ── Public Read-only Signals ─────────────────────────────────

  /** Global loading state */
  readonly globalLoading = this._globalLoading.asReadonly();

  /** Feature-specific loading states */
  readonly featureLoading = this._featureLoading.asReadonly();

  // ── Computed Signals ────────────────────────────────────────

  /** True if any loading is happening (global or any feature) */
  readonly isLoading = computed(() => {
    const global = this._globalLoading();
    const features = this._featureLoading();
    return global || Object.values(features).some((v) => v);
  });

  /** Number of active loading operations */
  readonly activeCount = computed(() => {
    const features = this._featureLoading();
    const featureCount = Object.values(features).filter((v) => v).length;
    return (this._globalLoading() ? 1 : 0) + featureCount;
  });

  // ── Global Loading Actions ───────────────────────────────────

  /** Show global loading indicator */
  show(): void {
    this._globalLoading.set(true);
  }

  /** Hide global loading indicator */
  hide(): void {
    this._globalLoading.set(false);
  }

  /** Toggle global loading indicator */
  toggle(): void {
    this._globalLoading.update((v) => !v);
  }

  // ── Feature Loading Actions ─────────────────────────────────

  /**
   * Show loading for a specific feature
   * @param feature Name of the feature
   */
  showFeature(feature: keyof LoadingState['features']): void {
    this._featureLoading.update((features) => ({
      ...features,
      [feature]: true,
    }));
  }

  /**
   * Hide loading for a specific feature
   * @param feature Name of the feature
   */
  hideFeature(feature: keyof LoadingState['features']): void {
    this._featureLoading.update((features) => ({
      ...features,
      [feature]: false,
    }));
  }

  /**
   * Toggle loading for a specific feature
   * @param feature Name of the feature
   */
  toggleFeature(feature: keyof LoadingState['features']): void {
    this._featureLoading.update((features) => ({
      ...features,
      [feature]: !features[feature],
    }));
  }

  /**
   * Check if a specific feature is loading
   * @param feature Name of the feature
   */
  isFeatureLoading(feature: keyof LoadingState['features']): boolean {
    return this._featureLoading()[feature];
  }

  /**
   * Reset all loading states to false
   */
  reset(): void {
    this._globalLoading.set(false);
    this._featureLoading.set({
      companies: false,
      jobApplications: false,
      documents: false,
      profile: false,
      dashboard: false,
    });
  }

  // ── Utility Methods ────────────────────────────────────────

  /**
   * Execute an async operation with automatic loading state management
   * @param feature Feature name for feature-level loading
   * @param operation Async operation to execute
   * @param useGlobal Whether to use global loading (default: true)
   */
  async wrap<T>(
    feature: keyof LoadingState['features'],
    operation: () => Promise<T>,
    useGlobal = true,
  ): Promise<T> {
    if (useGlobal) {
      this.show();
    } else {
      this.showFeature(feature);
    }

    try {
      return await operation();
    } finally {
      if (useGlobal) {
        this.hide();
      } else {
        this.hideFeature(feature);
      }
    }
  }
}
