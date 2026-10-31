import MailAddressHistory from '../models/mailAddressHistory.model.js';

function serializeValue(value) {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    return typeof value === 'string' ? value : String(value);
}

export async function recordMailAddressHistory({
    mailAddressId,
    customerId,
    campaignId = null,
    replyId = null,
    action,
    changes,
    changedBy = null,
    transaction
}) {
    const records = changes
        .filter(change => serializeValue(change.oldValue) !== serializeValue(change.newValue))
        .map(change => ({
            mailAddressId,
            customerId,
            campaignId,
            replyId,
            action,
            fieldName: change.fieldName,
            oldValue: serializeValue(change.oldValue),
            newValue: serializeValue(change.newValue),
            changedBy
        }));

    if (!records.length) return [];
    return MailAddressHistory.bulkCreate(records, { transaction });
}