import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import MailAddressAttributesDefinitions from "./mailAddressAttributesDefinitions.model"
import MailAddress from "./mailAddress.model.js";

const MailAddressAttributeValue = sequelize.define('mail_address_attribute_value', {
    AttributeDefinitionsId:{        
        primaryKey: true,
        autoIncrement: false,
        allowNull: false,
        type: DataTypes.INTEGER,
        field: "mail_address_attributes_definitions_id"
    },
    MailAddressesId:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement: false,
        field:"mail_addresses_id",
    }  ,    
    AttributesValue:{
        type: DataTypes.STRING,
        allowNull: true,
        field: "mail_address_attributes_value"
    }
  }, {
    tableName: 'mail_address_attribute_value',
    timestamps: false,
  });

  MailAddressAttributeValue.hasOne(MailAddressAttributesDefinitions,{
    as: "Attribute",
    sourceKey:"AttributeDefinitionsId",
    targetKey:"id"
  })

  MailAddressAttributeValue.hasOne(MailAddress,{
    as: "MailAddress",
    sourceKey: "MailAddressesId",
    targetKey: "id"
  })

  export default MailAddressAttributeValue