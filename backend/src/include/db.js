import { dbConfig } from '../config/db.config.js';
import EnvironmentConfig from '../config/environment.config.js';
import { Sequelize } from 'sequelize';

// Tworzenie instancji Sequelize z konfiguracją z zmiennych środowiskowych
export const sequelize = new Sequelize(
  dbConfig.database, 
  dbConfig.username, 
  dbConfig.password, 
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    // Dodatkowe opcje w zależności od środowiska
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: EnvironmentConfig.isProduction() ? 5 : 2
    },
    define: {
      freezeTableName: true,
      timestamps: false
    }
  }
);

export default sequelize;