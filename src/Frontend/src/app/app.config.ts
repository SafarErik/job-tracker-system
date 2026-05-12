/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 *
 * Central configuration for the Angular application.
 * Registers all global providers including HTTP interceptors.
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco, translocoConfig } from '@jsverse/transloco';
import { provideHlmSidebarConfig } from '@spartan-ng/helm/sidebar';

import { routes } from './app.routes';
import { authInterceptor, errorInterceptor } from './core/interceptors';
import { TranslocoHttpLoader } from './core/i18n';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes, withViewTransitions()),

    // HTTP client with auth interceptor
    // The interceptor automatically attaches JWT tokens to API requests
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    // Enable Animations
    provideAnimationsAsync(),

    provideHlmSidebarConfig({
      sidebarWidth: '16rem',
      sidebarWidthIcon: '3.5rem',
      sidebarWidthMobile: '18rem',
    }),

    provideTransloco({
      config: translocoConfig({
        availableLangs: ['en', 'hu'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: environment.production,
        missingHandler: {
          logMissingKey: !environment.production,
          useFallbackTranslation: true,
        },
      }),
      loader: TranslocoHttpLoader,
    }),
  ],
};
