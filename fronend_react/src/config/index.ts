// Konfiguracja aplikacji dla różnych środowisk
interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Sprawdź czy jesteśmy w trybie development
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Konfiguracja bazowa
const config: AppConfig = {
  apiUrl: isDevelopment 
    ? 'http://localhost:3000'  // Development backend
    : import.meta.env.VITE_API_URL || 'https://your-production-api.com', // Production backend
  appName: 'Panel Mailingowy',
  version: '1.0.0',
  isDevelopment,
  isProduction,
};

// Wyeksportuj konfigurację
export default config;

// Dodatkowe zmienne środowiskowe
export const env = {
  MODE: import.meta.env.MODE,
  API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
};

// Funkcje pomocnicze
export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = config.apiUrl.endsWith('/') 
    ? config.apiUrl.slice(0, -1) 
    : config.apiUrl;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
    
  return `${baseUrl}${cleanEndpoint}`;
};

// Logowanie konfiguracji w development
if (isDevelopment) {
  console.log('🔧 App Configuration:', {
    mode: import.meta.env.MODE,
    apiUrl: config.apiUrl,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
  });
}