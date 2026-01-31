import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard that requires authentication.
 * Redirects unauthenticated users to the login page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Guard that prevents authenticated users from accessing certain routes.
 * Redirects authenticated users to the dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return !authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/dashboard']);
};
