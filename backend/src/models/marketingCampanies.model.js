

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
  from: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "from"
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
      type: DataTypes.JSON,
      allowNull: true,
      field: "suggestions"
    },
    databaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "database_id"
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