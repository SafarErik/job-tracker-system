/**
 * ============================================================================
 * JOB APPLICATIONS FEATURE - ROUTES (Lazy Loading Ready)
 * ============================================================================
 *
 * Routes for the job applications feature.
 * Can be lazy loaded for better initial load performance.
 */

import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth';

export const JOB_APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/job-list/job-list').then((m) => m.JobList),
    canActivate: [authGuard],
    title: 'Applications - JobTracker',
  },
  {
    // Workstation route - full page view with tabs
    path: ':id',
    loadComponent: () =>
      import('./components/job-workstation/job-workstation').then((m) => m.JobWorkstationComponent),
    canActivate: [authGuard],
    title: 'Application Workstation - JobTracker',
  },
  {
    // Keep edit/:id as alias to workstation for backwards compatibility
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/job-workstation/job-workstation').then((m) => m.JobWorkstationComponent),
    canActivate: [authGuard],
    title: 'Edit Application - JobTracker',
  },
  {
    // Keep view/:id as alias to workstation for backwards compatibility
    path: 'view/:id',
    loadComponent: () =>
      import('./components/job-workstation/job-workstation').then((m) => m.JobWorkstationComponent),
    canActivate: [authGuard],
    title: 'View Application - JobTracker',
  },
];

