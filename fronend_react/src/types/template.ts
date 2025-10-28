import type { TReaderDocument } from '@usewaypoint/email-builder';

// Typy dla szablonów email
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  template: TReaderDocument;
  html: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  template: TReaderDocument;
  html: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  template?: TReaderDocument;
  html?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface TemplateListResponse {
  templates: EmailTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface TemplateFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  isPublic?: boolean;
}