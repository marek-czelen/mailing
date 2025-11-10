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
    smtpSecure: {
      type: DataTypes.BOOLEAN,
      field: "smtp_secure",
      allowNull: true
    },
    smtpAllowSelfSigned: {
      type: DataTypes.BOOLEAN,
      field: "smtp_allow_self_signed",
      allowNull: true
    },
        replyCheckEnabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'reply_check_enabled'
        },
        replyMailboxHost: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'reply_mailbox_host'
        },
        replyMailboxPort: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 993,
          field: 'reply_mailbox_port'
        },
        replyMailboxUser: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'reply_mailbox_user'
        },
        replyMailboxPass: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'reply_mailbox_pass'
        },
        replyMailboxProtocol: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: 'IMAP',
          field: 'reply_mailbox_protocol'
        },
        replyMailboxFolder: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: 'INBOX',
          field: 'reply_mailbox_folder'
        },
        replyMailboxTls: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          field: 'reply_mailbox_tls'
        },
        replyMailboxAllowSelfSigned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'reply_mailbox_allow_self_signed'
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