/**
 * ============================================================================
 * REGISTER COMPONENT
 * ============================================================================
 *
 * Modern registration form with validation.
 * Matches the login component design for consistency.
 *
 * Features:
 * - Full registration form with validation
 * - Password strength requirements display
 * - Confirm password matching
 * - Google OAuth option
 * - Dark mode support
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  // Reactive form for registration
  registerForm: FormGroup;

  // Loading state for submit button
  isLoading = signal(false);

  // Error message to display
  errorMessage = signal<string | null>(null);

  // Show/hide password toggles
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    // Initialize form with validation
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            // Custom validator for password strength
            this.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        // Form-level validator for password matching
        validators: this.passwordMatchValidator,
      },
    );

    // Clear any existing errors when component loads
    this.authService.clearError();
  }

  /**
   * Custom validator for password strength.
   * Requires at least one uppercase, one lowercase, one digit, and one special character.
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasUppercase && hasLowercase && hasDigit && hasSpecial;

    return valid
      ? null
      : {
          passwordStrength: {
            hasUppercase,
            hasLowercase,
            hasDigit,
            hasSpecial,
          },
        };
  }

  /**
   * Form-level validator to check if passwords match.
   * Properly clears only passwordMismatch error when passwords match.
   */
  private passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    // Check if passwords match
    if (password.value === confirmPassword.value) {
      // Passwords match - clear only passwordMismatch error, preserve other errors
      const currentErrors = confirmPassword.errors;
      if (currentErrors) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordMismatch, ...remainingErrors } = currentErrors;
        confirmPassword.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
      }
      return null;
    }

    // Passwords don't match - set error
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.value;

    this.authService
      .register({
        email: formValue.email,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.succeeded) {
            // Registration successful - user is already logged in
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
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
  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.update((show) => !show);
    } else {
      this.showConfirmPassword.update((show) => !show);
    }
  }

  /**
   * Helper to check if a form field has errors
   */
  hasError(field: string, error: string): boolean {
    const control = this.registerForm.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }

  /**
   * Get password strength errors for display
   */
  getPasswordStrengthErrors(): {
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
    hasSpecial: boolean;
  } | null {
    const control = this.registerForm.get('password');
    if (control?.hasError('passwordStrength')) {
      return control.getError('passwordStrength');
    }
    return null;
  }
}
