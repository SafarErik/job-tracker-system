/**
 * ============================================================================
 * AUTH MODELS
 * ============================================================================
 *
 * TypeScript interfaces for authentication-related data structures.
 * These models match the backend DTOs for type-safe communication.
 *
 * Best practices:
 * - Use interfaces for data structures (no runtime overhead)
 * - Match backend DTO property names exactly (case-sensitive!)
 * - Use optional properties (?) for nullable fields
 * - Export all models for use across the application
 */

// ============================================================================
// USER MODEL
// ============================================================================

/**
 * Represents an authenticated user in the system.
 * Maps to UserDto from the backend.
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  currentJobTitle?: string;
  yearsOfExperience?: number;
  createdAt: Date;
}

// ============================================================================
// AUTHENTICATION REQUEST MODELS
// ============================================================================

/**
 * Data required for user login.
 * Maps to LoginDto from the backend.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Data required for user registration.
 * Maps to RegisterDto from the backend.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

// ============================================================================
// AUTHENTICATION RESPONSE MODELS
// ============================================================================

/**
 * Response from authentication endpoints (login, register, etc.).
 * Maps to AuthResponseDto from the backend.
 */
export interface AuthResponse {
  succeeded: boolean;
  message: string;
  token?: string;
  user?: User;
}

// ============================================================================
// TOKEN MODELS
// ============================================================================

/**
 * Decoded JWT token payload.
 * Contains claims embedded in the token.
 */
export interface DecodedToken {
  // Standard JWT claims
  sub?: string; // Subject (not used by our backend)
  jti?: string; // JWT ID
  iat?: number; // Issued at (Unix timestamp)
  exp?: number; // Expiration (Unix timestamp)

  // .NET Identity claims (using claim type URIs)
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;

  // Custom claims from our backend
  firstName?: string;
  lastName?: string;
}

// ============================================================================
// AUTH STATE MODEL
// ============================================================================

/**
 * Represents the current authentication state.
 * Used by components to determine what to display.
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

/**
 * Initial auth state - used when the app starts
 */
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start with loading to check for existing token
  user: null,
  error: null,
};
