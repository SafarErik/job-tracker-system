import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { LogoComponent } from '../../../../shared/components/logo/logo';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

// Custom Validator for Password Match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    // Only clear mismatch error if it's the only one
    if (confirmPassword?.hasError('mismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LogoComponent,
    ThemeToggleComponent,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
  ],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  readonly isLoading = this._auth.isLoading;
  readonly error = this._auth.error;
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this._fb.group({
    firstName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    lastName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, { validators: passwordMatchValidator });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, confirmPassword } = this.form.getRawValue();

    this._auth.register({ firstName, lastName, email, password, confirmPassword }).subscribe({
      next: () => {
        this._router.navigate(['/dashboard']);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(v => !v);
  }

  googleLogin() {
    this._auth.loginWithGoogle();
  }
}
