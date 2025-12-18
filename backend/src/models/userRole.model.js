import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import User from "./user.model.js";
import Role from "./role.model.js";

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "id"
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: "user_email"
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "role_id"
  },
  assignedAt: {
    type: DataTypes.DATE,
    field: "assigned_at"
  },
  assignedBy: {
    type: DataTypes.STRING(255),
    field: "assigned_by"
  }
}, {
  tableName: 'user_roles',
  timestamps: false,
});

// Definicje relacji
UserRole.belongsTo(User, {
  as: "User",
  foreignKey: "userEmail",
  targetKey: "email"
});

UserRole.belongsTo(Role, {
  as: "Role",
  foreignKey: "roleId",
  targetKey: "id"
});

export default UserRole;
