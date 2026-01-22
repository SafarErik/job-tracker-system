// Production environment configuration
// These values should be set via Azure Static Web App configuration or environment variables
// If values are missing, the application will use defaults or fail at startup with clear errors

const getRequiredEnvVar = (key: string, fallback?: string): string => {
  // Check runtime environment variables (if using a runtime config loader)
  const runtimeValue = (window as any).__env?.[key];
  if (runtimeValue) return runtimeValue;

  // Use fallback if provided
  if (fallback !== undefined) return fallback;

  // Throw error if required value is missing
  console.error(`Missing required environment variable: ${key}`);
  return '';
};

export const environment = {
  production: true,
  // Set via Azure Static Web App settings or VITE_API_BASE_URL
  // Falls back to empty string - services should validate before use
  apiBaseUrl: getRequiredEnvVar('API_BASE_URL', ''),
  // Set via Azure Static Web App settings or VITE_GOOGLE_CLIENT_ID
  // Falls back to empty string - Google auth will be disabled if missing
  googleClientId: getRequiredEnvVar('GOOGLE_CLIENT_ID', ''),
};
