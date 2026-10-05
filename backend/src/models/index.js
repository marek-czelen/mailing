import sequelize from '../include/db.js';
import EmailTemplate from './EmailTemplate.js';
import TemplateBlock from './TemplateBlock.js';
import CampaignReply from './campaignReply.model.js';
import User from './user.model.js';
import Role from './role.model.js';
import UserRole from './userRole.model.js';
import PasswordResetToken from './passwordResetToken.model.js';

// Import innych modeli jeśli potrzebne
// import Customer from './customers.model.js';
// import Database from './databases.model.js';

// Inicjalizuj wszystkie modele
const models = {
  EmailTemplate,
  TemplateBlock,
  CampaignReply,
  User,
  Role,
  UserRole,
  PasswordResetToken,
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

// Asocjacje dla systemu ról użytkowników
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'userEmail',
  otherKey: 'roleId',
  as: 'Roles'
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId',
  otherKey: 'userEmail',
  as: 'Users'
});

// Eksportuj modele i sequelize
export {
  sequelize,
  EmailTemplate,
  TemplateBlock,
  CampaignReply,
  User,
  Role,
  UserRole,
  PasswordResetToken,
};

export default models;