import axios from 'axios';

export class MailingService {
  static async getSendingProgress(campaignId) {
    try {
      const result = await axios.get(`/mailing/campaignSendingProgress/${campaignId}`);
      return result.data.data;
    } catch (error) {
      console.error('Błąd podczas pobierania postępu wysyłki kampanii:', error);
      throw error;
    }
  }

  static async sendTestEmail(emailTo, emailSubject, emailData, smtpConfig, campaignId = null) {
    try {
      const result = await axios.post(`/mailing/sendEmail`, {
        
        smtp: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            ignoreTLS: smtpConfig.ignoreTLS,
            auth: {
              user: smtpConfig.user,
              pass: smtpConfig.pass
            }
        },
        from: smtpConfig.from || smtpConfig.user,
        to: [emailTo],
        subject: emailSubject,
        html: emailData,
        campaignId

      });

      if (!result.data.response.success) {
        throw new Error(`HTTP error! status: ${result.data.response.message}`);
      }

      return result.data;
    } catch (error) {
      console.error('Błąd podczas wysyłania testowego e-maila:', error);
      throw error;
    }
  }

  static async updateCampaign(campaignId, campaignData) {
    try {
      const result = await axios.put(`/mailing/updateCampaign/${campaignId}`, campaignData);
      return result.data;
    } catch (error) {
      console.error('Błąd podczas aktualizacji kampanii:', error);
      throw error;
    }
  }

  /**
   * Wypisuje kontakt z wszystkich baz mailingowych na podstawie hash
   * @param {string} contactHash - Hash kontaktu do wypisania
   * @returns {Promise<Object>} Wynik operacji wypisywania
   */
  static async unsubscribeFromMailing(contactHash) {
    try {
      // Budujemy URL bez autoryzacji - to publiczny endpoint
      const baseURL = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${baseURL}/mailing/unsubscribe/${contactHash}`;
      
      const result = await axios.get(url, {
        // Nie dodajemy headers z authorization - to publiczny endpoint
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return result.data;
    } catch (error) {
      console.error('Błąd podczas wypisywania z listy mailingowej:', error);
      
      // Obsługa różnych typów błędów
      if (error.response) {
        // Serwer odpowiedział z kodem błędu
        const errorData = error.response.data;
        throw new Error(errorData.message || `Błąd ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Żądanie zostało wysłane, ale brak odpowiedzi
        throw new Error('Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.');
      } else {
        // Błąd podczas konfiguracji żądania
        throw new Error('Błąd konfiguracji żądania: ' + error.message);
      }
    }
  }

  /**
   * Sprawdza status kontaktu w bazie mailingowej
   * @param {string} contactHash - Hash kontaktu do sprawdzenia
   * @returns {Promise<Object>} Status kontaktu
   */
  static async checkContactStatus(contactHash) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${baseURL}/mailing/contact-status/${contactHash}`;
      
      const result = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return result.data;
    } catch (error) {
      console.error('Błąd podczas sprawdzania statusu kontaktu:', error);
      throw error;
    }
  }
}


export default MailingService;