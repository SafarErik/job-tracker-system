/**
 * ============================================================================
 * AUTH GUARD
 * ============================================================================
 *
 * Route guard that protects routes requiring authentication.
 * Uses functional guard pattern (Angular 15+).
 *
 * Best practices:
 * - Use functional guards instead of class-based (simpler, tree-shakeable)
 * - Redirect to login with return URL for better UX
 * - Check token validity, not just existence
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that requires authentication.
 * Redirects unauthenticated users to the login page.
 *
 * Usage in routes:
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;

  // Redirect to login with return URL as query parameter
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl },
  });
};

/**
 * Guard that prevents authenticated users from accessing certain routes.
 * Useful for login/register pages - redirect to home if already logged in.
 *
 * Usage in routes:
 * { path: 'login', component: LoginComponent, canActivate: [guestGuard] }
 */
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is authenticated, redirect to home
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
