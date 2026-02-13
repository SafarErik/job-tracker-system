import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Error Interceptor
 *
 * Handles HTTP errors globally and displays user-friendly notifications.
 * Provides consistent error handling across the application.
 *
 * Error handling:
 * - 0: Network connectivity issues
 * - 400: Bad request / validation errors
 * - 401: Unauthorized (handled by authInterceptor)
 * - 403: Forbidden
 * - 404: Not found
 * - 422: Validation errors
 * - 429: Too many requests
 * - 500+: Server errors
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401s are handled by authInterceptor
      if (error.status === 401) {
        return throwError(() => error);
      }

      let message = 'An unknown error occurred';
      let title = 'Error';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        message = error.error.message;
      } else {
        // Server-side error
        const problemDetails = error.error;

        if (problemDetails && typeof problemDetails === 'object') {
          // ProblemDetails standard
          title = problemDetails.title || title;
          message = problemDetails.detail || message;

          // Handle validation errors
          if (problemDetails.errors) {
            const errors = Object.values(problemDetails.errors).flat().join(', ');
            if (errors) message = errors;
          }
        } else if (typeof error.error === 'string') {
          message = error.error;
        } else {
          message = error.statusText || message;
        }
      }

      // We only want to notify for significant errors, maybe skip 404s depending on tailored needs
      if (error.status !== 404) {
        notificationService.error(message, title);
      }

      return throwError(() => error);
    }),
  );
};
