import axios from 'axios';

export class MailingService {
  static async sendTestEmail(emailTo, emailSubject, emailData) {
    try {
      const result = await axios.post(`/mailing/sendEmail`, {
        
        smtp: {
            host: "mail.aculeo.pl",
            port: 465,
            secure: true,
            ignoreTLS: true,
            auth: {
            user: "sprzedaz@verx.pl",
            pass: "Verx@123!"
            }
        },
        from: "sprzedaz@verx.pl",
        to: [
            "czelen@verx.pl"
        ],
        subject: "Test Email",
        html: emailData

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
}


export default MailingService;