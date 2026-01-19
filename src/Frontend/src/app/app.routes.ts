import { Routes } from '@angular/router';
import { JobList } from './components/job-list/job-list';
import { JobFormComponent } from './components/job-form/job-form';

export const routes: Routes = [
  { path: '', component: JobList }, // Főoldal
  { path: 'new', component: JobFormComponent }, // Új hozzáadása oldal
  { path: '**', redirectTo: '' }, // Minden más a főoldalra visz
];
