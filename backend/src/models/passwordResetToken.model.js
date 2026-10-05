import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'user_email'
  },
  tokenHash: {
    type: DataTypes.CHAR(64),
    allowNull: false,
    field: 'token_hash'
  },
  expiresAt: {
    type: DataTypes.DATE(3),
    allowNull: false,
    field: 'expires_at'
  },
  usedAt: {
    type: DataTypes.DATE(3),
    allowNull: true,
    field: 'used_at'
  },
  createdAt: {
    type: DataTypes.DATE(3),
    allowNull: false,
    field: 'created_at'
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: false,
  freezeTableName: true
});

export default PasswordResetToken;