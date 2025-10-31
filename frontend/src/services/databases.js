import axios from 'axios';
import { Account } from './account.js';

export class Databases {
  /**
   * Pobierz customer_id aktualnie zalogowanego użytkownika
   * @private
   */
  static async _getCurrentCustomerId() {
    try {
      const customerId = await Account.getCurrentCustomerId();
      return customerId || 1; // Domyślny fallback
    } catch (error) {
      console.warn('Błąd podczas pobierania customer_id, używam domyślnego ID = 1:', error);
      return 1;
    }
  }

  /**
   * Pobierz bazy danych dla aktualnie zalogowanego użytkownika
   */
  static async getList() {
    try {
      // Pobierz customer_id aktualnie zalogowanego użytkownika
      const customer_id = await this._getCurrentCustomerId();
      
      // Pobierz tylko bazy danych tego klienta
      const response = await axios.get(`/mailing/getDatabasesByCustomer/${customer_id}`);
      return response.data.data;
    } catch (error) {
      // Fallback - jeśli nie można pobrać customer_id, spróbuj pobrać wszystkie
      console.warn('Nie można pobrać customer_id, używam fallback do wszystkich baz danych');
      const response = await axios.get('/mailing/getDatabasesList');
      return response.data.data;
    }
  }

  /**
   * Pobierz bazę danych po ID
   * @param {number} id - ID bazy danych
   */
  static async getDatabaseById(id) {
    const response = await axios.get(`/mailing/getDatabaseById/${id}`);
    return response.data.data;
  }

