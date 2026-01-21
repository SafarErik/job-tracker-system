/**
 * ============================================================================
 * LOGIN COMPONENT
 * ============================================================================
 *
 * Modern login form with email/password and Google OAuth support.
 * Uses reactive forms for validation and the existing theme system.
 *
 * Features:
 * - Email/password login
 * - Google OAuth login
 * - Form validation with error messages
 * - Loading states
 * - Dark mode support
 * - Responsive design
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Reactive form for login
  loginForm: FormGroup;

  // Loading state for submit button
  isLoading = signal(false);

  // Error message to display
  errorMessage = signal<string | null>(null);

  // Show/hide password toggle
  showPassword = signal(false);

  // Return URL after successful login
  private readonly returnUrl: string = '/';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    // Initialize form with validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Get return URL from query params (set by auth guard)
    // Validate returnUrl to prevent open redirect attacks
    const rawReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.returnUrl = this.isValidReturnUrl(rawReturnUrl) ? rawReturnUrl : '/';

    // Clear any existing errors when component loads
    this.authService.clearError();
  }

  /**
   * Validate returnUrl to prevent open redirect vulnerabilities.
   * Only allows relative paths starting with a single slash.
   */
  private isValidReturnUrl(url: string): boolean {
    // Must start with exactly one slash (not //) and not contain protocol
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('//')) return false;
    if (url.includes('http:') || url.includes('https:')) return false;
    if (!url.startsWith('/')) return false;
    return true;
  }

  /**
   * Handle form submission for email/password login
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.succeeded) {
          // Navigate to return URL or home
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
      },
    });
  }

  /**
   * Initiate Google OAuth login flow
   */
  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  /**
   * Helper to check if a form field has errors
   */
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }
}
