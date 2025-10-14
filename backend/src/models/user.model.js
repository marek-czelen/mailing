import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";

const User = sequelize.define('User', {
  email:{
        primaryKey: true,
        type: DataTypes.STRING,
        field: "email"
    },
    hash:{
        type: DataTypes.STRING,
        field: "hash"
    },
    customerId:{
      type: DataTypes.INTEGER,
      field: "customer_id"
    }    
  }, {
    tableName: 'users',
    timestamps: false,
  });

  User.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "customerId",
    targetKey: "id"
  })

  export default User