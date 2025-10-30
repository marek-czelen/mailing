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
   * Importuj kontakty do bazy danych
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