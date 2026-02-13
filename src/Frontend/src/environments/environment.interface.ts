/**
 * Application environment configuration interface
 * Provides type safety for environment variables across the application
 */
export interface AppEnvironment {
  /** Whether the application is running in production mode */
  production: boolean;

  /** Base URL for API endpoints */
  apiBaseUrl: string;

  /** Development token for Clearbit logo API (development only) */
  logoDevToken?: string;
}

/**
 * Default development environment configuration
 */
export const devEnvironment: AppEnvironment = {
  production: false,
  apiBaseUrl: 'http://localhost:5053/api',
  logoDevToken: 'pk_mcaO5iQcTZ-sCZhRe8hF1Q',
};

/**
 * Production environment configuration
 * Values should be injected via environment files or build process
 */
export const prodEnvironment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/api', // Configure via Azure App Service environment variables
};
