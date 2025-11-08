import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";


  const EmailTemplate = sequelize.define('EmailTemplate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Podstawowe informacje o template
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Inne',
      validate: {
        isIn: [['newsletter', 'promocja', 'powiadomienie', 'wydarzenia', 'transakcyjny', 'Inne']]
      }
    },
    
    // Metadane template
    thumbnail: {
      type: DataTypes.TEXT, // Base64 SVG lub URL do obrazka
      allowNull: true
    },
    tags: {
      type: DataTypes.TEXT("long"), // Tablica tagów ['newsletter', 'firmowy']
      allowNull: true,
      get() {
        try {
          const value = this.getDataValue('tags');
          return value ? JSON.parse(value) : [];
        } catch (error) {
          console.error("Error parsing tags JSON:", error);
          return [];
        }
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value));
      },
    },
    
    // Informacje o autorze i wersjonowaniu
    author: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'System'
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '1.0'
    },
    
    // Status template
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Czy template jest systemowy (nie można usunąć)'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Czy template jest dostępny dla wszystkich użytkowników'
    },
    
    // Multi-tenant support
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID klienta - null dla globalnych templateów'
    },
    
    // Statystyki użycia
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Ile razy template był użyty'
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Kiedy template był ostatnio użyty'
    },
    
    // Dodatkowe metadane
    metadata: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      comment: 'Dodatkowe informacje o template (rozmiar, kolory dominujące, etc.)',
      get() {
        try {
          const value = this.getDataValue('metadata');
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error("Error parsing metadata JSON:", error);
          return null;
        }
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value));
      }
    }
  }, {
    // Opcje modelu
    tableName: 'email_templates',
    timestamps: true, // Dodaje createdAt, updatedAt
    paranoid: true,   // Soft delete (deletedAt)
    
    // Indeksy
    indexes: [
      {
        name: 'idx_email_templates_category',
        fields: ['category']
      },
      {
        name: 'idx_email_templates_customer',
        fields: ['customerId']
      },
      {
        name: 'idx_email_templates_active',
        fields: ['isActive']
      },
      {
        name: 'idx_email_templates_public',
        fields: ['isPublic']
      },
      {
        name: 'idx_email_templates_usage',
        fields: ['usageCount', 'lastUsedAt']
      }
    ],
    
    // Scopes dla łatwego filtrowania
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      public: {
        where: {
          isPublic: true
        }
      },
      system: {
        where: {
          isSystem: true
        }
      },
      forCustomer: (customerId) => ({
        where: {
          [sequelize.Sequelize.Op.or]: [
            { customerId: customerId },
            { isPublic: true }
          ]
        }
      }),
      byCategory: (category) => ({
        where: {
          category: category
        }
      }),
      popular: {
        order: [['usageCount', 'DESC'], ['lastUsedAt', 'DESC']]
      }
    }
  });

  // Asocjacje są definiowane w models/index.js

  // Instance methods
  EmailTemplate.prototype.incrementUsage = function() {
    return this.increment('usageCount', { by: 1 })
      .then(() => {
        return this.update({ lastUsedAt: new Date() });
      });
  };

  EmailTemplate.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Ukryj wrażliwe dane
    delete values.deletedAt;
    
    return values;
  };

  // Class methods
  EmailTemplate.findActiveTemplates = function(customerId = null) {
    const whereClause = {
      isActive: true,
      [sequelize.Sequelize.Op.or]: [
        { isPublic: true }
      ]
    };

    if (customerId) {
      whereClause[sequelize.Sequelize.Op.or].push({ customerId: customerId });
    }

    return this.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.TemplateBlock,
        as: 'blocks',
        required: false
      }],
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']]
    });
  };

  EmailTemplate.findByIdWithBlocks = function(id, customerId = null) {
    const whereClause = { id: id };
    
    if (customerId) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { customerId: customerId },
        { isPublic: true }
      ];
    }

    return this.findOne({
      where: whereClause,
      include: [{
        model: sequelize.models.TemplateBlock,
        as: 'blocks',
        order: [['blockOrder', 'ASC']]
      }]
    });
  };

export default EmailTemplate;