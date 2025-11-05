import axios from 'axios';

export class Campaigns {
  static async getList() {
    // Zmień URL na właściwy endpoint backendu
    const response = await axios.get('/mailing/getCampaignsList');
    return response.data.data;
  }

  static async getCampaignById(id) {
    // Pobierz jedną kampanię po id
    const response = await axios.get(`/mailing/getCampaignById/${id}`);
    return response.data.data;
  }
  
  static async create(campaign) {
    // Wyślij dane kampanii jako JSON
    const payload = {
      name: campaign.name,
      subject: campaign.subject,
      description: campaign.description,
      databaseId: campaign.databaseId,
      htmlContent: campaign.htmlContent,
      senderName: campaign.senderName,
      senderEmail: campaign.senderEmail,
      from: campaign.senderEmail,
      dateStart: campaign.scheduledAt,
    };
    const response = await axios.post('/mailing/createCampaign', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  static async update(id, campaign) {
    // Aktualizuj kampanię
    const payload = {
      name: campaign.name,
      subject: campaign.subject,
      description: campaign.description,
      databaseId: campaign.databaseId,
      htmlContent: campaign.htmlContent,
      senderName: campaign.senderName,
      senderEmail: campaign.senderEmail,
      from: campaign.senderEmail,
      dateStart: campaign.scheduledAt,
    };
    const response = await axios.put(`/mailing/updateCampaign/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }
  
  static async delete(id) {
    // Usuń kampanię po id
    const response = await axios.delete(`/mailing/deleteCampaign/${id}`);
    return response.data;
  }

  static async send(id) {
    // Wyślij kampanię natychmiast
    const response = await axios.post(`/mailing/sendCampaign/${id}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }
}
