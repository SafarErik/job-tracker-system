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

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/company-list/company-list').then((m) => m.CompanyListComponent),
    canActivate: [authGuard],
    title: 'Companies - VantageCursus',
  },

  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/company-form/company-form').then((m) => m.CompanyFormComponent),
    canActivate: [authGuard],
    title: 'Edit Company - VantageCursus',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/company-details/company-details').then((m) => m.CompanyDetailsComponent),
    canActivate: [authGuard],
    title: 'Company Details - VantageCursus',
  },
];
