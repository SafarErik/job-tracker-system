/**
 * ============================================================================
 * AUTH SERVICE
 * ============================================================================
 *
 * Central service for all authentication operations.
 * Handles login, register, logout, token management, and Google OAuth.
 *
 * Best practices:
 * - Use signals for reactive state management (Angular 16+)
 * - Store tokens in localStorage for persistence across sessions
 * - Decode JWT to extract user info without API call
 * - Handle token expiration gracefully
 * - Use BehaviorSubject pattern for auth state
 */

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

// ============================================================================
// CONSTANTS
// ============================================================================

/** LocalStorage key for storing JWT token */
const TOKEN_KEY = 'jobtracker_auth_token';

/** LocalStorage key for storing user data */
const USER_KEY = 'jobtracker_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ============================================================================
  // API ENDPOINTS
  // ============================================================================
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  // ============================================================================
  // REACTIVE STATE (Using Signals - Angular 16+)
  // ============================================================================

  /**
   * Private writeable signal for auth state
   * Only this service can modify the state
   */
  private readonly _authState = signal<AuthState>(initialAuthState);

  /**
   * Public readonly signals for components to subscribe
   * These are computed from the main auth state
   */
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly isLoading = computed(() => this._authState().isLoading);
  readonly currentUser = computed(() => this._authState().user);
  readonly authError = computed(() => this._authState().error);

  /**
   * Full name computed from user's first and last name
   */
  readonly userFullName = computed(() => {
    const user = this._authState().user;
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  });

  /**
   * User initials for avatar display
   */
  readonly userInitials = computed(() => {
    const user = this._authState().user;
    if (!user) return '?';
    const first = user.firstName?.[0] || user.email[0] || '?';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    // On service initialization, check for existing token
    this.initializeAuthState();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize auth state from localStorage on app startup.
   * Checks if a valid token exists and restores the session.
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();

    if (token && !this.isTokenExpired(token)) {
      // Token exists and is valid - restore user from token
      const user = this.decodeUserFromToken(token);
      this.updateAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } else {
      // No valid token - clear any stale data
      this.clearStoredAuth();
      this.updateAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Login with email and password.
   * On success, stores token and updates auth state.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.succeeded && response.token) {
          this.handleAuthSuccess(response);
        } else {
          this.handleAuthError(response.message || 'Login failed');
        }
      }),
      catchError((error) => {
        const message = error.error?.message || 'Login failed. Please try again.';
        this.handleAuthError(message);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Register a new user account.
   * On success, automatically logs in the user.
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.setLoading(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.succeeded && response.token) {
          this.handleAuthSuccess(response);
        } else {
          this.handleAuthError(response.message || 'Registration failed');
        }
      }),
      catchError((error) => {
        const message = error.error?.message || 'Registration failed. Please try again.';
        this.handleAuthError(message);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Logout the current user.
   * Clears all stored auth data and redirects to login.
   */
  logout(): void {
    this.clearStoredAuth();
    this.updateAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
    this.router.navigate(['/login']);
  }

  /**
   * Get current user profile from the API.
   * Useful for refreshing user data.
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.storeUser(user);
        this.updateAuthState({
          ...this._authState(),
          user,
        });
      }),
    );
  }

  /**
   * Refresh the JWT token.
   * Should be called before token expires.
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap((response) => {
        if (response.succeeded && response.token) {
          this.storeToken(response.token);
          if (response.user) {
            this.storeUser(response.user);
          }
        }
      }),
    );
  }

  // ============================================================================
  // GOOGLE OAUTH
  // ============================================================================

  /**
   * Initiates Google OAuth login flow.
   * Redirects the browser to the backend which then redirects to Google.
   */
  loginWithGoogle(): void {
    const returnUrl = encodeURIComponent(globalThis.location.origin);
    globalThis.location.href = `${this.apiUrl}/google-login?returnUrl=${returnUrl}`;
  }

  /**
   * Handle the callback from Google OAuth.
   * Called when the frontend receives the token in the URL.
   *
   * @param token - JWT token received from the backend callback
   */
  handleGoogleCallback(token: string): void {
    if (!token) {
      this.handleAuthError('No token received from Google authentication');
      this.router.navigate(['/login']);
      return;
    }

    // Store the token and decode user info
    this.storeToken(token);
    const user = this.decodeUserFromToken(token);

    this.updateAuthState({
      isAuthenticated: true,
      isLoading: false,
      user,
      error: null,
    });

    // Redirect to home or intended destination
    this.router.navigate(['/']);
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Get the stored JWT token.
   * Returns null if no token is stored.
   */
  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Store JWT token in localStorage.
   */
  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Store user data in localStorage.
   */
  private storeUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all stored authentication data.
   */
  private clearStoredAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if a JWT token is expired.
   *
   * @param token - The JWT token to check
   * @returns true if expired, false if still valid
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) return true;

      // exp is in seconds, Date.now() is in milliseconds
      const expirationDate = new Date(decoded.exp * 1000);
      const now = new Date();

      // Add 60 second buffer to handle clock skew
      return expirationDate.getTime() - 60000 < now.getTime();
    } catch {
      return true;
    }
  }

  /**
   * Decode a JWT token to extract its payload.
   * JWT format: header.payload.signature
   * Handles URL-safe base64 encoding used in JWTs.
   */
  private decodeToken(token: string): DecodedToken {
    try {
      // Split token and get payload (middle part)
      let payload = token.split('.')[1];

      // Convert URL-safe base64 to standard base64
      // Replace - with + and _ with /
      payload = payload.replaceAll('-', '+').replaceAll('_', '/');

      // Add padding if needed (base64 strings must be divisible by 4)
      const padding = payload.length % 4;
      if (padding > 0) {
        payload += '='.repeat(4 - padding);
      }

      // Base64 decode with proper UTF-8 handling
      // atob() alone doesn't handle UTF-8 characters correctly
      const decoded = atob(payload);
      // Convert each character code to a UTF-8 byte, then decode as UTF-8 string
      const utf8String = decodeURIComponent(
        Array.from(decoded)
          .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(utf8String);
    } catch {
      return {};
    }
  }

  /**
   * Extract user information from JWT token claims.
   */
  private decodeUserFromToken(token: string): User {
    const decoded = this.decodeToken(token);

    // .NET uses long claim type URIs
    const nameIdentifierClaim =
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
    const emailClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

    return {
      id: decoded[nameIdentifierClaim] || '',
      email: decoded[emailClaim] || '',
      firstName: decoded.firstName || undefined,
      lastName: decoded.lastName || undefined,
      createdAt: new Date(),
    };
  }

  // ============================================================================
  // STATE HELPERS
  // ============================================================================

  /**
   * Update the auth state signal.
   */
  private updateAuthState(state: AuthState): void {
    this._authState.set(state);
  }

  /**
   * Set loading state.
   */
  private setLoading(isLoading: boolean): void {
    this._authState.update((state) => ({
      ...state,
      isLoading,
      error: null,
    }));
  }

  /**
   * Handle successful authentication.
   */
  private handleAuthSuccess(response: AuthResponse): void {
    if (response.token) {
      this.storeToken(response.token);
    }
    if (response.user) {
      this.storeUser(response.user);
    }

    this.updateAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: response.user || null,
      error: null,
    });
  }

  /**
   * Handle authentication error.
   */
  private handleAuthError(message: string): void {
    this.updateAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: message,
    });
  }

  /**
   * Clear any error state.
   */
  clearError(): void {
    this._authState.update((state) => ({
      ...state,
      error: null,
    }));
  }
}
