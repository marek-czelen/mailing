import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import MarketingCampanies from "./marketingCampanies.model.js";
import MailAddress from "./mailAddress.model.js";

const MarketingCampaniesMailingResult = sequelize.define('marketing_campanies_mailing_result', {
    marketingCampaniesId:{
        primaryKey: true,
        autoIncrement: false,
        allowNull: false,
        type: DataTypes.INTEGER,
        field: "marketing_campanies_id"
    },
    mailAddressesId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: false,
        field:"mail_addresses_id",
    },
    isReaded:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: "is_readed"
    },
    responsDate:{
        type: DataTypes.DATE,
        field:"respons_date"
    },
    isSend:{
        type:DataTypes.BOOLEAN,
        field:"is_send"
    },
    sendDate:{
        type:DataTypes.DATE,
        field:"send_date"
    },
    messageId:{
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "message_id"
    },
    error:{
      type: DataTypes.BOOLEAN,
      field: "error",
      allowNull: true
    },
    errorMessage:{
      type: DataTypes.TEXT,
      field: "error_message",
      allowNull: true
    }
  }, 
  {
    tableName: 'marketing_campanies_mailing_result',
    timestamps: false,
  });

  MarketingCampaniesMailingResult.belongsTo(MarketingCampanies,{
    as: "MarketingCampanies",
    foreignKey: "marketingCampaniesId",
    targetKey: "id"
  })

  MarketingCampaniesMailingResult.belongsTo(MailAddress,{
    as: "MailAddress",
    foreignKey: "mailAddressesId",
    targetKey: "id"
  })


  export default MarketingCampaniesMailingResult