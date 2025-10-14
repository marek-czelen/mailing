import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";

const PermissionObjects = sequelize.define('permission_objects', {
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
    tableName: 'permission_objects',
    timestamps: false,
  });


  export default PermissionObjects