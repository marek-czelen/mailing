import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";

const Databases = sequelize.define('databases', {
  id:{
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
  },
  name: {
        type: DataTypes.STRING,
        allowNull: false
  },
  description: {
        type: DataTypes.TEXT,
        allowNull: true
  },
  tags:{
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
  },
  rodo_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
 export_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

  customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Customers,
            key: 'id'
        }
  }
});

Databases.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "customer_id",
    targetKey: "id"
  })
  
export default Databases;
