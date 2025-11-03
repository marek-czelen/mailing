import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";
import MarketingCampanies from "./marketingCampanies.model.js";

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
        field: "customer_id",
        references: {
            model: Customers,
            key: 'id'
        }
  },
  deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
  },
  createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
            field: 'created_at'
},
updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
}
}, {
    tableName: 'databases',
    timestamps: true,
});

Databases.belongsToMany(MarketingCampanies, {
    through: 'campaign_database_link',
    as: 'MarketingCampanies',
    foreignKey: 'database_id',
    otherKey: 'campaign_id'
});

Databases.belongsTo(Customers, {
    as: "Customer",
    foreignKey: "customer_id",
    targetKey: "id"
});

export default Databases;
