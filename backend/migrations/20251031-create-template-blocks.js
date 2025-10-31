'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabela dla bloków template'ów
    await queryInterface.createTable('template_blocks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      // Relacja do template
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'email_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Właściwości bloku
      blockType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      blockOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      
      // Zawartość i style (JSON)
      content: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{}'
      },
      style: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{"marginTop": 0, "marginBottom": 0, "textAlign": "left"}'
      },
      
      // Status
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      
      // Metadane
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
      }
    });

    // Indeksy dla template_blocks
    await queryInterface.addIndex('template_blocks', ['templateId'], {
      name: 'idx_template_blocks_template'
    });
    
    await queryInterface.addIndex('template_blocks', ['templateId', 'blockOrder'], {
      name: 'idx_template_blocks_order'
    });
    
    await queryInterface.addIndex('template_blocks', ['blockType'], {
      name: 'idx_template_blocks_type'
    });
    
    await queryInterface.addIndex('template_blocks', ['isActive'], {
      name: 'idx_template_blocks_active'
    });

    // Constraint dla blockType
    await queryInterface.addConstraint('template_blocks', {
      fields: ['blockType'],
      type: 'check',
      name: 'chk_template_blocks_type',
      where: {
        blockType: {
          [Sequelize.Op.in]: ['text', 'button', 'image', 'spacer', 'divider', 'html', 'social']
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Usuń constraint
    await queryInterface.removeConstraint('template_blocks', 'chk_template_blocks_type');
    
    // Usuń indeksy
    await queryInterface.removeIndex('template_blocks', 'idx_template_blocks_template');
    await queryInterface.removeIndex('template_blocks', 'idx_template_blocks_order');
    await queryInterface.removeIndex('template_blocks', 'idx_template_blocks_type');
    await queryInterface.removeIndex('template_blocks', 'idx_template_blocks_active');
    
    // Usuń tabelę
    await queryInterface.dropTable('template_blocks');
  }
};