import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Auth Guard
 *
 * Protects routes that require authentication.
 * Redirects unauthenticated users to the login page with return URL.
 *
 * Usage:
 * ```typescript
 * {
 *   path: 'dashboard',
 *   loadComponent: () => import('./dashboard'),
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Guest Guard
 *
 * Prevents authenticated users from accessing certain routes.
 * Redirects authenticated users to the dashboard.
 * Ideal for: login, register, landing pages
 *
 * Usage:
 * ```typescript
 * {
 *   path: 'login',
 *   loadComponent: () => import('./login'),
 *   canActivate: [guestGuard]
 * }
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return !authService.isAuthenticated() ? true : router.createUrlTree(['/dashboard']);
};

const resolveEntryRedirect = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? router.createUrlTree(['/dashboard'])
    : router.createUrlTree(['/welcome']);
};

/**
 * Smart root entry guard.
 *
 * Keeps "/" deterministic while preserving a public welcome page.
 */
export const entryRedirectGuard: CanActivateFn = () => resolveEntryRedirect();

export const entryRedirectMatchGuard: CanMatchFn = () => resolveEntryRedirect();
