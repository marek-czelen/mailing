import { Response } from '../include/response.js';
import Mail from '../include/mail.js';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import Customers from '../models/customers.model.js';

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
    const result = await Mail.sendEmail(req.body);

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