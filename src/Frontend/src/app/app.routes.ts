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
  // AUTH ROUTES (Login, Register, Callback)
  // ============================================
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ============================================
  // PROTECTED APP SHELL
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Dashboard - JobTracker',
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/job-applications/components/job-list/applications.component').then((m) => m.ApplicationsComponent),
        title: 'Applications - JobTracker',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/job-applications/components/add-job-form/add-job-form').then(
            (m) => m.AddJobFormComponent,
          ),
        title: 'New Application - JobTracker',
      },
      {
        // Application Workstation - full page view with tabs
        path: 'applications/:id',
        loadComponent: () =>
          import('./features/job-applications/components/job-workstation/job-workstation').then(
            (m) => m.JobWorkstationComponent,
          ),
        title: 'Application Workstation - JobTracker',
      },
      {
        // Keep view/:id as alias for backwards compatibility
        path: 'view/:id',
        loadComponent: () =>
          import('./features/job-applications/components/job-workstation/job-workstation').then(
            (m) => m.JobWorkstationComponent,
          ),
        title: 'View Application - JobTracker',
      },

      // Companies
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/components/company-list/company-list').then(
            (m) => m.CompanyListComponent,
          ),
        title: 'Companies - JobTracker',
      },
      {
        path: 'companies/edit/:id',
        loadComponent: () =>
          import('./features/companies/components/company-form/company-form').then(
            (m) => m.CompanyFormComponent,
          ),
        title: 'Edit Company - JobTracker',
      },
      {
        path: 'companies/:id',
        loadComponent: () =>
          import('./features/companies/components/company-details/company-details').then(
            (m) => m.CompanyDetailsComponent,
          ),
        title: 'Company Details - JobTracker',
      },

      // Documents
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/components/documents-list/documents-list').then(
            (m) => m.DocumentsListComponent,
          ),
        title: 'Documents - JobTracker',
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/components/profile/profile').then((m) => m.ProfileComponent),
        title: 'Profile - JobTracker',
      },

      // Compatibility Redirects
      {
        path: 'company/:id',
        redirectTo: 'companies/:id',
        pathMatch: 'full',
      },
      {
        path: 'companies/:id/details',
        redirectTo: 'companies/:id',
        pathMatch: 'full',
      },
    ],
  },

  // ============================================
  // FALLBACK ROUTES
  // ============================================
  {
    path: '**',
    redirectTo: '',
  },
];
