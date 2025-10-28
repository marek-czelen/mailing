import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { EmailTemplate, CreateTemplateRequest, UpdateTemplateRequest, TemplateFilters } from '../types/template';
import { TemplateService } from '../services/templateService';

// State interface
interface TemplateState {
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
  loading: boolean;
  error: string | null;
  totalTemplates: number;
  currentPage: number;
  totalPages: number;
}

// Action types
type TemplateAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TEMPLATES'; payload: { templates: EmailTemplate[]; total: number; page: number; limit: number } }
  | { type: 'SET_CURRENT_TEMPLATE'; payload: EmailTemplate | null }
  | { type: 'ADD_TEMPLATE'; payload: EmailTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: EmailTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: TemplateState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  totalTemplates: 0,
  currentPage: 1,
  totalPages: 1,
};

// Reducer
const templateReducer = (state: TemplateState, action: TemplateAction): TemplateState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_TEMPLATES':
      const { templates, total, page, limit } = action.payload;
      return {
        ...state,
        templates,
        totalTemplates: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        loading: false,
        error: null,
      };
    
    case 'SET_CURRENT_TEMPLATE':
      return { ...state, currentTemplate: action.payload, loading: false, error: null };
    
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [action.payload, ...state.templates],
        totalTemplates: state.totalTemplates + 1,
        loading: false,
        error: null,
      };
    
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
        currentTemplate: state.currentTemplate?.id === action.payload.id 
          ? action.payload 
          : state.currentTemplate,
        loading: false,
        error: null,
      };
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload),
        currentTemplate: state.currentTemplate?.id === action.payload ? null : state.currentTemplate,
        totalTemplates: state.totalTemplates - 1,
        loading: false,
        error: null,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Context interface
interface TemplateContextType {
  state: TemplateState;
  loadTemplates: (filters?: TemplateFilters) => Promise<void>;
  loadTemplate: (id: string) => Promise<void>;
  createTemplate: (templateData: CreateTemplateRequest) => Promise<EmailTemplate | null>;
  updateTemplate: (id: string, templateData: UpdateTemplateRequest) => Promise<EmailTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  duplicateTemplate: (id: string, name?: string) => Promise<EmailTemplate | null>;
  setCurrentTemplate: (template: EmailTemplate | null) => void;
  clearError: () => void;
  resetState: () => void;
}

// Create context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Provider component
export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  const loadTemplates = useCallback(async (filters: TemplateFilters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await TemplateService.getTemplates({
        limit: 20,
        page: 1,
        ...filters,
      });
      dispatch({
        type: 'SET_TEMPLATES',
        payload: {
          templates: response.templates,
          total: response.total,
          page: response.page,
          limit: response.limit,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Błąd podczas ładowania szablonów',
      });
    }
  }, []);

  const loadTemplate = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const template = await TemplateService.getTemplate(id);
      dispatch({ type: 'SET_CURRENT_TEMPLATE', payload: template });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Błąd podczas ładowania szablonu',
      });
    }
  }, []);

  const createTemplate = useCallback(async (templateData: CreateTemplateRequest): Promise<EmailTemplate | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newTemplate = await TemplateService.createTemplate(templateData);
      dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
      return newTemplate;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Błąd podczas tworzenia szablonu',
      });
      return null;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, templateData: UpdateTemplateRequest): Promise<EmailTemplate | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedTemplate = await TemplateService.updateTemplate(id, templateData);
      dispatch({ type: 'UPDATE_TEMPLATE', payload: updatedTemplate });
      return updatedTemplate;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Błąd podczas aktualizacji szablonu',
      });
      return null;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await TemplateService.deleteTemplate(id);
      dispatch({ type: 'DELETE_TEMPLATE', payload: id });
      return true;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Błąd podczas usuwania szablonu',
      });
      return false;
    }
  }, []);

  const duplicateTemplate = useCallback(async (id: string, name?: string): Promise<EmailTemplate | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const duplicatedTemplate = await TemplateService.duplicateTemplate(id, name);
      dispatch({ type: 'ADD_TEMPLATE', payload: duplicatedTemplate });
      return duplicatedTemplate;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Błąd podczas duplikowania szablonu',
      });
      return null;
    }
  }, []);

  const setCurrentTemplate = useCallback((template: EmailTemplate | null) => {
    dispatch({ type: 'SET_CURRENT_TEMPLATE', payload: template });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  return (
    <TemplateContext.Provider
      value={{
        state,
        loadTemplates,
        loadTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        setCurrentTemplate,
        clearError,
        resetState,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

// Hook
export const useTemplate = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};