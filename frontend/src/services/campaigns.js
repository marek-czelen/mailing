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

  // ============= CAMPAIGN REPLIES =============
  
  /**
   * Pobierz odpowiedzi do kampanii (z paginacją i filtrowaniem)
   * @param {number} campaignId - ID kampanii
   * @param {Object} params - Parametry filtrowania i paginacji
   */
  static async getCampaignReplies(campaignId, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 50,
      search: params.search || ''
    });
    
    // Dodaj sortowanie jeśli przekazano
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }
    
    // Dodaj opcjonalne filtry
    if (params.hasContact !== null && params.hasContact !== undefined) {
      queryParams.append('hasContact', params.hasContact);
    }
    if (params.dateFrom) {
      queryParams.append('dateFrom', params.dateFrom);
    }
    if (params.dateTo) {
      queryParams.append('dateTo', params.dateTo);
    }
    
    const response = await axios.get(`/mailing/campaigns/${campaignId}/replies?${queryParams}`);
    
    // Dostosuj format odpowiedzi do oczekiwanego przez komponent
    const data = response.data.data;
    return {
      replies: data.replies || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      totalPages: data.pagination?.totalPages || 1,
      summary: data.summary || {}
    };
  }

  /**
   * Pobierz statystyki odpowiedzi kampanii
   * @param {number} campaignId - ID kampanii
   */
  static async getCampaignRepliesStats(campaignId) {
    const response = await axios.get(`/mailing/campaigns/${campaignId}/replies/stats`);
    return response.data.data;
  }

  /**
   * Pobierz szczegóły pojedynczej odpowiedzi
   * @param {number} replyId - ID odpowiedzi
   */
  static async getReplyById(replyId) {
    const response = await axios.get(`/mailing/replies/${replyId}/full`);
    return response.data.data.reply;
  }

  /**
   * Oznacz odpowiedź jako przeczytaną
   * @param {number} replyId - ID odpowiedzi
   */
  static async markReplyAsRead(replyId) {
    const response = await axios.put(`/mailing/replies/${replyId}/mark-read`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }
}
