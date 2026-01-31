import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { guestGuard } from '../../core/auth';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard],
        title: 'Sign In | JobTracker'
      },
      {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard],
        title: 'Create Account | JobTracker'
      },
      {
        path: 'callback',
        loadComponent: () => import('./components/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
        title: 'Authenticating... | JobTracker'
      }
    ]
  }
];
