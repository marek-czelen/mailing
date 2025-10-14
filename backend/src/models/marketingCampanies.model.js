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
    mailContent:{
        type: DataTypes.TEXT("medium"),
        field: "mail_content",
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