/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 *
 * Central configuration for the Angular application.
 * Registers all global providers including HTTP interceptors.
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // HTTP client with auth interceptor
    // The interceptor automatically attaches JWT tokens to API requests
    provideHttpClient(withInterceptors([authInterceptor])),

    // Enable Animations
    provideAnimationsAsync(),
  ],
};
