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
    path: 'new',
    loadComponent: () => import('./components/job-form/job-form').then((m) => m.JobFormComponent),
    canActivate: [authGuard],
    title: 'New Application - JobTracker',
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/job-form/job-form').then((m) => m.JobFormComponent),
    canActivate: [authGuard],
    title: 'Edit Application - JobTracker',
  },
  {
    path: 'view/:id',
    loadComponent: () =>
      import('./components/job-detail-modal/job-detail-modal').then(
        (m) => m.JobDetailModalComponent,
      ),
    canActivate: [authGuard],
    title: 'View Application - JobTracker',
  },
];
