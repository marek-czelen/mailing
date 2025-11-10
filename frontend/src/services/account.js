import axios from 'axios';

export class Account {
  /**
   * Pobiera token autoryzacji z localStorage
   * @returns {string|null} Token autoryzacji
   */
  static getAuthToken() {
    return localStorage.getItem('authToken');
  }

  static IsLoggedIn() {
    return !!localStorage.getItem('auth_token');
  }
  static async login(email, password) {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data && response.data.data.token) {
        const token = response.data.data.token;
        localStorage.setItem('auth_token', token);
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }


  static logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * Pobierz dane aktualnie zalogowanego użytkownika
   */
  static async getCurrentUser() {
    try {
      // Sprawdź cache w localStorage
      // const cachedUser = localStorage.getItem('user_data');
      // if (cachedUser) {
      //   return JSON.parse(cachedUser);
      // }

      // Jeśli brak cache, pobierz z API
      const response = await axios.get('/auth/me');
      const userData = response.data?.data || response.data;
      
      if (!userData) {
        console.warn('Brak danych użytkownika w odpowiedzi API');
        return null;
      }
      
      // Zapisz w cache
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Błąd podczas pobierania danych użytkownika:', error);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
      
      // Fallback - zwróć domyślne dane użytkownika dla developmentu
      if (process.env.NODE_ENV === 'development') {
        const fallbackUser = {
          id: 1,
          email: 'dev@example.com',
          customer_id: 1,
          name: 'Developer User'
        };
        localStorage.setItem('user_data', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      
      return null;
    }
  }

  /**
   * Pobierz customer_id aktualnie zalogowanego użytkownika
   */
  static async getCurrentCustomerId() {
    const user = await this.getCurrentUser();
    const customerId = user?.customer_id || user?.customerId;
    
    if (!customerId) {
      console.warn('Nie można pobrać customer_id z danych użytkownika. Używam domyślnego ID = 1');
      return 1; // Domyślny customer_id dla developmentu
    }
    
    return customerId;
  }

  /**
   * Wyczyść cache danych użytkownika (wymusi ponowne pobranie)
   */
  static clearUserCache() {
    localStorage.removeItem('user_data');
  }
}

