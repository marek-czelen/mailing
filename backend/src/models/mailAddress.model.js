import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";

const MailAddress = sequelize.define('mail_addresses', {
  id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    hash:{
        type: DataTypes.STRING,
        allowNull: false,
        field: "hash"
    },
    mailAddress:{
        type: DataTypes.STRING,
        allowNull: false,
        field: "mail_address"
    },
    miasto:{
        type: DataTypes.STRING,
        field: "miasto"
    },
    rodzaj:{
        type: DataTypes.STRING,
        field: "rodzaj"
    },    
    nazwa2:{
        type: DataTypes.STRING,
        field: "nazwa_2"
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
            const value = this.getDataValue('tags');
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            return [];
        },
        set(value) {
            this.setDataValue('tags', Array.isArray(value) ? value : []);
        }
    },
    status:{
        type: DataTypes.STRING,
        field: "status"
    },
    phone:{
        type: DataTypes.STRING,
        field: "phone"
    },
    active:{
      type: DataTypes.INTEGER,
      field: "active"
    },
    customerId:{
        type: DataTypes.INTEGER,
        field:"customer_id",
        allowNull: false,
    }  ,
    unsubscribesDate:{
        type:DataTypes.DATE,
        field:"unsubscribes_date",
    },
    bounceDate:{
        type: DataTypes.DATE,
        field: "bounce_date"
    },
    bounceReason:{
        type: DataTypes.TEXT,
        field: "bounce_reason"
    },
    bounceCount:{
        type: DataTypes.INTEGER,
        field: "bounce_count",
        defaultValue: 0
    },
    deliveryStatus:{
        type: DataTypes.ENUM('unknown', 'undeliverable'),
        allowNull: false,
        defaultValue: 'unknown',
        field: "delivery_status"
    },
    databaseId:{
      type: DataTypes.INTEGER,
      field: "database_id",
      allowNull: false,
    }
  }, {
    tableName: 'mail_addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MailAddress.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "customerId",
    targetKey: "id"
  })

  export default MailAddress