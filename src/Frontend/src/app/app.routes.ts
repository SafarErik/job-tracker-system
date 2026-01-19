import { Routes } from '@angular/router';
import { JobList } from './components/job-list/job-list';
import { JobFormComponent } from './components/job-form/job-form';

export const routes: Routes = [
  { path: '', component: JobList }, // Home page - displays all applications
  { path: 'new', component: JobFormComponent }, // Create new application
  { path: 'edit/:id', component: JobFormComponent }, // Edit existing application
  { path: '**', redirectTo: '' }, // Redirect all unknown routes to home
];
