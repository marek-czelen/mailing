import React, { useState, useEffect } from 'react';
import { 
  type TReaderDocument, 
  renderToStaticMarkup,
  Reader 
} from '@usewaypoint/email-builder';
import SampleEditor from './editor/SampleEditor';
import { resetDocument, useDocument } from './editor/EditorContext';
import './EmailTemplateBuilder.css';

interface EmailTemplateBuilderProps {
  initialTemplate?: TReaderDocument;
  onSave?: (template: TReaderDocument, html: string) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

// Przykładowy pusty szablon
const defaultTemplate: TReaderDocument = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F8F8F8',
      canvasColor: '#FFFFFF',
      textColor: '#242424',
      fontFamily: 'MODERN_SANS',
      childrenIds: ['welcome-text'],
    },
  },
  'welcome-text': {
    type: 'Text',
    data: {
      style: {
        fontWeight: 'normal',
        padding: {
          top: 32,
          bottom: 32,
          right: 24,
          left: 24,
        },
      },
      props: {
        text: 'Witaj w kreatorze szablonów email! Zacznij budować swój szablon.',
      },
    },
  },
};

const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({
  initialTemplate = defaultTemplate,
  onSave,
  onCancel,
  isReadOnly = false,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  // Ustawienie początkowego szablonu w edytorze
  useEffect(() => {
    if (initialTemplate) {
      resetDocument(initialTemplate);
    }
  }, [initialTemplate]);

  // Pobierz aktualny dokument z editora
  const template = useDocument();

  // Handler dla zapisywania szablonu
  const handleSave = async () => {
    if (!onSave || isSaving) return;

    setIsSaving(true);
    try {
      // Generuj HTML z szablonu
      const html = renderToStaticMarkup(template, { rootBlockId: 'root' });
      await onSave(template, html);
    } catch (error) {
      console.error('Błąd podczas zapisywania szablonu:', error);
      alert('Wystąpił błąd podczas zapisywania szablonu');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler dla eksportu HTML
  const handleExportHtml = () => {
    try {
      const html = renderToStaticMarkup(template, { rootBlockId: 'root' });
      
      // Utwórz i pobierz plik
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Błąd podczas eksportu HTML:', error);
      alert('Wystąpił błąd podczas eksportu HTML');
    }
  };

  // Handler dla eksportu JSON
  const handleExportJson = () => {
    try {
      const json = JSON.stringify(template, null, 2);
      
      // Utwórz i pobierz plik
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Błąd podczas eksportu JSON:', error);
      alert('Wystąpił błąd podczas eksportu JSON');
    }
  };

  if (isReadOnly) {
    return (
      <div className="email-template-builder">
        <div className="builder-toolbar">
          <div className="toolbar-left">
            <h2 className="builder-title">Podgląd szablonu</h2>
          </div>
          <div className="toolbar-right">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="toolbar-button secondary"
              >
                Zamknij
              </button>
            )}
          </div>
        </div>
        
        <div className="builder-content">
          <div className="preview-container">
            <div className="preview-wrapper">
              <Reader document={template} rootBlockId="root" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-template-builder">
      {/* Toolbar */}
      <div className="builder-toolbar">
        <div className="toolbar-left">
          <h2 className="builder-title">Kreator szablonu email</h2>
        </div>
        
        <div className="toolbar-right">
          <button
            type="button"
            onClick={handleExportHtml}
            className="toolbar-button"
          >
            Eksport HTML
          </button>
          
          <button
            type="button"
            onClick={handleExportJson}
            className="toolbar-button"
          >
            Eksport JSON
          </button>
          
          {onSave && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="toolbar-button primary"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          )}
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="toolbar-button secondary"
            >
              Anuluj
            </button>
          )}
        </div>
      </div>

      {/* Sample Editor */}
      <div className="builder-content">
        <SampleEditor />
      </div>
    </div>
  );
};

export default EmailTemplateBuilder;