import { DataTypes } from 'sequelize';
import sequelize from '../include/db.js';
import MarketingCampanies from './marketingCampanies.model.js';
import MailAddress from './mailAddress.model.js';

/**
 * CampaignReply
 * --------------
 * Model przechowujący odpowiedzi (replies) na kampanie marketingowe.
 * Każda odpowiedź jest powiązana z kampanią i opcjonalnie z konkretnym adresem mailowym z bazy kontaktów.
 * Deduplikacja odbywa się po message_id lub reply_hash (SHA1 z message_id/uid).
 */
const CampaignReply = sequelize.define('campaign_replies', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'campaign_id'
    },
    mailAddressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'mail_address_id'
    },
    fromEmail: {
        type: DataTypes.STRING(320),
        allowNull: false,
        field: 'from_email'
    },
    subject: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'subject'
    },
    receivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'received_at'
    },
    messageId: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'message_id'
    },
    replyHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'reply_hash'
    },
    bodyPreview: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'body_preview'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'campaign_replies',
    timestamps: false
});

// Relacje
CampaignReply.belongsTo(MarketingCampanies, {
    as: 'Campaign',
    foreignKey: 'campaignId',
    targetKey: 'id'
});

CampaignReply.belongsTo(MailAddress, {
    as: 'MailAddress',
    foreignKey: 'mailAddressId',
    targetKey: 'id'
});

export default CampaignReply;
