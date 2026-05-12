import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  succeeded: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Query parameters for paginated requests
 */
export interface QueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * BaseApiService - Abstract base class for all API services
 *
 * Provides standardized HTTP methods with:
 * - Error handling
 * - Retry logic
 * - Base URL configuration
 * - Type-safe responses
 *
 * Usage:
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class JobApplicationService extends BaseApiService {
 *   getApplications(): Observable<JobApplication[]> {
 *     return this.get<JobApplication[]>('/job-applications');
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = environment.apiBaseUrl;
  }

  /**
   * GET request with optional query parameters
   */
  protected get<T>(
    endpoint: string,
    params?: QueryParams | Record<string, string | number | boolean>,
  ): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams }).pipe(
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          const isRetriable = error.status === 0 || (error.status >= 500 && error.status <= 599);
          if (!isRetriable) {
            throw error;
          }
          console.warn(`Retry attempt ${retryCount + 1} for ${endpoint}`);
          return timer(1000);
        },
      }),
      catchError(this.handleError),
    );
  }

  /**
   * GET request that returns ApiResponse<T>
   */
  protected getWithResponse<T>(
    endpoint: string,
    params?: QueryParams | Record<string, string | number | boolean>,
  ): Observable<ApiResponse<T>> {
    return this.get<ApiResponse<T>>(endpoint, params);
  }

  /**
   * POST request
   */
  protected post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body).pipe(catchError(this.handleError));
  }

  /**
   * POST request that returns ApiResponse<T>
   */
  protected postWithResponse<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.post<ApiResponse<T>>(endpoint, body);
  }

  /**
   * PUT request
   */
  protected put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body).pipe(catchError(this.handleError));
  }

  /**
   * PUT request that returns ApiResponse<T>
   */
  protected putWithResponse<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.put<ApiResponse<T>>(endpoint, body);
  }

  /**
   * PATCH request
   */
  protected patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`).pipe(catchError(this.handleError));
  }

  /**
   * DELETE request that returns ApiResponse<T>
   */
  protected deleteWithResponse<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.delete<ApiResponse<T>>(endpoint);
  }

  /**
   * Handle HTTP errors consistently
   */
  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Build query string from params (for complex scenarios)
   */
  protected buildQueryString(
    params: Record<string, string | number | boolean | undefined>,
  ): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }
}
