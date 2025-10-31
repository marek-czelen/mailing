'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabela dla template'ów email
    await queryInterface.createTable('email_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      // Podstawowe informacje
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Inne'
      },
      
      // Metadane
      thumbnail: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      
      // Autor i wersja
      author: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: 'System'
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '1.0'
      },
      
      // Status
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      
      // Multi-tenant
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      
      // Statystyki
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Dodatkowe metadane
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      
      // Timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Indeksy dla email_templates
    await queryInterface.addIndex('email_templates', ['category'], {
      name: 'idx_email_templates_category'
    });
    
    await queryInterface.addIndex('email_templates', ['customerId'], {
      name: 'idx_email_templates_customer'
    });
    
    await queryInterface.addIndex('email_templates', ['isActive'], {
      name: 'idx_email_templates_active'
    });
    
    await queryInterface.addIndex('email_templates', ['isPublic'], {
      name: 'idx_email_templates_public'
    });
    
    await queryInterface.addIndex('email_templates', ['usageCount', 'lastUsedAt'], {
      name: 'idx_email_templates_usage'
    });

    await queryInterface.addIndex('email_templates', ['deletedAt'], {
      name: 'idx_email_templates_deleted'
    });
  },

  async down(queryInterface, Sequelize) {
    // Usuń indeksy
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_category');
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_customer');
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_active');
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_public');
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_usage');
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_deleted');
    
    // Usuń tabelę
    await queryInterface.dropTable('email_templates');
  }
};