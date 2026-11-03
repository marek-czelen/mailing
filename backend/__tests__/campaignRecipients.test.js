import { describe, expect, test } from '@jest/globals';
import { Op } from 'sequelize';
import { buildCampaignRecipientWhere } from '../src/services/campaignRecipients.js';

describe('buildCampaignRecipientWhere', () => {
  test('uses the same eligible-contact rules and includes selected tags', () => {
    const where = buildCampaignRecipientWhere({
      customerId: 7,
      databaseId: 12,
      recipientTags: [' newsletter ', 'vip', 'newsletter']
    });

    expect(where).toMatchObject({
      active: 1,
      customerId: 7,
      databaseId: 12,
      unsubscribesDate: null,
      deliveryStatus: { [Op.ne]: 'undeliverable' }
    });
    expect(where[Op.or]).toHaveLength(2);
  });

  test('leaves the tag filter empty when no tags are selected', () => {
    const where = buildCampaignRecipientWhere({
      customerId: 7,
      databaseId: 12,
      recipientTags: []
    });

    expect(where[Op.or]).toBeUndefined();
  });
});