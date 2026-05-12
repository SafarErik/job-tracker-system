/**
 * ============================================================================
 * COMPANIES FEATURE - ROUTES (Lazy Loading Ready)
 * ============================================================================
 *
 * Routes for the companies feature.
 * Can be lazy loaded for better initial load performance.
 */

import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth';

// Shared app name constant for consistent branding
const APP_NAME = 'Aptelion';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/company-list/company-list').then((m) => m.CompanyListComponent),
    canActivate: [authGuard],
    title: `Companies - ${APP_NAME}`,
  },

  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/company-form/company-form').then((m) => m.CompanyFormComponent),
    canActivate: [authGuard],
    title: `Edit Company - ${APP_NAME}`,
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/company-details/company-details').then((m) => m.CompanyDetailsComponent),
    canActivate: [authGuard],
    title: `Company Details - ${APP_NAME}`,
  },
];
