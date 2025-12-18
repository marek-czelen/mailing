import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "id"
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: "name"
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "display_name"
  },
  description: {
    type: DataTypes.TEXT,
    field: "description"
  },
  createdAt: {
    type: DataTypes.DATE,
    field: "created_at"
  }
}, {
  tableName: 'roles',
  timestamps: false,
});

export default Role;
