/**
 * ============================================================================
 * CORE/AUTH MODULE - PUBLIC API
 * ============================================================================
 *
 * Barrel file for auth-related exports.
 * Import from '@core/auth' for cleaner imports.
 *
 * Note: Interceptors and guards are also exported from their dedicated folders:
 * - @core/interceptors (authInterceptor, errorInterceptor)
 * - @core/guards (authGuard, guestGuard)
 */

// Models
export * from './auth.model';

// Services
export * from './auth.service';

// Re-export from new locations for backward compatibility
export { authGuard, guestGuard } from '../guards/auth.guard';
export { authInterceptor } from '../interceptors/auth.interceptor';
export { errorInterceptor } from '../interceptors/error.interceptor';
