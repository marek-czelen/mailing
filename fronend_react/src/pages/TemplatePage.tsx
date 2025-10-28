import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reader } from '@usewaypoint/email-builder';
import { useTemplate } from '../contexts/TemplateContext';
import type { EmailTemplate } from '../types/template';
import EmailTemplateBuilder from '../components/EmailTemplateBuilder';

const TemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    state, 
    loadTemplates, 
    deleteTemplate,
    duplicateTemplate,
    setCurrentTemplate 
  } = useTemplate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  
  // Załaduj szablony przy pierwszym renderowaniu
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Filtruj szablony według wyszukiwania
  const filteredTemplates = state.templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setViewMode('create');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCurrentTemplate(template);
    setViewMode('edit');
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setViewMode('preview');
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    const newName = prompt('Nazwa dla kopii szablonu:', `${template.name} (kopia)`);
    if (newName) {
      await duplicateTemplate(template.id, newName);
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (window.confirm(`Czy na pewno chcesz usunąć szablon "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  const handleSaveTemplate = () => {
    setViewMode('list');
    setSelectedTemplate(null);
    // Odśwież listę szablonów
    loadTemplates();
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTemplate(null);
    setCurrentTemplate(null);
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    const handleSave = async (template: any, html: string) => {
      console.log('Zapisywanie szablonu:', template, html);
      // Tu będzie integracja z API
      handleSaveTemplate();
    };

    return (
      <EmailTemplateBuilder
        initialTemplate={selectedTemplate?.template}
        onSave={handleSave}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === 'preview' && selectedTemplate) {
    return (
      <div className="template-preview-page">
        <div className="preview-header">
          <button onClick={handleBackToList} className="back-button">
            ← Powrót do listy
          </button>
          <h1>{selectedTemplate.name}</h1>
          <div className="preview-actions">
            <button onClick={() => handleEditTemplate(selectedTemplate)}>
              Edytuj
            </button>
          </div>
        </div>
        <div className="preview-content">
          <Reader document={selectedTemplate.template} rootBlockId="root" />
        </div>
      </div>
    );
  }

  return (
    <div className="template-page">
      <div className="template-page-header">
        <div className="template-page-title">
          <h1>Szablony Email</h1>
          <div className="template-actions">
            <button onClick={handleCreateNew} className="btn-primary">
              + Nowy szablon
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Dashboard
            </button>
          </div>
        </div>
        
        <div className="template-filters">
          <div className="template-search">
            <input
              type="text"
              placeholder="Szukaj szablonów..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="template-list-container">
        {state.loading ? (
          <div className="loading-spinner">
            <div>Ładowanie szablonów...</div>
          </div>
        ) : state.error ? (
          <div className="error-message">
            {state.error}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <h3>Brak wyników</h3>
                <p>Nie znaleziono szablonów pasujących do wyszukiwania: "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="btn-secondary">
                  Wyczyść wyszukiwanie
                </button>
              </>
            ) : (
              <>
                <h3>Brak szablonów</h3>
                <p>Nie masz jeszcze żadnych szablonów. Utwórz pierwszy szablon, aby rozpocząć!</p>
                <button onClick={handleCreateNew} className="btn-primary">
                  Utwórz pierwszy szablon
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="template-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-card-preview">
                  <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '333%', height: '333%' }}>
                    <Reader document={template.template} rootBlockId="root" />
                  </div>
                </div>
                
                <div className="template-card-content">
                  <h3 className="template-card-title">{template.name}</h3>
                  {template.description && (
                    <p className="template-card-description">{template.description}</p>
                  )}
                  
                  <div className="template-card-meta">
                    <span>Utworzony: {new Date(template.createdAt).toLocaleDateString()}</span>
                    <span>ID: {template.id.substring(0, 8)}</span>
                  </div>
                  
                  <div className="template-card-actions">
                    <button onClick={() => handlePreviewTemplate(template)}>
                      Podgląd
                    </button>
                    <button 
                      onClick={() => handleEditTemplate(template)}
                      className="primary"
                    >
                      Edytuj
                    </button>
                    <button onClick={() => handleDuplicateTemplate(template)}>
                      Duplikuj
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(template)}
                      className="danger"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePage;