// Re-eksport wszystkich typów
export * from './auth';

// Możesz dodawać tutaj inne typy w przyszłości
export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
}