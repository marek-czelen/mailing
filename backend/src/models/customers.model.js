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
    rodoFooter: {
      type: DataTypes.STRING,
      field: "rodo_footer",
      allowNull: true
    },
    internalMailServer: {
      type: DataTypes.BOOLEAN,
      field: "use_internal_mail_server",
      allowNull: true
    },
    companyName:{
      type: DataTypes.STRING,
      field: "company_name"
    },
    companyAddressLine1:{
      type: DataTypes.STRING,
      field: "company_address_line_1"
    },
    companyAddressLine2:{
      type: DataTypes.STRING,
      field: "company_address_line_2"
    },
    companyAddressCity:{
      type: DataTypes.STRING,
      field: "company_address_city"
    },
    companyAddressPostalCode:{
      type: DataTypes.STRING,
      field: "company_address_postal_code"
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