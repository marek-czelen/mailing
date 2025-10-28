import { getApiUrl } from '../config';
import type { LoginCredentials, LoginResponse, User, ApiResponse, ApiError } from '../types/auth';

// Konfiguracja dla fetch requestów
interface RequestConfig extends RequestInit {
  timeout?: number;
}

// Klasa do obsługi błędów API
export class ApiErrorHandler extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Bazowa klasa do komunikacji z API
class ApiClient {
  private defaultTimeout: number = 10000;

  // Pobierz token z localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Stwórz nagłówki dla requestów
  private createHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Funkcja do wykonywania requestów z timeout
  private async fetchWithTimeout(url: string, config: RequestConfig = {}): Promise<Response> {
    const { timeout = this.defaultTimeout, ...requestConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Obsługa odpowiedzi z API
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    let data: any;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        code: data.code || 'UNKNOWN_ERROR'
      };
      throw new ApiErrorHandler(error.message, error.status, error.code);
    }

    return {
      data: data.data || data,
      message: data.message,
      success: data.success !== undefined ? data.success : true,
    };
  }

  // GET request
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.createHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.createHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: this.createHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: this.createHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }
}

// Singleton instance API client
export const apiClient = new ApiClient();

// Serwis autoryzacji
export class AuthService {
  // Login użytkownika
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials, false);
      return response.data;
    } catch (error) {
      if (error instanceof ApiErrorHandler) {
        throw error;
      }
      throw new ApiErrorHandler('Błąd podczas logowania', 500, 'LOGIN_ERROR');
    }
  }

  // Wylogowanie użytkownika
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Wyloguj lokalnie nawet jeśli request się nie powiódł
      console.warn('Błąd podczas wylogowania na serwerze:', error);
    }
  }

  // Weryfikacja tokenu
  static async verifyToken(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/verify');
      return response.data;
    } catch (error) {
      if (error instanceof ApiErrorHandler) {
        throw error;
      }
      throw new ApiErrorHandler('Błąd podczas weryfikacji tokenu', 500, 'VERIFY_TOKEN_ERROR');
    }
  }

  // Odświeżenie tokenu
  static async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh');
      return response.data;
    } catch (error) {
      if (error instanceof ApiErrorHandler) {
        throw error;
      }
      throw new ApiErrorHandler('Błąd podczas odświeżania tokenu', 500, 'REFRESH_TOKEN_ERROR');
    }
  }
}

// Export główny
export default apiClient;