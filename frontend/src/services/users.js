import axios from 'axios';
import { Account } from './account';

/**
 * Serwis do zarządzania użytkownikami
 */
export class UsersService {
  /**
   * Role użytkowników w systemie
   */
  static ROLES = {
    ADMINISTRATOR: 'administrator',
    MARKETER: 'marketer',
    DATA_ADMINISTRATOR: 'data_administrator'
  };

  /**
   * Opisy ról
   */
  static ROLE_DESCRIPTIONS = {
    administrator: 'Zarządzanie systemem - pełny dostęp do wszystkich funkcji',
    marketer: 'Tworzenie i wysyłanie kampanii mailowych',
    data_administrator: 'Zarządzanie bazami danych i kontaktami'
  };

  /**
   * Pobierz listę wszystkich użytkowników dla aktualnego klienta
   */
  static async getUsers() {
    try {
      const customerId = await Account.getCurrentCustomerId();
      const response = await axios.get(`/api/users?customer_id=${customerId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania użytkowników:', error);
      throw error;
    }
  }

  /**
   * Pobierz szczegóły pojedynczego użytkownika
   */
  static async getUser(userId) {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania użytkownika:', error);
      throw error;
    }
  }

  /**
   * Utwórz nowego użytkownika
   * @param {Object} userData - Dane użytkownika
   * @param {string} userData.email - Email użytkownika
   * @param {string} userData.name - Imię i nazwisko
   * @param {string} userData.password - Hasło
   * @param {Array<string>} userData.roles - Tablica ról
   * @param {boolean} userData.active - Czy konto jest aktywne
   */
  static async createUser(userData) {
    try {
      const customerId = await Account.getCurrentCustomerId();
      const payload = {
        ...userData,
        customer_id: customerId
      };
      const response = await axios.post('/api/users', payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas tworzenia użytkownika:', error);
      throw error;
    }
  }

  /**
   * Zaktualizuj dane użytkownika
   * @param {number} userId - ID użytkownika
   * @param {Object} userData - Dane do aktualizacji
   */
  static async updateUser(userId, userData) {
    try {
      const response = await axios.put(`/api/users/${userId}`, userData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas aktualizacji użytkownika:', error);
      throw error;
    }
  }

  /**
   * Usuń użytkownika
   * @param {number} userId - ID użytkownika
   */
  static async deleteUser(userId) {
    try {
      await axios.delete(`/api/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Błąd podczas usuwania użytkownika:', error);
      throw error;
    }
  }

  /**
   * Zmień hasło użytkownika
   * @param {number} userId - ID użytkownika
   * @param {string} newPassword - Nowe hasło
   */
  static async changePassword(userId, newPassword) {
    try {
      const response = await axios.post(`/api/users/${userId}/change-password`, {
        password: newPassword
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas zmiany hasła:', error);
      throw error;
    }
  }

  /**
   * Pobierz role użytkownika
   * @param {number} userId - ID użytkownika
   */
  static async getUserRoles(userId) {
    try {
      const response = await axios.get(`/api/users/${userId}/roles`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania ról użytkownika:', error);
      throw error;
    }
  }

  /**
   * Zaktualizuj role użytkownika
   * @param {number} userId - ID użytkownika
   * @param {Array<string>} roles - Nowa lista ról
   */
  static async updateUserRoles(userId, roles) {
    try {
      const response = await axios.put(`/api/users/${userId}/roles`, { roles });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas aktualizacji ról użytkownika:', error);
      throw error;
    }
  }

  /**
   * Sprawdź czy aktualny użytkownik ma daną rolę
   * @param {string} role - Nazwa roli do sprawdzenia
   */
  static async currentUserHasRole(role) {
    try {
      const user = await Account.getCurrentUser();
      if (!user || !user.roles) {
        return false;
      }
      return user.roles.includes(role);
    } catch (error) {
      console.error('Błąd podczas sprawdzania roli użytkownika:', error);
      return false;
    }
  }

  /**
   * Sprawdź czy aktualny użytkownik jest administratorem
   */
  static async isCurrentUserAdmin() {
    return await this.currentUserHasRole(this.ROLES.ADMINISTRATOR);
  }

  /**
   * Aktywuj lub dezaktywuj konto użytkownika
   * @param {number} userId - ID użytkownika
   * @param {boolean} active - Czy konto ma być aktywne
   */
  static async setUserActive(userId, active) {
    try {
      const response = await axios.patch(`/api/users/${userId}/active`, { active });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas zmiany statusu użytkownika:', error);
      throw error;
    }
  }

  /**
   * Wyślij email resetowania hasła
   * @param {string} email - Email użytkownika
   */
  static async sendPasswordResetEmail(email) {
    try {
      const response = await axios.post('/api/users/password-reset', { email });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Błąd podczas wysyłania emaila resetującego hasło:', error);
      throw error;
    }
  }
}
