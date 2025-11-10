import axios from "axios";

/**
 * Serwis do zarządzania ustawieniami użytkowników
 * Obsługuje operacje CRUD dla modelu Customers
 */
export class CustomerService {

  /**
   * Pobiera ustawienia klienta po ID
   * @param {number} customerId - ID klienta
   * @returns {Promise<Object>} Dane klienta
   */
  static async getCustomerSettings(customerId) {
    try {
      const result = await axios.get(`/customers/${customerId}`);

      if (!result.response.success) {
        throw new Error(`HTTP error! status: ${result.response.message}`);
      }

      return this.formatUserData(result.data);
    } catch (error) {
      console.error('Błąd podczas pobierania ustawień klienta:', error);
      throw error;
    }
  }

  /**
   * Pobiera wszystkich klientów (dla administratorów)
   * @returns {Promise<Array>} Lista klientów
   */
  static async getAllCustomers() {
    try {
      const result = await axios.get(`/customers`);

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      return result.data.map(customer => this.formatUserData(customer));
    } catch (error) {
      console.error('Błąd podczas pobierania listy użytkowników:', error);
      throw error;
    }
  }


  /**
   * Tworzy nowego klienta
   * @param {Object} customerData - Dane nowego klienta
   * @returns {Promise<Object>} Utworzony klient
   */
  static async createCustomerSettings(customerData) {
    try {
      const formattedData = CustomerService.formatUserDataForAPI(customerData);

      const result = await axios.post(`/customers`, formattedData);

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      return this.formatUserData(result.data);
    } catch (error) {
      console.error('Błąd podczas tworzenia klienta:', error);
      throw error;
    }
  }

  /**
   * Aktualizuje ustawienia klienta
   * @param {number} customerId - ID klienta
   * @param {Object} customerData - Zaktualizowane dane klienta
   * @returns {Promise<Object>} Zaktualizowany klient
   */
  static async updateCustomerSettings(customerId, customerData) {
    try {
      const formattedData = CustomerService.formatUserDataForAPI(customerData);

      const result = await axios.put(`/customers/${customerId}`, formattedData);

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      return this.formatUserData(result.data);
    } catch (error) {
      console.error('Błąd podczas aktualizacji ustawień klienta:', error);
      throw error;
    }
  }

  /**
   * Usuwa klienta (soft delete - ustawia active na false)
   * @param {number} customerId - ID klienta
   * @returns {Promise<boolean>} Status operacji
   */
  static async deleteCustomer(customerId) {
    try {
      const result = await axios.delete(`/customers/${customerId}`);

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      return true;
    } catch (error) {
      console.error('Błąd podczas usuwania klienta:', error);
      throw error;
    }
  }

  /**
   * Testuje połączenie SMTP dla klienta
   * @param {Object} smtpConfig - Konfiguracja SMTP
   * @returns {Promise<Object>} Wynik testu
   */
  static async testSmtpConnection(smtpConfig) {
    try {
      const result = await axios.post(`/customers/test-smtp`, smtpConfig);

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      return result.data;
    } catch (error) {
      console.error('Błąd podczas testowania połączenia SMTP:', error);
      throw error;
    }
  }

  /**
   * Generuje domyślną stopkę RODO
   * @param {Object} companyData - Dane firmy
   * @returns {string} Wygenerowana stopka RODO
   */
  static generateDefaultRodoFooter(companyData) {
    const {
      companyName = '[Nazwa firmy]',
      companyAddressLine1 = '',
      companyAddressLine2 = '',
      companyAddressCity = '',
      companyAddressPostalCode = ''
    } = companyData;

    const addressParts = [
      companyAddressLine1,
      companyAddressLine2,
      companyAddressPostalCode && companyAddressCity ? 
        `${companyAddressPostalCode} ${companyAddressCity}` :
        companyAddressCity || companyAddressPostalCode
    ].filter(Boolean);

    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '[Adres firmy]';

    return `Zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO), informujemy, że:

Administrator danych: ${companyName}
Adres: ${fullAddress}

Przetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych. Mają Państwo prawo do wycofania zgody w dowolnym momencie.
Jeśli nie chcą Państwo otrzymywać dalszych wiadomości, mogą się Państwo wypisać z listy mailingowej klikając: {{UNSUBSCRIBE_LINK}}.
W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt na adres: ${companyName}.`;
  }



