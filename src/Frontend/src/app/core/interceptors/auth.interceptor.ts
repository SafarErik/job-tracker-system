import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Auth Interceptor
 *
 * Automatically attaches JWT Bearer token to API requests.
 * Handles 401 responses by logging out the user.
 *
 * Excluded routes:
 * - /auth/login
 * - /auth/register
 * - External API calls (non-matching base URL)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getStoredToken();

  // 1. Only intercept API calls and only if we have a token
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  let authReq = req;
  if (isApiRequest && !isAuthRequest && token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 2. Automatic logout on 401 (Unauthorized)
      if (error.status === 401 && !isAuthRequest) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
