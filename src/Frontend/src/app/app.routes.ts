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
  // PUBLIC ROUTES (Guest only - redirect if logged in)
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/layouts/auth-layout/auth-layout').then((m) => m.AuthLayoutComponent),
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
        title: 'Login - JobTracker',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
        title: 'Register - JobTracker',
      },
      {
        path: 'auth/callback',
        loadComponent: () =>
          import('./features/auth/components/auth-callback/auth-callback.component').then(
            (m) => m.AuthCallbackComponent,
          ),
        title: 'Signing In... - JobTracker',
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES (Requires authentication)
  // ============================================

  // Job Applications (Dashboard/Home)
  {
    path: '',
    loadComponent: () =>
      import('./features/job-applications/components/job-list/job-list').then((m) => m.JobList),
    canActivate: [authGuard],
    title: 'Applications - JobTracker',
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
    path: 'edit/:id',
    loadComponent: () =>
      import('./features/job-applications/components/job-form/job-form').then(
        (m) => m.JobFormComponent,
      ),
    canActivate: [authGuard],
    title: 'Edit Application - JobTracker',
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
