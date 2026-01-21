/**
 * ============================================================================
 * DOCUMENTS FEATURE - ROUTES (Lazy Loading Ready)
 * ============================================================================
 *
 * Routes for the documents feature.
 * Can be lazy loaded for better initial load performance.
 */

import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/documents-list/documents-list').then((m) => m.DocumentsListComponent),
    canActivate: [authGuard],
    title: 'Documents - JobTracker',
  },
];
