import { Injectable, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthState,
  initialAuthState,
  DecodedToken,
} from './auth.model';

const TOKEN_KEY = 'jobtracker_auth_token';
const USER_KEY = 'jobtracker_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _apiUrl = `${environment.apiBaseUrl}/auth`;

  // 1. Single source of truth (Private State)
  private readonly _state = signal<AuthState>(initialAuthState);

  // 2. Public Read-only API (Derived State)
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly user = computed(() => this._state().user);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  readonly userFullName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
  });

  readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const first = u.firstName?.[0] || u.email[0] || '?';
    const last = u.lastName?.[0] || '';
    return (first + last).toUpperCase();
  });

  constructor() {
    this._initializeAuth();

    // 3. Automatic Persistence Effect
    // Whenever the state changes, sync with localStorage (only in browser)
    effect(() => {
      if (isPlatformBrowser(this._platformId)) {
        const state = this._state();
        if (state.isAuthenticated && state.user) {
          // Syncing state to storage is handled here automatically
          // Note: Token storage is still handled in handleAuthSuccess as it needs to happen before state update
          // but we can ensure consistency here.
          localStorage.setItem(USER_KEY, JSON.stringify(state.user));
        } else if (!state.isLoading) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
    });
  }

  private _initializeAuth() {
    if (!isPlatformBrowser(this._platformId)) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !this.isTokenExpired(token)) {
      const user = this._decodeUserFromToken(token);
      this._state.set({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });
    } else {
      this._state.update((s) => ({ ...s, isLoading: false }));
      this.logout();
    }
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));
    return this._http.post<AuthResponse>(`${this._apiUrl}/login`, req).pipe(
      tap((res) => {
        if (res.succeeded) {
          this._handleAuthSuccess(res);
        } else {
          this._handleAuthError(res.message);
        }
      }),
      catchError((err) => {
        const message = err.error?.message || 'Login failed';
        this._handleAuthError(message);
        return throwError(() => err);
      }),
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));
    return this._http.post<AuthResponse>(`${this._apiUrl}/register`, req).pipe(
      tap((res) => {
        if (res.succeeded) {
          this._handleAuthSuccess(res);
        } else {
          this._handleAuthError(res.message);
        }
      }),
      catchError((err) => {
        const message = err.error?.message || 'Registration failed';
        this._handleAuthError(message);
        return throwError(() => err);
      }),
    );
  }

  logout() {
    this._state.set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
    this._router.navigate(['/login']);
  }

  // --- Google OAuth ---

  loginWithGoogle(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    const returnUrl = encodeURIComponent(globalThis.location.origin);
    globalThis.location.href = `${this._apiUrl}/google-login?returnUrl=${returnUrl}`;
  }

  handleGoogleCallback(token: string): void {
    if (!token) {
      this._handleAuthError('No token received from Google authentication');
      this._router.navigate(['/login']);
      return;
    }

    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    const user = this._decodeUserFromToken(token);
    this._state.set({
      isAuthenticated: true,
      isLoading: false,
      user,
      error: null,
    });

    this._router.navigate(['/']);
  }

  // --- Logic Helpers ---

  private _handleAuthSuccess(res: AuthResponse) {
    if (res.token && isPlatformBrowser(this._platformId)) {
      localStorage.setItem(TOKEN_KEY, res.token);
    }

    this._state.set({
      isAuthenticated: true,
      user: res.user ?? (res.token ? this._decodeUserFromToken(res.token) : null),
      isLoading: false,
      error: null,
    });
  }

  private _handleAuthError(message: string) {
    this._state.update((s) => ({ ...s, isLoading: false, error: message }));
  }

  private _decodeUserFromToken(token: string): User {
    try {
      const payloadPart = token.split('.')[1];
      const payload = JSON.parse(
        atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')),
      );

      // Support for UTF-8 characters if needed
      // Actually atob is fine for the ASCII base64, but the content inside might be UTF-8
      // If we see issues with names, we can use the decodeURIComponent approach seen in original

      const claimUri = (type: string) =>
        `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/${type}`;

      return {
        id: payload[claimUri('nameidentifier')] || '',
        email: payload[claimUri('emailaddress')] || '',
        firstName: payload.firstName,
        lastName: payload.lastName,
        createdAt: new Date(),
      };
    } catch (e) {
      console.error('Error decoding token:', e);
      return { id: '', email: '', createdAt: new Date() };
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp) return true;
      return payload.exp * 1000 - 60000 < Date.now();
    } catch {
      return true;
    }
  }

  getStoredToken(): string | null {
    return isPlatformBrowser(this._platformId) ? localStorage.getItem(TOKEN_KEY) : null;
  }

  clearError(): void {
    this._state.update((s) => ({ ...s, error: null }));
  }

  // Maintaining compatibility for potential existing calls
  getCurrentUser(): Observable<User> {
    return this._http.get<User>(`${this._apiUrl}/me`).pipe(
      tap((user) => {
        this._state.update((s) => ({ ...s, user }));
      }),
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(`${this._apiUrl}/refresh`, {}).pipe(
      tap((res) => {
        if (res.succeeded && res.token) {
          this._handleAuthSuccess(res);
        }
      }),
    );
  }
}
