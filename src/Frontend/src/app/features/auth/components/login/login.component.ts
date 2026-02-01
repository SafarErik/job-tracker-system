import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { LogoComponent } from '../../../../shared/components/logo/logo';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);

  // Signals for UI state
  readonly isLoading = this._auth.isLoading;
  readonly error = this._auth.error;
  readonly showPassword = signal(false);

  // Strictly Typed Reactive Form
  readonly form = this._fb.group({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    rememberMe: new FormControl<boolean>(false, { nonNullable: true })
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this._auth.login({ email, password }).subscribe({
      next: () => {
        const returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this._router.navigateByUrl(returnUrl);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  googleLogin() {
    this._auth.loginWithGoogle();
  }
}
