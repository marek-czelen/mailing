import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import MarketingCampanies from "./marketingCampanies.model.js";
import MailAddress from "./mailAddress.model.js";

const MarketingCampaniesMailing = sequelize.define('marketing_campanies_mailing', {
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
    }  ,    
    responseAddress:{
        type: DataTypes.STRING,
        allowNull: true,
        field: "response_address"
    },
    isReaded:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: "is_readed"
    },
    responsData:{
        type: DataTypes.DATE,
        field:"respons_data"
    },
    isSend:{
        type:DataTypes.BOOLEAN,
        field:"is_send"
    },
    sendData:{
        type:DataTypes.DATE,
        field:"send_data"
    },
  }, 
  {
    tableName: 'marketing_campanies_mailing',
    timestamps: false,
  });

  MarketingCampaniesMailing.belongsTo(MarketingCampanies,{
    as: "MarketingCampanies",
    foreignKey: "marketingCampaniesId",
    targetKey: "id"
  })

  MarketingCampaniesMailing.belongsTo(MailAddress,{
    as: "MailAddress",
    foreignKey: "mailAddressesId",
    targetKey: "id"
  })


  export default MarketingCampaniesMailing