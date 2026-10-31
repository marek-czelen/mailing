import { DataTypes } from 'sequelize';
import sequelize from '../include/db.js';

const MailAddressHistory = sequelize.define('mail_address_history', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    mailAddressId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'mail_address_id'
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'customer_id'
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'campaign_id'
    },
    replyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reply_id'
    },
    action: {
        type: DataTypes.STRING(32),
        allowNull: false,
        field: 'action'
    },
    fieldName: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'field_name'
    },
    oldValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'old_value'
    },
    newValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'new_value'
    },
    changedBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'changed_by'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'mail_address_history',
    timestamps: false
});

export default MailAddressHistory;