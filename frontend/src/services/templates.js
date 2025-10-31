import axios from 'axios';

export class Templates {
  /**
   * Pobierz wszystkie dostępne templaty dla użytkownika
   * @param {Object} options - Opcje filtrowania
   * @param {string} options.category - Kategoria templatu
   * @param {string} options.search - Wyszukiwana fraza
   * @param {boolean} options.includeBlocks - Czy dołączyć bloki
   * @returns {Promise<Array>} Lista templat
   */
  static async getTemplates(options = {}) {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    if (options.includeBlocks) params.append('includeBlocks', 'true');
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await axios.get(`/templates?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Pobierz template po ID wraz z blokami
   * @param {number|string} id - ID templatu
   * @returns {Promise<Object>} Template z blokami
   */
  static async getTemplateById(id) {
    const response = await axios.get(`/templates/${id}`);
    return response.data.data;
  }

  /**
   * Utworz nowy template
   * @param {Object} templateData - Dane templatu
   * @param {string} templateData.name - Nazwa templatu
   * @param {string} templateData.description - Opis templatu
   * @param {string} templateData.category - Kategoria
   * @param {Array} templateData.tags - Tagi
   * @param {Array} templateData.blocks - Bloki templatu
   * @returns {Promise<Object>} Utworzony template
   */
  static async createTemplate(templateData) {
    const payload = {
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      tags: templateData.tags || [],
      thumbnail: templateData.thumbnail,
      blocks: templateData.blocks || [],
      metadata: templateData.metadata
    };

    const response = await axios.post('/templates', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Aktualizuj istniejący template
   * @param {number|string} id - ID templatu
   * @param {Object} templateData - Nowe dane templatu
   * @returns {Promise<Object>} Zaktualizowany template
   */
  static async updateTemplate(id, templateData) {
    const payload = {
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      tags: templateData.tags || [],
      thumbnail: templateData.thumbnail,
      blocks: templateData.blocks || [],
      metadata: templateData.metadata
    };

    const response = await axios.put(`/templates/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Usuń template
   * @param {number|string} id - ID templatu
   * @returns {Promise<boolean>} Czy usunięto pomyślnie
   */
  static async deleteTemplate(id) {
    const response = await axios.delete(`/templates/${id}`);
    return response.data.success;
  }

  /**
   * Duplikuj template
   * @param {number|string} id - ID templatu do duplikacji
   * @param {string} newName - Nowa nazwa dla kopii
   * @returns {Promise<Object>} Zduplikowany template
   */
  static async duplicateTemplate(id, newName) {
    const response = await axios.post(`/templates/${id}/duplicate`, {
      name: newName
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Zwiększ licznik użycia templatu
   * @param {number|string} id - ID templatu
   * @returns {Promise<void>}
   */
  static async incrementUsage(id) {
    await axios.post(`/templates/${id}/usage`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Pobierz kategorie templat
   * @returns {Promise<Array>} Lista kategorii
   */
  static async getCategories() {
    const response = await axios.get('/templates/categories');
    return response.data.data;
  }

  /**
   * Pobierz popularne templaty
   * @param {number} limit - Limit wyników
   * @returns {Promise<Array>} Lista popularnych templat
   */
  static async getPopularTemplates(limit = 10) {
    const response = await axios.get(`/templates/popular?limit=${limit}`);
    return response.data.data;
  }

  /**
   * Wyszukaj templaty
   * @param {string} query - Zapytanie wyszukiwania
   * @param {Object} filters - Dodatkowe filtry
   * @returns {Promise<Array>} Wyniki wyszukiwania
   */
  static async searchTemplates(query, filters = {}) {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters.category) params.append('category', filters.category);
    if (filters.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters.author) params.append('author', filters.author);

    const response = await axios.get(`/templates/search?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Generuj thumbnail dla templatu na podstawie bloków
   * @param {Array} blocks - Bloki templatu
   * @returns {Promise<string>} Base64 SVG thumbnail
   */
  static async generateThumbnail(blocks) {
    const response = await axios.post('/templates/generate-thumbnail', {
      blocks: blocks
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.thumbnail;
  }

  /**
   * Eksportuj template do JSON
   * @param {number|string} id - ID templatu
   * @returns {Promise<Object>} Template w formacie JSON
   */
  static async exportTemplate(id) {
    const response = await axios.get(`/templates/${id}/export`);
    return response.data.template;
  }

  /**
   * Importuj template z JSON
   * @param {Object} templateJson - Template w formacie JSON
   * @returns {Promise<Object>} Zaimportowany template
   */
  static async importTemplate(templateJson) {
    const response = await axios.post('/templates/import', templateJson, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  }

  /**
   * Pobierz statystyki templat
   * @returns {Promise<Object>} Statystyki użycia
   */
  static async getStatistics() {
    const response = await axios.get('/templates/statistics');
    return response.data.data;
  }

  /**
   * Waliduj template przed zapisem
   * @param {Object} templateData - Dane templatu do walidacji
   * @returns {Promise<Object>} Wynik walidacji
   */
  static async validateTemplate(templateData) {
    const response = await axios.post('/templates/validate', templateData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  /**
   * Konwertuj bloki templatu na HTML
   * @param {Array} blocks - Bloki templatu
   * @param {Object} options - Opcje konwersji (desktop/mobile)
   * @returns {Promise<string>} Wygenerowany HTML
   */
  static async blocksToHtml(blocks, options = {}) {
    const response = await axios.post('/templates/blocks-to-html', {
      blocks: blocks,
      mode: options.mode || 'desktop',
      containerWidth: options.containerWidth || '600px'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.html;
  }

  /**
   * Pobierz template z cache (dla częstych operacji)
   * @param {number|string} id - ID templatu
   * @returns {Promise<Object>} Template z cache lub bazy
   */
  static async getTemplateFromCache(id) {
    try {
      // Sprawdź localStorage cache
      const cacheKey = `template_${id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - timestamp;
        
        // Cache ważny przez 5 minut
        if (cacheAge < 5 * 60 * 1000) {
          return data;
        }
      }
      
      // Pobierz z API
      const template = await this.getTemplateById(id);
      
      // Zapisz do cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: template,
        timestamp: Date.now()
      }));
      
      return template;
    } catch (error) {
      // Fallback do normalnego pobierania
      return this.getTemplateById(id);
    }
  }

  /**
   * Wyczyść cache templat
   */
  static clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('template_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Konwertuj template z starego formatu (JSON pliki) do nowego formatu API
   * @param {Object} legacyTemplate - Template w starym formacie
   * @returns {Object} Template w nowym formacie
   */
  static convertLegacyTemplate(legacyTemplate) {
    return {
      name: legacyTemplate.name,
      description: legacyTemplate.description,
      category: legacyTemplate.category,
      tags: legacyTemplate.tags || [],
      thumbnail: legacyTemplate.thumbnail,
      author: legacyTemplate.author || 'System',
      version: legacyTemplate.version || '1.0',
      blocks: (legacyTemplate.blocks || []).map((block, index) => ({
        blockType: block.type,
        blockOrder: index,
        content: block.content,
        style: block.style,
        metadata: block.metadata || null
      })),
      metadata: legacyTemplate.metadata || {
        createdAt: legacyTemplate.metadata?.createdAt || new Date().toISOString(),
        version: legacyTemplate.metadata?.version || '1.0',
        author: legacyTemplate.metadata?.author || 'System'
      }
    };
  }
}