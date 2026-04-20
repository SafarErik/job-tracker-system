/**
 * ============================================================================
 * APPLICATION ROUTES
 * ============================================================================
 *
 * Defines all routes for the Horizon application.
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
import { authGuard } from './core/guards';
// import { SignalsComponent } from './features/signals/signals.component'; // Managed via lazy load

export const routes: Routes = [
  // ============================================
  // SMART ROOT ENTRY
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/components/entry-redirect/entry-redirect.component').then(
        (m) => m.EntryRedirectComponent,
      ),
    pathMatch: 'full',
    title: 'Horizon',
  },

  // ============================================
  // PUBLIC WELCOME PAGE
  // ============================================
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/landing/components/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
    pathMatch: 'full',
    title: 'Horizon - Career growth, intelligently guided',
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
    path: 'global-footprint',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/global-footprint-screen/global-footprint-screen.component').then(
        (m) => m.GlobalFootprintScreenComponent,
    ),
    title: 'Global Footprint - Horizon',
  },
  {
    path: 'mission/global-footprint',
    redirectTo: 'global-footprint',
    pathMatch: 'full',
  },
  {
    // Application Workstation - immersive full page view without app shell header
    path: 'applications/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/job-applications/components/job-workstation/job-workstation').then(
        (m) => m.JobWorkstationComponent,
      ),
    title: 'Application Workstation - Horizon',
    data: { breadcrumb: 'Workstation' },
  },
  {
    // Keep view/:id as alias for backwards compatibility
    path: 'view/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/job-applications/components/job-workstation/job-workstation').then(
        (m) => m.JobWorkstationComponent,
      ),
    title: 'View Application - Horizon',
    data: { breadcrumb: 'View Application' },
  },
  {
    // Company Workstation - immersive full page view without app shell header
    path: 'companies/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/components/company-details/company-details').then(
        (m) => m.CompanyDetailsComponent,
      ),
    title: 'Company Workstation - Horizon',
    data: { breadcrumb: 'Company Workstation' },
  },
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
        title: 'Dashboard - Horizon',
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/job-applications/components/job-list/applications/applications.component').then(
            (m) => m.ApplicationsComponent,
          ),
        title: 'Applications - Horizon',
        data: { breadcrumb: 'Applications' },
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/job-applications/components/new-application-redirect/new-application-redirect.component').then(
            (m) => m.NewApplicationRedirectComponent,
          ),
        title: 'New Application - Horizon',
        data: { breadcrumb: 'New Application' },
      },
      // Companies
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/components/company-list/company-list').then(
            (m) => m.CompanyListComponent,
          ),
        title: 'Companies - Horizon',
        data: { breadcrumb: 'Companies' },
      },
      {
        path: 'companies/edit/:id',
        loadComponent: () =>
          import('./features/companies/components/company-form/company-form').then(
            (m) => m.CompanyFormComponent,
          ),
        title: 'Edit Company - Horizon',
        data: { breadcrumb: 'Edit Company' },
      },

      // Documents
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/components/documents-list/documents-list').then(
            (m) => m.DocumentsListComponent,
          ),
        title: 'Documents - Horizon',
        data: { breadcrumb: 'Documents' },
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/components/profile/profile').then((m) => m.ProfileComponent),
        title: 'Profile - Horizon',
        data: { breadcrumb: 'Profile' },
      },

      // Statistics & Intelligence
      {
        path: 'statistics',
        loadChildren: () =>
          import('./features/statistics/statistics.routes').then((m) => m.STATISTICS_ROUTES),
        title: 'Intelligence Analytics - Horizon',
        data: { breadcrumb: 'Intelligence' },
      },

      // Global Signals
      {
        path: 'signals',
        loadComponent: () =>
          import('./features/signals/signals.component').then((m) => m.SignalsComponent),

        title: 'Global Feed - Horizon',
        data: { breadcrumb: 'Global Signals' },
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
