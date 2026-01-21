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

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        @if (error) {
          <!-- Error State -->
          <div class="error-state">
            <div class="error-icon">❌</div>
            <h2>Authentication Failed</h2>
            <p>{{ error }}</p>
            <button class="retry-btn" (click)="goToLogin()">Back to Login</button>
          </div>
        } @else {
          <!-- Loading State -->
          <div class="loading-state">
            <div class="spinner"></div>
            <h2>Completing Sign In</h2>
            <p>Please wait while we verify your credentials...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .callback-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--color-primary-start), var(--color-primary-end));
        padding: 1rem;
      }

      .callback-card {
        background: var(--color-bg-primary);
        padding: 3rem;
        border-radius: 1.5rem;
        text-align: center;
        max-width: 400px;
        width: 100%;
        box-shadow: var(--shadow-xl);
      }

      :host-context(.dark) .callback-card {
        background: rgba(17, 24, 39, 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .loading-state h2,
      .error-state h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 1.5rem 0 0.5rem;
      }

      .loading-state p,
      .error-state p {
        color: var(--color-text-secondary);
        margin: 0;
      }

      .spinner {
        width: 3rem;
        height: 3rem;
        border: 3px solid var(--color-border-primary);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error-icon {
        font-size: 3rem;
      }

      .retry-btn {
        margin-top: 1.5rem;
        padding: 0.75rem 2rem;
        background: linear-gradient(135deg, var(--color-primary-start), var(--color-primary-end));
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .retry-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }
    `,
  ],
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
