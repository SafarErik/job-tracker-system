import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
      @if (error()) {
        <div class="text-6xl mb-2">⚠️</div>
        <h2 class="text-xl font-bold text-destructive">Authentication Failed</h2>
        <p class="text-muted-foreground">{{ error() }}</p>
        <button (click)="goToLogin()" class="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Back to Login
        </button>
      } @else {
        <!-- Cinematic Spinner -->
        <div class="relative h-16 w-16">
          <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <h2 class="text-lg font-medium text-foreground">Verifying Credentials...</h2>
      }
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _auth = inject(AuthService);

  readonly error = signal<string | null>(null);

  ngOnInit() {
    const params = this._route.snapshot.queryParams;

    if (params['error']) {
      this.error.set(this._mapError(params['error']));
      return;
    }

    const token = params['token'];
    if (token) {
      this._auth.handleGoogleCallback(token);
    } else {
      this.error.set("Invalid callback parameters.");
    }
  }

  private _mapError(code: string): string {
    const map: Record<string, string> = {
      'google_auth_failed': 'Google declined the login request.',
      'no_email': 'Your Google account is missing an email address.',
      'no_claims': 'Could not retrieve account information from Google.',
      'create_failed': 'Could not create your account. Please try again.'
    };
    return map[code] || 'An unknown error occurred.';
  }

  goToLogin() {
    this._router.navigate(['/auth/login']);
  }
}
