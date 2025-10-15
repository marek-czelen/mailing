import {dbConfig} from '../config/db.config.js';
import { Sequelize } from 'sequelize';

// Option 3: Passing parameters separately (other dialects)
export const sequelize = new Sequelize(dbConfig.Database, dbConfig.User, dbConfig.Password, {
  host: dbConfig.Host,
  dialect: 'mysql',
  logging: false
});

export default sequelize;