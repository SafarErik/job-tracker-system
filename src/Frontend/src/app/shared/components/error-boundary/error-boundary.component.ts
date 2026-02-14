import {
  Component,
  ErrorHandler,
  Injectable,
  Injector,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Error information interface
 */
export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  location?: string;
}

/**
 * ErrorHandlerService - Global error handling service
 *
 * Catches and manages application errors centrally.
 * Provides error recovery and reporting capabilities.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  private readonly injector = inject(Injector);

  // Error state
  private readonly _hasError = signal<boolean>(false);
  private readonly _error = signal<ErrorInfo | null>(null);
  private readonly _errorCount = signal<number>(0);

  // Public signals
  readonly hasError = this._hasError.asReadonly();
  readonly error = this._error.asReadonly();
  readonly errorCount = this._errorCount.asReadonly();

  handleError(error: Error | unknown): void {
    // Increment error count
    this._errorCount.update((count) => count + 1);

    // Create error info
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      location: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Set error state
    this._error.set(errorInfo);
    this._hasError.set(true);

    // Log to console in development
    if (typeof console !== 'undefined') {
      console.error('Global error caught:', errorInfo);
    }

    // In production, you could send to error reporting service here
    // this.reportToErrorService(errorInfo);
  }

  /**
   * Clear the error state and attempt recovery
   */
  clearError(): void {
    this._error.set(null);
    this._hasError.set(false);
  }

  /**
   * Reset error count
   */
  resetErrorCount(): void {
    this._errorCount.set(0);
  }
}

/**
 * ErrorBoundaryComponent - Visual error display component
 *
 * Displays when an error occurs in the application.
 * Provides options to retry or navigate to a safe page.
 *
 * Usage:
 * ```html
 * <app-error-boundary>
 *   <ng-content></ng-content>
 * </app-error-boundary>
 * ```
 */
@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (errorHandler.hasError()) {
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h2>Something went wrong</h2>

          <p class="error-message">{{ errorHandler.error()?.message }}</p>

          @if (showDetails()) {
            <pre class="error-details">{{ errorHandler.error()?.stack }}</pre>
          }

          <div class="error-actions">
            <button class="btn-retry" (click)="retry()">Try Again</button>
            <button class="btn-home" (click)="goHome()">Go to Dashboard</button>
            <button class="btn-details" (click)="toggleDetails()">
              {{ showDetails() ? 'Hide Details' : 'Show Details' }}
            </button>
          </div>
        </div>
      </div>
    } @else {
      <ng-content></ng-content>
    }
  `,
  styles: [
    `
      .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        padding: 2rem;
        background-color: #fff5f5;
        border-radius: 8px;
        margin: 1rem;
      }

      .error-content {
        text-align: center;
        max-width: 500px;
      }

      .error-icon {
        color: #e53e3e;
        margin-bottom: 1rem;
      }

      h2 {
        color: #1a202c;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
      }

      .error-message {
        color: #4a5568;
        margin-bottom: 1.5rem;
        font-size: 1rem;
      }

      .error-details {
        background: #1a202c;
        color: #e2e8f0;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.75rem;
        text-align: left;
        margin-bottom: 1.5rem;
        max-height: 200px;
        overflow-y: auto;
      }

      .error-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      button {
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }

      .btn-retry {
        background-color: #3182ce;
        color: white;
      }

      .btn-retry:hover {
        background-color: #2c5282;
      }

      .btn-home {
        background-color: #38a169;
        color: white;
      }

      .btn-home:hover {
        background-color: #276749;
      }

      .btn-details {
        background-color: #718096;
        color: white;
      }

      .btn-details:hover {
        background-color: #4a5568;
      }
    `,
  ],
})
export class ErrorBoundaryComponent {
  readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  showDetails = signal<boolean>(false);

  retry(): void {
    this.showDetails.set(false);
    this.errorHandler.clearError();
    // The parent should handle re-rendering
    window.location.reload();
  }

  goHome(): void {
    this.errorHandler.clearError();
    this.router.navigate(['/dashboard']);
  }

  toggleDetails(): void {
    this.showDetails.update((s) => !s);
  }
}
