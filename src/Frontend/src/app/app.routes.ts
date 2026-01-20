import { Routes } from '@angular/router';
import { JobList } from './components/job-list/job-list';
import { JobFormComponent } from './components/job-form/job-form';
import { CompanyDetailsComponent } from './components/company-details/company-details';
import { CompanyListComponent } from './components/company-list/company-list';
import { DocumentsListComponent } from './components/documents-list/documents-list';

export const routes: Routes = [
  { path: '', component: JobList }, // Home page - displays all applications
  { path: 'new', component: JobFormComponent }, // Create new application
  { path: 'edit/:id', component: JobFormComponent }, // Edit existing application
  { path: 'companies', component: CompanyListComponent }, // Companies list page
  { path: 'company/:id', component: CompanyDetailsComponent }, // Company details page
  { path: 'documents', component: DocumentsListComponent }, // Documents/CV list page
  { path: '**', redirectTo: '' }, // Redirect all unknown routes to home
];
