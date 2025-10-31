import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

  const TemplateBlock = sequelize.define('TemplateBlock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Relacja do template
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'email_templates',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    
    // Podstawowe właściwości bloku
    blockType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['text', 'button', 'image', 'spacer', 'divider', 'html', 'social']]
      }
    },
    blockOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Kolejność bloku w template (0, 1, 2, ...)'
    },
    
    // Zawartość bloku (JSON ze wszystkimi właściwościami)
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: 'Zawartość bloku w formacie JSON (text, fontSize, color, etc.)'
    },
    
    // Style bloku (JSON z marginesami, wyrównaniem, etc.)
    style: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        marginTop: 0,
        marginBottom: 0,
        textAlign: 'left'
      },
      comment: 'Style bloku w formacie JSON (marginTop, marginBottom, textAlign, etc.)'
    },
    
    // Dodatkowe właściwości
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    
    // Metadane bloku
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dodatkowe metadane bloku (np. rozmiar wygenerowanego contentu)'
    }
  }, {
    // Opcje modelu
    tableName: 'template_blocks',
    timestamps: true, // createdAt, updatedAt
    
    // Indeksy
    indexes: [
      {
        name: 'idx_template_blocks_template',
        fields: ['templateId']
      },
      {
        name: 'idx_template_blocks_order',
        fields: ['templateId', 'blockOrder']
      },
      {
        name: 'idx_template_blocks_type',
        fields: ['blockType']
      },
      {
        name: 'idx_template_blocks_active',
        fields: ['isActive']
      }
    ],
    
    // Validation
    validate: {
      // Sprawdź czy content ma wymagane pola dla danego typu bloku
      contentValidation() {
        const requiredFields = {
          'text': ['text'],
          'button': ['text', 'url'],
          'image': ['src', 'alt'],
          'spacer': ['height'],
          'divider': [],
          'html': ['html'],
          'social': ['links']
        };

        const required = requiredFields[this.blockType] || [];
        const content = this.content || {};

        for (const field of required) {
          if (!content.hasOwnProperty(field)) {
            throw new Error(`Blok typu ${this.blockType} wymaga pola '${field}' w content`);
          }
        }
      }
    },
    
    // Scopes
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      byType: (blockType) => ({
        where: {
          blockType: blockType
        }
      }),
      forTemplate: (templateId) => ({
        where: {
          templateId: templateId
        },
        order: [['blockOrder', 'ASC']]
      })
    }
  });

  // Asocjacje są definiowane w models/index.js

  // Instance methods
  TemplateBlock.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Dodaj computed properties dla łatwiejszego użycia
    values.typeName = this.getTypeName();
    values.hasContent = this.hasValidContent();
    
    return values;
  };

  TemplateBlock.prototype.getTypeName = function() {
    const typeNames = {
      'text': 'Blok tekstowy',
      'button': 'Przycisk',
      'image': 'Obraz',
      'spacer': 'Odstęp',
      'divider': 'Linia podziału',
      'html': 'HTML',
      'social': 'Media społecznościowe'
    };
    return typeNames[this.blockType] || 'Nieznany typ';
  };

  TemplateBlock.prototype.hasValidContent = function() {
    const content = this.content || {};
    
    switch (this.blockType) {
      case 'text':
        return !!(content.text && content.text.length > 0);
      
      case 'button':
        return !!(content.text && content.url);
      
      case 'image':
        return !!(content.src && content.alt);
      
      case 'spacer':
        return !!(content.height && content.height > 0);
      
      case 'divider':
        return true; // Divider zawsze ma valid content
      
      case 'html':
        return !!(content.html && content.html.length > 0);
      
      case 'social':
        return !!(content.links && Array.isArray(content.links) && content.links.length > 0);
      
      default:
        return false;
    }
  };

  TemplateBlock.prototype.validateBlockContent = function() {
    const errors = [];
    const content = this.content || {};
    const style = this.style || {};

    // Validation dla różnych typów bloków
    switch (this.blockType) {
      case 'text':
        if (!content.text) errors.push('Tekst jest wymagany');
        if (content.fontSize && (content.fontSize < 8 || content.fontSize > 72)) {
          errors.push('Rozmiar czcionki musi być między 8 a 72px');
        }
        break;

      case 'button':
        if (!content.text) errors.push('Tekst przycisku jest wymagany');
        if (!content.url) errors.push('URL przycisku jest wymagany');
        if (content.url && !this.isValidUrl(content.url)) {
          errors.push('URL przycisku jest nieprawidłowy');
        }
        break;

      case 'image':
        if (!content.src) errors.push('Źródło obrazu jest wymagane');
        if (!content.alt) errors.push('Tekst alternatywny obrazu jest wymagany');
        if (content.width && content.width <= 0) errors.push('Szerokość obrazu musi być większa od 0');
        if (content.height && content.height <= 0) errors.push('Wysokość obrazu musi być większa od 0');
        break;

      case 'spacer':
        if (!content.height || content.height <= 0) {
          errors.push('Wysokość odstępu musi być większa od 0');
        }
        break;

      case 'html':
        if (!content.html) errors.push('Kod HTML jest wymagany');
        break;

      case 'social':
        if (!content.links || !Array.isArray(content.links)) {
          errors.push('Linki społecznościowe są wymagane');
        } else if (content.links.length === 0) {
          errors.push('Przynajmniej jeden link społecznościowy jest wymagany');
        }
        break;
    }

    // Validation stylów
    if (style.marginTop && (style.marginTop < 0 || style.marginTop > 100)) {
      errors.push('Margines górny musi być między 0 a 100px');
    }
    if (style.marginBottom && (style.marginBottom < 0 || style.marginBottom > 100)) {
      errors.push('Margines dolny musi być między 0 a 100px');
    }

    return errors;
  };

  TemplateBlock.prototype.isValidUrl = function(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Class methods
  TemplateBlock.createFromBlockData = function(templateId, blockData, order) {
    return this.create({
      templateId: templateId,
      blockType: blockData.type,
      blockOrder: order,
      content: blockData.content || {},
      style: blockData.style || {
        marginTop: 0,
        marginBottom: 0,
        textAlign: 'left'
      },
      metadata: blockData.metadata || null
    });
  };

  TemplateBlock.reorderBlocks = async function(templateId, blockOrderMap) {
    const transaction = await sequelize.transaction();
    
    try {
      const promises = Object.entries(blockOrderMap).map(([blockId, newOrder]) => {
        return this.update(
          { blockOrder: newOrder },
          { 
            where: { id: blockId, templateId: templateId },
            transaction: transaction
          }
        );
      });

      await Promise.all(promises);
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  TemplateBlock.getBlocksForTemplate = function(templateId) {
    return this.findAll({
      where: {
        templateId: templateId,
        isActive: true
      },
      order: [['blockOrder', 'ASC']]
    });
  };

export default TemplateBlock;