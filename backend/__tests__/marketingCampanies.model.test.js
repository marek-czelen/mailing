import { describe, expect, test } from '@jest/globals';
import MarketingCampanies from '../src/models/marketingCampanies.model.js';

describe('marketing campaign recipient tags', () => {
  test('parses JSON text returned by MySQL as an array', () => {
    const campaign = MarketingCampanies.build();
    campaign.setDataValue('recipientTags', '["newsletter"]');

    expect(campaign.recipientTags).toEqual(['newsletter']);
  });

  test('keeps array values as arrays', () => {
    const campaign = MarketingCampanies.build({ recipientTags: ['vip'] });

    expect(campaign.recipientTags).toEqual(['vip']);
  });
});