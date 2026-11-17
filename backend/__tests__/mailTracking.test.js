import { describe, expect, jest, test } from '@jest/globals';
import Mail from '../src/include/mail.js';

describe('Mail.sendEmail tracking options', () => {
  test('uses the campaign Reply-To, fixed bounce envelope and open pixel', async () => {
    const sendMail = jest.fn().mockResolvedValue({
      messageId: '<message@example.test>',
      response: '250 accepted'
    });

    await Mail.sendEmail({
      smtp: {},
      transporter: { sendMail },
      from: 'Campaign Sender <sender@example.test>',
      to: 'recipient@example.test',
      subject: 'Test',
      html: '<p>Hello</p>',
      replyTo: 'reply@example.test',
      envelopeFrom: 'bounces@example.test',
      trackingPixelUrl: 'https://mail.example.test/mailing/open/token?x=1'
    });

    const options = sendMail.mock.calls[0][0];
    expect(options.replyTo).toBe('reply@example.test');
    expect(options.envelope).toEqual({
      from: 'bounces@example.test',
      to: ['recipient@example.test']
    });
    expect(options.html).toContain('<p>Hello</p>');
    expect(options.html).toContain('https://mail.example.test/mailing/open/token?x=1');
  });

  test('does not add optional tracking headers when tracking is disabled', async () => {
    const sendMail = jest.fn().mockResolvedValue({ response: '250 accepted' });

    await Mail.sendEmail({
      smtp: {},
      transporter: { sendMail },
      from: 'sender@example.test',
      to: 'recipient@example.test',
      subject: 'Test',
      html: '<p>Hello</p>'
    });

    const options = sendMail.mock.calls[0][0];
    expect(options.replyTo).toBeUndefined();
    expect(options.envelope).toBeUndefined();
    expect(options.html).toBe('<p>Hello</p>');
  });
});
