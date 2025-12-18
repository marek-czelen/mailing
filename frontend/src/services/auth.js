import axios from 'axios';

/**
 * OAuth Authentication Service
 * Obsługuje logowanie przez dostawców zewnętrznych (Google, GitHub)
 */
export class AuthService {
  /**
   * Inicjuje proces logowania OAuth
   * @param {string} provider - 'google' lub 'github'
   */
  static initiateOAuth(provider) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const currentUrl = window.location.origin;
    const callbackUrl = `${currentUrl}/auth/callback/${provider}`;
    
    // Zapisz URL powrotu w localStorage
    localStorage.setItem('oauth_return_url', '/campaigns');
    
    // Przekieruj do endpointu OAuth na backendzie
    window.location.href = `${baseURL}/auth/${provider}?callback=${encodeURIComponent(callbackUrl)}`;
  }

  /**
   * Obsługuje callback po logowaniu OAuth
   * @param {string} provider - 'google' lub 'github'
   * @param {string} code - Kod autoryzacyjny z OAuth
   * @param {string} state - Token stanu (opcjonalny)
   */
  static async handleOAuthCallback(provider, code, state) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      const response = await axios.post(`${baseURL}/auth/${provider}/callback`, {
        code,
        state
      });

      if (response.data && response.data.data) {
        const { token, user } = response.data.data;
        
        // Zapisz token i dane użytkownika
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        
        if (user) {
          localStorage.setItem('user_data', JSON.stringify(user));
        }

        return {
          success: true,
          user
        };
      }

      return {
        success: false,
        error: 'Invalid response from server'
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Authentication failed'
      };
    }
  }

  /**
   * Pobiera URL przekierowania po udanym logowaniu
   */
  static getReturnUrl() {
    const returnUrl = localStorage.getItem('oauth_return_url') || '/campaigns';
    localStorage.removeItem('oauth_return_url');
    return returnUrl;
  }

  /**
   * Otwiera popup OAuth (alternatywna metoda zamiast pełnego przekierowania)
   * @param {string} provider - 'google' lub 'github'
   */
  static openOAuthPopup(provider) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `${baseURL}/auth/${provider}`,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('Popup closed by user'));
        }
      }, 500);

      // Nasłuchuj wiadomości z popup
      window.addEventListener('message', function handler(event) {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'oauth_success') {
          clearInterval(checkPopup);
          window.removeEventListener('message', handler);
          popup.close();
          resolve(event.data.payload);
        } else if (event.data.type === 'oauth_error') {
          clearInterval(checkPopup);
          window.removeEventListener('message', handler);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }
}
