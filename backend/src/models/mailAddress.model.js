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
    }  
  }, {
    tableName: 'mail_addresses',
    timestamps: false,
  });

  MailAddress.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "customerId",
    targetKey: "id"
  })

  export default MailAddress