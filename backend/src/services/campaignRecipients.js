import Sequelize, { Op } from 'sequelize';

export function buildCampaignRecipientWhere({ customerId, databaseId, recipientTags }) {
    const where = {
        active: 1,
        deliveryStatus: { [Op.ne]: 'undeliverable' },
        customerId,
        databaseId,
        unsubscribesDate: null
    };
    const tags = Array.isArray(recipientTags)
        ? [...new Set(recipientTags.filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim().slice(0, 255)))]
        : [];

    if (tags.length > 0) {
        where[Op.or] = tags.map(tag =>
            Sequelize.where(
                Sequelize.fn('JSON_CONTAINS', Sequelize.col('tags'), JSON.stringify(tag)),
                1
            )
        );
    }

    return where;
}