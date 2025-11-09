import sequelize from '../include/db.js';
import EmailTemplate from './EmailTemplate.js';
import TemplateBlock from './TemplateBlock.js';
import CampaignReply from './campaignReply.model.js';

// Import innych modeli jeśli potrzebne
// import Customer from './customers.model.js';
// import Database from './databases.model.js';

// Inicjalizuj wszystkie modele
const models = {
  EmailTemplate,
  TemplateBlock,
  CampaignReply,
  // Customer,
  // Database,
};

// Zdefiniuj asocjacje
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Ręczne definiowanie asocjacji dla pewności
EmailTemplate.hasMany(TemplateBlock, {
  foreignKey: 'templateId',
  as: 'blocks',
  onDelete: 'CASCADE'
});

TemplateBlock.belongsTo(EmailTemplate, {
  foreignKey: 'templateId',
  as: 'template',
  onDelete: 'CASCADE'
});

// Eksportuj modele i sequelize
export {
  sequelize,
  EmailTemplate,
  TemplateBlock,
  CampaignReply,
};

export default models;