/**
 * ============================================================================
 * APPLICATION ROUTES
 * ============================================================================
 *
 * Defines all routes for the JobTracker application.
 * Uses lazy loading for feature modules for better initial load performance.
 *
 * Route categories:
 * - Public routes: login, register, auth callback (guestGuard)
 * - Protected routes: dashboard, applications, companies, documents (authGuard)
 *
 * Best practices:
 * - Use lazy loading for feature modules
 * - Apply guards consistently
 * - Keep routes organized by feature
 */

import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth';

export const routes: Routes = [
  // ============================================
  // PUBLIC ROOT (Landing Page)
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/components/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
    pathMatch: 'full',
    title: 'JobTracker - Your Career, Autopilot Engaged',
  },

  // ============================================
  // PROTECTED DASHBOARD
  // ============================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/job-applications/components/job-list/job-list').then((m) => m.JobList),
    canActivate: [authGuard],
    title: 'Dashboard - JobTracker',
  },

  // ============================================
  // AUTH ROUTES (Login, Register, Callback)
  // ============================================
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./features/job-applications/components/add-job-form/add-job-form').then(
        (m) => m.AddJobFormComponent,
      ),
    canActivate: [authGuard],
    title: 'New Application - JobTracker',
  },
  {
    // Application Workstation - full page view with tabs
    path: 'applications/:id',
    loadComponent: () =>
      import('./features/job-applications/components/job-workstation/job-workstation').then(
        (m) => m.JobWorkstationComponent,
      ),
    canActivate: [authGuard],
    title: 'Application Workstation - JobTracker',
  },
  {
    // Keep view/:id as alias for backwards compatibility
    path: 'view/:id',
    loadComponent: () =>
      import('./features/job-applications/components/job-workstation/job-workstation').then(
        (m) => m.JobWorkstationComponent,
      ),
    canActivate: [authGuard],
    title: 'View Application - JobTracker',
  },

  // Companies
  {
    path: 'companies',
    loadComponent: () =>
      import('./features/companies/components/company-list/company-list').then(
        (m) => m.CompanyListComponent,
      ),
    canActivate: [authGuard],
    title: 'Companies - JobTracker',
  },
  {
    path: 'companies/new',
    loadComponent: () =>
      import('./features/companies/components/company-form/company-form').then(
        (m) => m.CompanyFormComponent,
      ),
    canActivate: [authGuard],
    title: 'New Company - JobTracker',
  },
  {
    path: 'companies/edit/:id',
    loadComponent: () =>
      import('./features/companies/components/company-form/company-form').then(
        (m) => m.CompanyFormComponent,
      ),
    canActivate: [authGuard],
    title: 'Edit Company - JobTracker',
  },
  {
    path: 'companies/:id',
    loadComponent: () =>
      import('./features/companies/components/company-details/company-details').then(
        (m) => m.CompanyDetailsComponent,
      ),
    canActivate: [authGuard],
    title: 'Company Details - JobTracker',
  },

  // Documents
  {
    path: 'documents',
    loadComponent: () =>
      import('./features/documents/components/documents-list/documents-list').then(
        (m) => m.DocumentsListComponent,
      ),
    canActivate: [authGuard],
    title: 'Documents - JobTracker',
  },

  // Profile
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/components/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile - JobTracker',
  },

  // Compatibility Redirects
  {
    path: 'company/:id',
    redirectTo: 'companies/:id',
  },
  {
    path: 'companies/:id/details',
    redirectTo: 'companies/:id',
  },

  // ============================================
  // FALLBACK ROUTES
  // ============================================
  {
    path: '**',
    redirectTo: '',
  },
];
