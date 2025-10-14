import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

const Customers = sequelize.define('customers', {
    id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    name:{
        type: DataTypes.STRING,
        field: "name"
    },
    active:{
      type: DataTypes.BOOLEAN,
      field: "active"
  }
  }, {
    tableName: 'customers',
    timestamps: false,
  });

  export default Customers