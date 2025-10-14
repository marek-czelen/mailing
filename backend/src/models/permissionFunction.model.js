import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

const PermissionFunction = sequelize.define('permission_function', {
  id:{
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        field: "id"
    },
    name:{
        type: DataTypes.STRING,
        field: "name"
    }, 
  }, {
    tableName: 'permission_function',
    timestamps: false,
  });


  export default PermissionFunction