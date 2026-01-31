import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { LogoComponent } from '../../../../shared/components/logo/logo';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';

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
    ...HlmCardImports
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);

  // Signals
  readonly isLoading = this._auth.isLoading; // Direct binding to service signal
  readonly error = this._auth.error;         // Direct binding to service signal
  readonly showPassword = signal(false);

  // Strictly Typed Form
  readonly form = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
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

  googleLogin() {
    this._auth.loginWithGoogle();
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }
}
