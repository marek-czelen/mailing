import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";

const User = sequelize.define('User', {
  email: {
    primaryKey: true,
    type: DataTypes.STRING(255),
    field: "email"
  },
  hash: {
    type: DataTypes.STRING,
    field: "hash"
  },
  customerId: {
    type: DataTypes.INTEGER,
    field: "customer_id"
  },
  name: {
    type: DataTypes.STRING(255),
    field: "name"
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: "active"
  },
  createdAt: {
    type: DataTypes.DATE,
    field: "created_at"
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: "last_login"
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: "updated_at"
  }
}, {
  tableName: 'users',
  timestamps: false,
});

User.belongsTo(Customers, {
  as: "Customer",
  foreignKey: "customerId",
  targetKey: "id"
});

export default User