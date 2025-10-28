import { apiClient } from './api';
import type { 
  EmailTemplate, 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  TemplateListResponse,
  TemplateFilters 
} from '../types/template';

export class TemplateService {
  // Pobieranie listy szablonów
  static async getTemplates(filters: TemplateFilters = {}): Promise<TemplateListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());

    const response = await apiClient.get(`/templates?${params.toString()}`);
    return response.data as TemplateListResponse;
  }

  // Pobieranie pojedynczego szablonu
  static async getTemplate(id: string): Promise<EmailTemplate> {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data as EmailTemplate;
  }

  // Tworzenie nowego szablonu
  static async createTemplate(templateData: CreateTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.post('/templates', templateData);
    return response.data as EmailTemplate;
  }

  // Aktualizacja szablonu
  static async updateTemplate(id: string, templateData: UpdateTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.put(`/templates/${id}`, templateData);
    return response.data as EmailTemplate;
  }

  // Usuwanie szablonu
  static async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/templates/${id}`);
  }

  // Duplikowanie szablonu
  static async duplicateTemplate(id: string, name?: string): Promise<EmailTemplate> {
    const response = await apiClient.post(`/templates/${id}/duplicate`, { name });
    return response.data as EmailTemplate;
  }

  // Pobieranie publicznych szablonów (bez autoryzacji)
  static async getPublicTemplates(filters: Omit<TemplateFilters, 'isPublic'> = {}): Promise<TemplateListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));

    const response = await apiClient.get(`/templates/public?${params.toString()}`);
    return response.data as TemplateListResponse;
  }
}