  /**
   * Formatuje dane użytkownika z API do formatu komponentu
   * @param {Object} apiData - Dane z API
   * @returns {Object} Sformatowane dane
   */
  static formatUserData(apiData) {
    return {
      id: apiData.id,
      name: apiData.name || '',
      companyName: apiData.companyName || apiData.company_name || '',
      companyAddressLine1: apiData.companyAddressLine1 || apiData.company_address_line_1 || '',
      companyAddressLine2: apiData.companyAddressLine2 || apiData.company_address_line_2 || '',
      companyAddressCity: apiData.companyAddressCity || apiData.company_address_city || '',
      companyAddressPostalCode: apiData.companyAddressPostalCode || apiData.company_address_postal_code || '',
      smtpHost: apiData.smtpHost || apiData.smtp_host || '',
      smtpPort: apiData.smtpPort || apiData.smtp_port || 587,
      smtpUser: apiData.smtpUser || apiData.smtp_user || '',
      smtpPass: apiData.smtpPass || apiData.smtp_pass || '',
      smtpFrom: apiData.smtpFrom || apiData.smtp_from || '',
      rodoFooter: apiData.rodoFooter || apiData.rodo_footer || '',
      internalMailServer: apiData.internalMailServer ?? apiData.use_internal_mail_server ?? true,
      active: apiData.active ?? true,
      smtpSecure: apiData.smtpSecure ?? apiData.smtp_secure ?? false,
      smtpAllowSelfSigned: apiData.smtpAllowSelfSigned ?? apiData.smtp_allow_self_signed ?? false,
      replyCheckEnabled: apiData.replyCheckEnabled ?? apiData.reply_check_enabled ?? false,
      replyMailboxHost: apiData.replyMailboxHost || apiData.reply_mailbox_host || '',
      replyMailboxPort: apiData.replyMailboxPort || apiData.reply_mailbox_port || 993,
      replyMailboxUser: apiData.replyMailboxUser || apiData.reply_mailbox_user || '',
      replyMailboxPass: apiData.replyMailboxPass || apiData.reply_mailbox_pass || '',
      replyMailboxProtocol: apiData.replyMailboxProtocol || apiData.reply_mailbox_protocol || 'imap',
      replyMailboxFolder: apiData.replyMailboxFolder || apiData.reply_mailbox_folder || 'INBOX',
      replyMailboxTls: apiData.replyMailboxTls ?? apiData.reply_mailbox_tls ?? true,
      replyMailboxAllowSelfSigned: apiData.replyMailboxAllowSelfSigned ?? apiData.reply_mailbox_allow_self_signed ?? false,
      
    };
  }

  /**
   * Formatuje dane użytkownika z komponentu do formatu API
   * @param {Object} componentData - Dane z komponentu
   * @returns {Object} Sformatowane dane dla API
   */
  static formatUserDataForAPI(componentData) {
    return {
      name: componentData.name,
      companyName: componentData.companyName,
      companyAddressLine1: componentData.companyAddressLine1,
      companyAddressLine2: componentData.companyAddressLine2,
      companyAddressCity: componentData.companyAddressCity,
      companyAddressPostalCode: componentData.companyAddressPostalCode,
      smtpHost: componentData.smtpHost,
      smtpPort: componentData.smtpPort,
      smtpUser: componentData.smtpUser,
      smtpPass: componentData.smtpPass,
      smtpFrom: componentData.smtpFrom,
      rodoFooter: componentData.rodoFooter,
      internalMailServer: componentData.internalMailServer,
      active: componentData.active,
      smtpSecure: componentData.smtpSecure,
      smtpAllowSelfSigned: componentData.smtpAllowSelfSigned,
      replyCheckEnabled: componentData.replyCheckEnabled,
      replyMailboxHost: componentData.replyMailboxHost,
      replyMailboxPort: componentData.replyMailboxPort,
      replyMailboxUser: componentData.replyMailboxUser,
      replyMailboxPass: componentData.replyMailboxPass,
      replyMailboxProtocol: componentData.replyMailboxProtocol,
      replyMailboxFolder: componentData.replyMailboxFolder,
      replyMailboxTls: componentData.replyMailboxTls,
      replyMailboxAllowSelfSigned: componentData.replyMailboxAllowSelfSigned,
    };
  }

  /**
   * Pobiera bieżące ustawienia użytkownika (z sesji/cache)
   * @returns {Promise<Object>} Bieżące ustawienia klienta
   */
  static async getCurrentCustomerSettings() {
    try {
      // Sprawdź cache
      const cachedSettings = localStorage.getItem('customerSettings');
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        const cacheTime = new Date(parsed.timestamp);
        const now = new Date();
        const diffMinutes = (now - cacheTime) / (1000 * 60);
        
        // Użyj cache jeśli ma mniej niż 5 minut
        if (diffMinutes < 5) {
          return parsed.data;
        }
      }

      // Pobierz z API
      const result = await axios.get(`/customers/current`);

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      const formattedData = this.formatUserData(result.data.data);

      // Zapisz w cache
      localStorage.setItem('customerSettings', JSON.stringify({
        data: formattedData,
        timestamp: new Date().toISOString()
      }));

      return formattedData;
    } catch (error) {
      console.error('Błąd podczas pobierania bieżących ustawień klienta:', error);
      throw error;
    }
  }

  /**
   * Czyści cache ustawień klienta
   */
  static clearCustomerSettingsCache() {
    localStorage.removeItem('customerSettings');
  }
}
