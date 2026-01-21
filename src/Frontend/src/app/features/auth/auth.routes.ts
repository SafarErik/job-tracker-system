/**
 * ============================================================================
 * AUTH FEATURE - ROUTES (Lazy Loading Ready)
 * ============================================================================
 *
 * Routes for auth-related pages (login, register, etc.)
 */

import { Routes } from '@angular/router';
import { guestGuard } from '../../core/auth';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Login - JobTracker',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Register - JobTracker',
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./components/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
    title: 'Signing In... - JobTracker',
  },
];