  /**
   * Utwórz nową bazę danych
   * @param {Object} database - Dane bazy danych
   */
  static async create(database) {
    // Automatycznie pobierz customer_id z danych zalogowanego użytkownika
    const customer_id = await this._getCurrentCustomerId();
    
    const payload = {
      name: database.name,
      description: database.description,
      tags: database.tags || [],
      rodo_flag: database.rodo_flag !== undefined ? database.rodo_flag : true,
      export_enabled: database.export_enabled !== undefined ? database.export_enabled : true,
      customer_id: customer_id
    };
    
    const response = await axios.post('/mailing/createDatabase', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Aktualizuj bazę danych po ID
   * @param {number} id - ID bazy danych
   * @param {Object} database - Zaktualizowane dane bazy danych
   */
  static async update(id, database) {
    // Automatycznie pobierz customer_id z danych zalogowanego użytkownika
    const customer_id = await this._getCurrentCustomerId();
    
    const payload = {
      name: database.name,
      description: database.description,
      tags: database.tags || [],
      rodo_flag: database.rodo_flag,
      export_enabled: database.export_enabled,
      customer_id: customer_id
    };
    
    const response = await axios.put(`/mailing/updateDatabase/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Usuń bazę danych po ID
   * @param {number} id - ID bazy danych
   */
  static async delete(id) {
    const response = await axios.delete(`/mailing/deleteDatabase/${id}`);
    return response.data;
  }

  /**
   * Pobierz bazy danych dla konkretnego klienta
   * @param {number} customerId - ID klienta
   */
  static async getDatabasesByCustomer(customerId) {
    const response = await axios.get(`/mailing/getDatabasesByCustomer/${customerId}`);
    return response.data.data;
  }

  // ============= DODATKOWE METODY POMOCNICZE =============

  /**
   * Pobierz statystyki bazy danych
   * @param {number} id - ID bazy danych
   */
  static async getStatistics(id) {
    const response = await axios.get(`/mailing/getDatabaseStats/${id}`);
    return response.data.data;
  }

  /**
   * Pobierz kontakty z bazy danych
   * @param {number} id - ID bazy danych
   * @param {Object} params - Parametry filtrowania i paginacji
   */
  static async getContacts(id, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 50,
      search: params.search || '',
      status: params.status || '',
      segment: params.segment || ''
    });
    
    const response = await axios.get(`/mailing/getDatabaseContacts/${id}?${queryParams}`);
    return response.data.data;
  }

  /**
   * Dodaj kontakt do bazy danych
   * @param {number} id - ID bazy danych
   * @param {Object} contact - Dane kontaktu
   */
  static async addContact(id, contact) {
    const payload = {
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      customFields: contact.customFields || {},
      segments: contact.segments || [],
      tags: contact.tags || []
    };
    
    const response = await axios.post(`/mailing/addDatabaseContact/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Aktualizuj kontakt w bazie danych
   * @param {number} databaseId - ID bazy danych
   * @param {number} contactId - ID kontaktu
   * @param {Object} contact - Zaktualizowane dane kontaktu
   */
  static async updateContact(databaseId, contactId, contact) {
    const payload = {
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      customFields: contact.customFields || {},
      segments: contact.segments || [],
      tags: contact.tags || []
    };
    
    const response = await axios.put(`/mailing/updateDatabaseContact/${databaseId}/${contactId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Usuń kontakt z bazy danych
   * @param {number} databaseId - ID bazy danych
   * @param {number} contactId - ID kontaktu
   */
  static async deleteContact(databaseId, contactId) {
    const response = await axios.delete(`/mailing/deleteDatabaseContact/${databaseId}/${contactId}`);
    return response.data;
  }

  /**
   * Importuj kontakty do bazy danych (stara wersja)
   * @param {number} id - ID bazy danych
   * @param {File} file - Plik CSV/Excel z kontaktami
   * @param {Object} options - Opcje importu
   */
  static async importContacts(id, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(options.mapping || {}));
    formData.append('skipDuplicates', options.skipDuplicates || false);
    formData.append('updateExisting', options.updateExisting || false);
    
    const response = await axios.post(`/mailing/importDatabaseContacts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  /**
   * Importuj kontakty z pliku Excel do bazy danych (nowa wersja)
   * @param {number} databaseId - ID bazy danych
   * @param {Object|File} payload - Obiekt z nazwą pliku i opcjami lub plik (stara wersja)
   */
  static async importExcelToDatabase(databaseId, payload) {
    // Sprawdź czy to nowy format z nazwą pliku czy stary z plikiem
    if (payload instanceof File || payload instanceof FormData) {
      // Stary format - plik bezpośrednio
      const formData = payload instanceof FormData ? payload : new FormData();
      if (payload instanceof File) {
        formData.append('file', payload);
      }
      
      const response = await axios.post(`/mailing/importExcelToDatabase/${databaseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Nowy format - nazwa przesłanego pliku
      const response = await axios.post(`/mailing/importExcelToDatabase/${databaseId}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    }
  }

  /**
   * Prześlij plik na serwer do późniejszego importu
   * @param {File} file - Plik do przesłania
   * @returns {Promise<{success: boolean, filePath?: string, message?: string}>}
   */
  static async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/mailing/uploadFile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Błąd uploadu pliku:', error);
      throw new Error(error.response?.data?.message || 'Błąd podczas przesyłania pliku');
    }
  }

  /**
   * Eksportuj kontakty z bazy danych
   * @param {number} id - ID bazy danych
   * @param {Object} params - Parametry eksportu
   */
  static async exportContacts(id, params = {}) {
    const queryParams = new URLSearchParams({
      format: params.format || 'csv',
      fields: params.fields ? params.fields.join(',') : '',
      segment: params.segment || '',
      status: params.status || ''
    });
    
    const response = await axios.get(`/mailing/exportDatabaseContacts/${id}?${queryParams}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // ============= SEGMENTY =============

  /**
   * Pobierz segmenty bazy danych
   * @param {number} id - ID bazy danych
   */
  static async getSegments(id) {
    const response = await axios.get(`/mailing/getDatabaseSegments/${id}`);
    return response.data.data;
  }

  /**
   * Utwórz nowy segment
   * @param {number} databaseId - ID bazy danych
   * @param {Object} segment - Dane segmentu
   */
  static async createSegment(databaseId, segment) {
    const payload = {
      name: segment.name,
      description: segment.description || '',
      conditions: segment.conditions || [],
      type: segment.type || 'dynamic'
    };
    
    const response = await axios.post(`/mailing/createDatabaseSegment/${databaseId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Aktualizuj segment
   * @param {number} databaseId - ID bazy danych
   * @param {number} segmentId - ID segmentu
   * @param {Object} segment - Zaktualizowane dane segmentu
   */
  static async updateSegment(databaseId, segmentId, segment) {
    const payload = {
      name: segment.name,
      description: segment.description || '',
      conditions: segment.conditions || [],
      type: segment.type || 'dynamic'
    };
    
    const response = await axios.put(`/mailing/updateDatabaseSegment/${databaseId}/${segmentId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Usuń segment
   * @param {number} databaseId - ID bazy danych
   * @param {number} segmentId - ID segmentu
   */
  static async deleteSegment(databaseId, segmentId) {
    const response = await axios.delete(`/mailing/deleteDatabaseSegment/${databaseId}/${segmentId}`);
    return response.data;
  }

  // ============= POLA NIESTANDARDOWE =============

  /**
   * Pobierz pola niestandardowe bazy danych
   * @param {number} id - ID bazy danych
   */
  static async getCustomFields(id) {
    const response = await axios.get(`/mailing/getDatabaseFields/${id}`);
    return response.data.data;
  }

  /**
   * Utwórz nowe pole niestandardowe
   * @param {number} databaseId - ID bazy danych
   * @param {Object} field - Dane pola
   */
  static async createCustomField(databaseId, field) {
    const payload = {
      name: field.name,
      label: field.label,
      type: field.type, // text, number, date, boolean, select
      required: field.required || false,
      options: field.options || [], // dla typu select
      defaultValue: field.defaultValue || ''
    };
    
    const response = await axios.post(`/mailing/createDatabaseField/${databaseId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Alias dla createCustomField - dodaj nowe pole niestandardowe
   * @param {number} databaseId - ID bazy danych
   * @param {Object} field - Dane pola
   */
  static async addCustomField(databaseId, field) {
    return this.createCustomField(databaseId, field);
  }

  /**
   * Aktualizuj pole niestandardowe
   * @param {number} databaseId - ID bazy danych
   * @param {number} fieldId - ID pola
   * @param {Object} field - Zaktualizowane dane pola
   */
  static async updateCustomField(databaseId, fieldId, field) {
    const payload = {
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required || false,
      options: field.options || [],
      defaultValue: field.defaultValue || ''
    };
    
    const response = await axios.put(`/mailing/updateDatabaseField/${databaseId}/${fieldId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Usuń pole niestandardowe
   * @param {number} databaseId - ID bazy danych
   * @param {number} fieldId - ID pola
   */
  static async deleteCustomField(databaseId, fieldId) {
    const response = await axios.delete(`/mailing/deleteDatabaseField/${databaseId}/${fieldId}`);
    return response.data;
  }

  // ============= WYPISYWANIE Z LISTY =============

  /**
   * Wypisz kontakt ze wszystkich list mailingowych klienta
   * @param {number} contactId - ID kontaktu do wypisania
   * @returns {Promise<Object>} - Wynik operacji wypisywania
   */
  static async unsubscribeContact(contactId) {
    try {
      const response = await axios.get(`/mailing/unsubscribe/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas wypisywania kontaktu:', error);
      throw new Error(error.response?.data?.message || 'Błąd podczas wypisywania z listy');
    }
  }

  /**
   * Ponownie zapisz kontakt na listy mailingowe klienta
   * @param {number} contactId - ID kontaktu do ponownego zapisania
   * @returns {Promise<Object>} - Wynik operacji zapisywania
   */
  static async resubscribeContact(contactId) {
    try {
      const customer_id = await this._getCurrentCustomerId();
      const response = await axios.post(`/mailing/resubscribe/${contactId}/${customer_id}`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas ponownego zapisywania kontaktu:', error);
      throw new Error(error.response?.data?.message || 'Błąd podczas zapisywania na listę');
    }
  }

  /**
   * Aktualizuj kontakt w systemie
   * @param {Object} contactData - Dane kontaktu do aktualizacji
   * @returns {Promise<Object>} - Wynik operacji aktualizacji
   */
  static async updateContact(contactData) {
    try {
      const customer_id = await this._getCurrentCustomerId();
      
      const payload = {
        id: contactData.id,
        mailAddress: contactData.mailAddress,
        miasto: contactData.miasto,
        phone: contactData.phone,
        rodzaj: contactData.rodzaj,
        active: contactData.active !== undefined ? contactData.active : 1,
        databaseId: contactData.databaseId,
        customerId: customer_id
      };
      
      const response = await axios.post('/mailing/contactUpdate', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Błąd podczas aktualizacji kontaktu:', error);
      throw new Error(error.response?.data?.message || 'Błąd podczas aktualizacji kontaktu');
    }
  }

  /**
   * Dodaj nowy kontakt do bazy danych
   * @param {Object} contactData - Dane nowego kontaktu
   * @returns {Promise<Object>} - Wynik operacji dodawania
   */
  static async addContactToDatabase(contactData) {
    try {
      const customer_id = await this._getCurrentCustomerId();
      
      const payload = {
        mailAddress: contactData.mailAddress, // wymagane
        databaseId: contactData.databaseId,   // wymagane
        miasto: contactData.miasto || '',     // opcjonalne
        rodzaj: contactData.rodzaj || '',     // opcjonalne
        phone: contactData.phone || '',       // opcjonalne
        active: contactData.active !== undefined ? contactData.active : 1, // opcjonalne (domyślnie 1)
        customerId: customer_id
      };
      
      const response = await axios.post('/mailing/contactAdd', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Błąd podczas dodawania kontaktu:', error);
      throw new Error(error.response?.data?.message || 'Błąd podczas dodawania kontaktu');
    }
  }

  // ============= STATYSTYKI =============

  /**
   * Pobierz statystyki dla wszystkich baz danych aktualnego klienta
   */
  static async getStats() {
    try {
      const customer_id = await this._getCurrentCustomerId();
      const response = await axios.get(`/mailing/getCustomerDatabasesStats/${customer_id}`);
      return response.data.data;
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk:', error);
      return {};
    }
  }
}