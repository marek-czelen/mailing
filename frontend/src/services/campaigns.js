import axios from 'axios';

export class Campaigns {
  static async fetchAll() {
    // Zmień URL na właściwy endpoint backendu
    const response = await axios.get('/mailing/getCampaigns');
    return response.data.data;
  }
  
  static async create(campaign) {
    // Wyślij dane kampanii jako JSON (plik = ścieżka)
    const payload = {
      name: campaign.name,
      date: campaign.date,
      mailContent: campaign.mailContent,
      file: campaign.file // tu jest ścieżka pliku z FileDrop
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
      date: campaign.date,
      mailContent: campaign.mailContent,
      file: campaign.file
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
}
