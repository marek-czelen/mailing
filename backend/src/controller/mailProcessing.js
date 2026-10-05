import { Response } from '../include/response.js';
import Mail from '../include/mail.js';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import Customers from '../models/customers.model.js';
import { Admin } from '../include/admin.js';
import EnvironmentConfig from '../config/environment.config.js';

/**
 * Endpoint: POST /mailing/sendEmail
 * Wysyła pojedynczy testowy email przy użyciu Mail.sendEmail.
 * Dodatkowe opcje wspierające mapowanie odpowiedzi:
 * - campaignId: ID kampanii (opcjonalne) → dodany nagłówek X-Campaign-ID
 * - mailAddressId: ID kontaktu/adresu (opcjonalne) → nagłówek X-Mail-Address-ID
 * Jeśli oba podane i istnieją rekordy w bazie:
 *   - Po sukcesie zapisuje (upsert) marketing_campanies_mailing_result z message_id.
 * Wymagane minimalne pola body:
 * {
 *   "smtp": {"host":..., "port":..., ...},
 *   "from": "Nadawca <nadawca@domena>",
 *   "to": "odbiorca@domena",
 *   "subject": "Temat",
 *   "html": "<p>Treść</p>"
 * }
 * Opcjonalnie: placeholders, attachments, headers, campaignId, mailAddressId
 */
export async function sendEmail(req, res) {
  try {
    const { campaignId, mailAddressId } = req.body;
    const sendOptions = { ...req.body };
    const hasUnsubscribePlaceholder = /\{\{UNSUBSCRIBE_(?:LINK|URL)\}\}/i.test(
      `${req.body.html || ''}\n${req.body.text || ''}`
    );

    if (hasUnsubscribePlaceholder) {
      if (!campaignId) {
        return res.status(400).send(new Response(null, false, 'Campaign ID is required to resolve the unsubscribe link.'));
      }

      const userData = await Admin.getCurrentUserData(req.headers.authorization);
      if (!userData) {
        return res.status(403).send(new Response(null, false, 'User not found.'));
      }

      const campaign = await MarketingCampanies.findOne({
        where: { id: campaignId, customerId: userData.customerId }
      });
      if (!campaign) {
        return res.status(404).send(new Response(null, false, 'Campaign not found.'));
      }

      const recipient = Array.isArray(req.body.to) ? req.body.to[0] : req.body.to;
      const mailAddress = await MailAddress.findOne({
        where: {
          mailAddress: String(recipient || '').trim(),
          customerId: campaign.customerId,
          databaseId: campaign.databaseId,
          active: 1,
          unsubscribesDate: null
        }
      });
      if (!mailAddress) {
        return res.status(400).send(new Response(null, false, 'Test recipient must be an active contact in the campaign database to use the unsubscribe link.'));
      }

      const unsubscribeBase = EnvironmentConfig.get('UNSUBSCRIBE_URL');
      if (!unsubscribeBase) {
        return res.status(500).send(new Response(null, false, 'UNSUBSCRIBE_URL is not configured.'));
      }

      const unsubscribeLink = `${unsubscribeBase.replace(/\/+$/, '')}/${mailAddress.hash}`;
      sendOptions.placeholders = {
        ...req.body.placeholders,
        UNSUBSCRIBE_LINK: unsubscribeLink,
        UNSUBSCRIBE_URL: unsubscribeLink,
        CONTACT_HASH: mailAddress.hash,
        CONTACT_EMAIL: mailAddress.mailAddress
      };
    }

    const result = await Mail.sendEmail(sendOptions);

    // Walidacja i zapis wyniku wysyłki jeśli mamy campaignId + mailAddressId
    if (campaignId && mailAddressId && result?.messageId) {
      try {
        const campaign = await MarketingCampanies.findByPk(campaignId);
        const mailAddress = await MailAddress.findByPk(mailAddressId);
        if (campaign && mailAddress) {
          await MarketingCampaniesMailingResult.upsert({
            marketingCampaniesId: campaign.id,
            mailAddressesId: mailAddress.id,
            isSend: true,
            sendDate: new Date(),
            messageId: result.messageId
          });
        }
      } catch (persistErr) {
        console.warn('[sendEmail] Upsert mailing result failed:', persistErr?.message || persistErr);
      }
    }

    res.send(new Response(result, true, "Email sent successfully."));
  } catch (error) {
    res.send(new Response(null, false, error.message));
  }
}