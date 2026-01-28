/**
 * ============================================================================
 * AUTH CALLBACK COMPONENT
 * ============================================================================
 *
 * Handles the callback from external OAuth providers (Google).
 * Extracts the JWT token from the URL and completes the authentication.
 *
 * Flow:
 * 1. User clicks "Login with Google"
 * 2. Backend redirects to Google
 * 3. Google redirects back to backend callback
 * 4. Backend generates JWT and redirects to frontend: /auth/callback?token=xxx
 * 5. This component extracts the token and completes login
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

// Spartan UI
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, ...HlmButtonImports, ...HlmCardImports],
  template: `
    <div
      class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-4"
    >
      <div hlmCard class="w-full max-w-md text-center">
        <div hlmCardContent class="p-8">
          @if (error) {
            <!-- Error State -->
            <div class="flex flex-col items-center">
              <div class="text-5xl">❌</div>
              <h2 class="mt-6 text-xl font-semibold text-foreground">Authentication Failed</h2>
              <p class="mt-2 text-muted-foreground">{{ error }}</p>
              <button hlmBtn class="mt-6" (click)="goToLogin()">Back to Login</button>
            </div>
          } @else {
            <!-- Loading State -->
            <div class="flex flex-col items-center">
              <svg
                class="h-12 w-12 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h2 class="mt-6 text-xl font-semibold text-foreground">Completing Sign In</h2>
              <p class="mt-2 text-muted-foreground">
                Please wait while we verify your credentials...
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  error: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Extract token from URL query parameters
    const token = this.route.snapshot.queryParams['token'];
    const errorParam = this.route.snapshot.queryParams['error'];

    if (errorParam) {
      // Handle error from backend
      this.error = this.getErrorMessage(errorParam);
      return;
    }

    if (token) {
      // Process the token
      this.authService.handleGoogleCallback(token);
    } else {
      // No token provided
      this.error = 'No authentication token received. Please try again.';
    }
  }

  /**
   * Convert error codes to user-friendly messages
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      google_auth_failed: 'Google authentication failed. Please try again.',
      no_claims: 'Could not retrieve account information from Google.',
      no_email: 'Your Google account does not have an email address.',
      create_failed: 'Could not create your account. Please try again.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Navigate back to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
