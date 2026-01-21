/**
 * ============================================================================
 * AUTH INTERCEPTOR
 * ============================================================================
 *
 * HTTP interceptor that automatically attaches JWT token to outgoing requests.
 * Uses functional interceptor pattern (Angular 15+).
 *
 * Best practices:
 * - Use functional interceptors (simpler, tree-shakeable)
 * - Only attach token to API requests (not external URLs)
 * - Handle 401 responses for automatic logout
 * - Use immutable request cloning
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * Interceptor that adds JWT token to API requests and handles auth errors.
 *
 * Registration in app.config.ts:
 * provideHttpClient(withInterceptors([authInterceptor]))
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Only add token to requests going to our API
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);

  if (isApiRequest) {
    const token = authService.getStoredToken();

    // If token exists, clone request and add Authorization header
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  // Process the request and handle errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401) {
        // Only handle 401 for API requests, not for login attempts
        const isAuthEndpoint =
          req.url.includes('/auth/login') || req.url.includes('/auth/register');

        if (!isAuthEndpoint) {
          // Token is invalid/expired - logout and redirect
          authService.logout();
        }
      }

      // Handle 403 Forbidden - user doesn't have permission
      if (error.status === 403) {
        // Could redirect to an access denied page
        console.error('Access forbidden:', req.url);
      }

      return throwError(() => error);
    }),
  );
};
