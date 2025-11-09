

import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";

const MarketingCampanies = sequelize.define('marketing_campanies', {
  id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    customerId:{
        type: DataTypes.INTEGER,
        field:"customer_id",
        allowNull: false,
    }  ,    
  name:{
    type: DataTypes.STRING,
    allowNull: false,
    field: "name"
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "subject"
  },
  description:{
    type: DataTypes.TEXT,
    allowNull: true,
    field: "description"
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "sender_name"
  },
  senderEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "sender_email"
  },
  textContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "text_content"
  },
  htmlContent:{
    type: DataTypes.TEXT("medium"),
    field: "html_content",
    allowNull: true
  },
    dateStart:{
      type: DataTypes.DATE,
      field: "date_start"
    },
    dateEnd:{
        type: DataTypes.DATE,
        field:"date_end"
    },
    process:{
        type:DataTypes.INTEGER,
        field:"progress"
    },
    active:{
          type:DataTypes.BOOLEAN,
          field:"active"
      },
    scoring: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "scoring"
    },
    suggestions: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "suggestions",
      get() {
        try {
          const value = this.getDataValue('suggestions');
          return value ? JSON.parse(value) : [];
        } catch (error) {
          console.error("Error parsing suggestions JSON:", error);
          return [];
        }
      },
      set(value) {
        this.setDataValue('suggestions', JSON.stringify(value));
      }
    },
    databaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "database_id"
    },
    sent:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "sent"
    }
    ,
    // --- Ustawienia sprawdzania skrzynki pod odpowiedzi ---
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
    }
  }, {
    tableName: 'marketing_campanies',
    timestamps: false,
  });

  MarketingCampanies.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "customerId",
    targetKey: "id"
  })

  export default MarketingCampanies