import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";
import PermissionFunction from "./permissionFunction.model.js";
import PermissionObjects from "./permissionObjects.model.js";

const Permission = sequelize.define('permission', {
  id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: "id"
    },
    customerId:{
        type: DataTypes.INTEGER,
        field: "customer_id"
    },
    permissionObjectsId:{
      type: DataTypes.INTEGER,
      field: "permission_objects_id"
    } ,
    permissionFunctionId:{
        type: DataTypes.INTEGER,
        field:"permission_function_id"
    } ,
    accessLevel:{
        type: DataTypes.INTEGER,
        field:"access_level",
        allowNull: false
    }
  }, {
    tableName: 'permission',
    timestamps: false,
  });

  Permission.belongsTo(Customers,{
    as: "Customer",
    foreignKey: "customerId",
    targetKey: "id"
  })

  Permission.belongsTo(PermissionFunction,{
    as: "Function",
    foreignKey: "permissionFunctionId",
    targetKey: "id"
  })

  Permission.belongsTo(PermissionObjects,{
    as: "Object",
    foreignKey: "permissionObjectsId",
    targetKey: "id"
  })


  export default Permission