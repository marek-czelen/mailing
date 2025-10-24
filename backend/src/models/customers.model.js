import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

const Customers = sequelize.define('customers', {
    id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    name:{
        type: DataTypes.STRING,
        field: "name"
    },
    // Konfiguracja SMTP dla klienta (opcjonalne)
    smtpHost: {
      type: DataTypes.STRING,
      field: "smtp_host",
      allowNull: true
    },
    smtpPort: {
      type: DataTypes.INTEGER,
      field: "smtp_port",
      allowNull: true
    },
    smtpUser: {
      type: DataTypes.STRING,
      field: "smtp_user",
      allowNull: true
    },
    smtpPass: {
      type: DataTypes.STRING,
      field: "smtp_pass",
      allowNull: true
    },
    smtpFrom: {
      type: DataTypes.STRING,
      field: "smtp_from",
      allowNull: true
    },
    unsubscribeUrl: {
      type: DataTypes.STRING,
      field: "unsubscribe_url",
      allowNull: true
    },
    active:{
      type: DataTypes.BOOLEAN,
      field: "active"
  }
  }, {
    tableName: 'customers',
    timestamps: false,
  });

  export default Customers