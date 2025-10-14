import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";

const MailAddressAttributesDefinitions = sequelize.define('mail_address_attributes_definitions', {
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
    attributeName:{
        type: DataTypes.STRING,
        allowNull: false,
        field: "attribute_name"
    }
  }, {
    tableName: 'mail_address_attributes_definitions',
    timestamps: false,
  });

  MailAddressAttributesDefinitions.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "CustomerId",
    targetKey: "id"
  })

  export default MailAddressAttributesDefinitions