import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthState, AuthContextValue, LoginCredentials, User } from '../types/auth';
import { AuthService, ApiErrorHandler } from '../services/api';

// Stan początkowy
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Typy akcji dla reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REFRESH_SUCCESS'; payload: { user: User; token: string } };

// Reducer do zarządzania stanem autoryzacji
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Tworzenie kontekstu
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Hook do używania kontekstu autoryzacji
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider komponent
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sprawdź czy użytkownik jest zalogowany przy starcie aplikacji
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          try {
            // Weryfikuj token na serwerze
            const user = await AuthService.verifyToken();
            
            // Zaktualizuj dane użytkownika z serwera
            localStorage.setItem('user_data', JSON.stringify(user));
            
            dispatch({
              type: 'REFRESH_SUCCESS',
              payload: { user, token }
            });
          } catch (error) {
            // Token jest nieważny - wyczyść dane i wyloguj
            console.warn('Token nieważny, wylogowywanie użytkownika');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Wyczyść nieprawidłowe dane
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Funkcja logowania
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Prawdziwe wywołanie API
      const response = await AuthService.login(credentials);
      
      // Zapisz token i dane użytkownika w localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
    } catch (error) {
      let errorMessage = 'Wystąpił błąd podczas logowania';
      
      if (error instanceof ApiErrorHandler) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw error; // Przekaż błąd do komponentu formularza
    }
  };

  // Funkcja wylogowania
  const logout = async (): Promise<void> => {
    try {
      // Powiadom serwer o wylogowaniu
      await AuthService.logout();
    } catch (error) {
      // Wyloguj lokalnie nawet jeśli request się nie powiódł
      console.warn('Błąd podczas wylogowania na serwerze:', error);
    } finally {
      // Zawsze wyczyść lokalne dane
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Funkcja czyszczenia błędów
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Funkcja odświeżania autoryzacji
  const refreshAuth = async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'REFRESH_SUCCESS',
          payload: { user, token }
        });
      } catch (error) {
        logout();
      }
    }
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    clearError,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};