/**
 * ============================================================================
 * APPLICATION ROUTES
 * ============================================================================
 *
 * Defines all routes for the JobTracker application.
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
import { authGuard, guestGuard } from './guards/auth.guard';

// Lazy-loaded components (better initial load performance)
import { JobList } from './components/job-list/job-list';
import { JobFormComponent } from './components/job-form/job-form';
import { CompanyDetailsComponent } from './components/company-details/company-details';
import { CompanyListComponent } from './components/company-list/company-list';
import { CompanyFormComponent } from './components/company-form/company-form';
import { DocumentsListComponent } from './components/documents-list/documents-list';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

export const routes: Routes = [
  // ============================================
  // PUBLIC ROUTES (Guest only - redirect if logged in)
  // ============================================
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Login - JobTracker',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
    title: 'Register - JobTracker',
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
    title: 'Signing In... - JobTracker',
  },

  // ============================================
  // PROTECTED ROUTES (Requires authentication)
  // ============================================
  {
    path: '',
    component: JobList,
    canActivate: [authGuard],
    title: 'Applications - JobTracker',
  },
  {
    path: 'new',
    component: JobFormComponent,
    canActivate: [authGuard],
    title: 'New Application - JobTracker',
  },
  {
    path: 'edit/:id',
    component: JobFormComponent,
    canActivate: [authGuard],
    title: 'Edit Application - JobTracker',
  },
  {
    path: 'companies',
    component: CompanyListComponent,
    canActivate: [authGuard],
    title: 'Companies - JobTracker',
  },
  {
    path: 'companies/new',
    component: CompanyFormComponent,
    canActivate: [authGuard],
    title: 'New Company - JobTracker',
  },
  {
    path: 'companies/edit/:id',
    component: CompanyFormComponent,
    canActivate: [authGuard],
    title: 'Edit Company - JobTracker',
  },
  {
    path: 'company/:id',
    component: CompanyDetailsComponent,
    canActivate: [authGuard],
    title: 'Company Details - JobTracker',
  },
  {
    path: 'documents',
    component: DocumentsListComponent,
    canActivate: [authGuard],
    title: 'Documents - JobTracker',
  },

  // ============================================
  // FALLBACK ROUTES
  // ============================================
  {
    path: '**',
    redirectTo: '',
  },
];
