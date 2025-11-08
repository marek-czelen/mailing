import { DataTypes } from "sequelize";
import sequelize from "../include/db.js";
import Customers from "./customers.model.js";
import MarketingCampanies from "./marketingCampanies.model.js";

const Databases = sequelize.define('customer_databases', {
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
        // MySQL/MariaDB nie wspiera ARRAY; używamy JSON zgodnie ze schematem bazy
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get() {
            try {
                const value = this.getDataValue('tags');
                return value ? JSON.parse(value) : [];
            } catch (error) {
                console.error("Error parsing tags JSON:", error);
                return [];
            }
        },
        set(value) {
            this.setDataValue('tags', JSON.stringify(value));
        }         
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
    tableName: 'customer_databases',
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
