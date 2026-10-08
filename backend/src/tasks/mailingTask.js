
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import Customers from '../models/customers.model.js';
import Mail from '../include/mail.js';
import Sequelize, { Op } from 'sequelize';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import EnvironmentConfig from '../config/environment.config.js';
import { randomUUID } from 'node:crypto';

// Interwał na podstawie zmiennej środowiskowej
let interval = EnvironmentConfig.get('MAILING_TASK_INTERVAL', 600000); // domyślnie 10 minut

const logCampaignEvent = (event, data) => {
    console.log(`[CAMPAIGN_EVENT] ${JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...data
    })}`);
};

/**
 * Pobiera i wysyła maile dla aktywnych kampanii, używając konfiguracji SMTP przypisanej do klienta
 */
class MailingTask {
    static async sendMails() {
        try {
            if (EnvironmentConfig.isDevelopment()) {
                console.log('📧 Rozpoczęcie wysyłania maili:', new Date().toISOString());
            }

            // Pobierz aktywne kampanie razem z danymi klienta
            const activeCampaign = await MarketingCampanies.findOne({
                where: {
                    active: true,
                    sent: false,
                    sendingInProgress: false,
                    dateStart: {
                        [Op.lte]: new Date()
                    },
                },
                include: [{ model: Customers, as: 'Customer' }],
            });

            console.log(`Znaleziono ${activeCampaign ? 1 : 0} aktywną kampanię`);
            if (!activeCampaign) {
                console.log('Brak aktywnych kampanii do wysłania. Kończę zadanie.');
                return;
            }

            const customer = activeCampaign.Customer || null;

            if (!customer) {
                console.warn(`Kampania ${activeCampaign.id} nie ma przypisanego klienta - pomijam`);
                return;
            }

            // Sprawdź konfigurację SMTP kampanii - jeśli brak, pomiń wysyłkę
            if (!activeCampaign.smtpHost || !activeCampaign.smtpPort || !activeCampaign.smtpUser || !activeCampaign.smtpPass) {
                console.warn(`⚠️ Kampania ${activeCampaign.id} "${activeCampaign.name}": Brak konfiguracji SMTP - pomijam wysyłkę`);
                return;
            }

            await activeCampaign.update({ sendingInProgress: true });

            // Pobierz listę adresów dla klienta
            const recipientWhere = {
                active: 1,
                customerId: activeCampaign.customerId,
                databaseId: activeCampaign.databaseId,
                unsubscribesDate: null
            };
            const recipientTags = Array.isArray(activeCampaign.recipientTags)
                ? activeCampaign.recipientTags
                : [];
            if (recipientTags.length > 0) {
                recipientWhere[Op.or] = recipientTags.map(tag =>
                    Sequelize.where(
                        Sequelize.fn('JSON_CONTAINS', Sequelize.col('tags'), JSON.stringify(tag)),
                        1
                    )
                );
            }

            const mailAddresses = await MailAddress.findAll({ where: recipientWhere });

            console.log(`Kampania ${activeCampaign.name} (klient ${customer.id}): znaleziono ${mailAddresses.length} adresów do wysyłki`);
            const campaignRunId = randomUUID();
            let submittedCount = 0;
            let failedCount = 0;
            logCampaignEvent('campaign_started', {
                campaign_id: String(activeCampaign.id),
                campaign_run_id: campaignRunId,
                campaign_name: activeCampaign.name,
                customer_id: String(customer.id),
                recipient_count: mailAddresses.length
            });

            // Konfiguracja SMTP z kampanii
            const smtpHost = activeCampaign.smtpHost;
            const smtpPort = activeCampaign.smtpPort;
            const smtpUser = activeCampaign.smtpUser;
            const smtpPass = activeCampaign.smtpPass;
            const smtpSecure = activeCampaign.smtpSecure !== null ? activeCampaign.smtpSecure : (smtpPort === 465);
            const smtpAllowSelfSigned = activeCampaign.smtpAllowSelfSigned || false;
            const unsubscribeBase = customer.unsubscribeUrl || EnvironmentConfig.get('UNSUBSCRIBE_URL');

            // Konfiguracja TLS
            const ignoreTLS = !smtpSecure;
            const rejectUnauthorized = !smtpAllowSelfSigned; // Nie weryfikuj jeśli self-signed dozwolone

            console.log(`📤 [MailingTask] Kampania ${activeCampaign.id}: SMTP ${smtpHost}:${smtpPort} user=${smtpUser} secure=${smtpSecure} allowSelfSigned=${smtpAllowSelfSigned}`);

            for (const address of mailAddresses) {
                try {
                    const result = await Mail.sendEmail({
                        smtp: {
                            host: smtpHost,
                            port: smtpPort,
                            secure: smtpSecure,
                            ignoreTLS: ignoreTLS,
                            tls: {
                                rejectUnauthorized: rejectUnauthorized
                            },
                            auth: { user: smtpUser, pass: smtpPass }
                        },
                        from: `${activeCampaign.senderName}<${activeCampaign.senderEmail}>`,
                        to: address.mailAddress,
                            subject: activeCampaign.subject,
                            html: activeCampaign.htmlContent,
                            campaignId: activeCampaign.id,
                            mailAddressId: address.id,
                            placeholders: {
                                UNSUBSCRIBE_URL: `${unsubscribeBase}/${address.hash}`,
                                UNSUBSCRIBE_LINK: `${unsubscribeBase}/${address.hash}`,
                                ENVIRONMENT: EnvironmentConfig.get('NODE_ENV'),
                                APP_NAME: EnvironmentConfig.get('APP_NAME'),
                                BASE_URL: EnvironmentConfig.get('BASE_URL'),
                                CONTACT_HASH: address.hash,
                                CONTACT_EMAIL: address.mailAddress,
                            }
                    });

                    if (!result.success) {
                        failedCount++;
                        logCampaignEvent('smtp_submission_failed', {
                            campaign_id: String(activeCampaign.id),
                            campaign_run_id: campaignRunId,
                            campaign_name: activeCampaign.name,
                            contact_id: String(address.id),
                            recipient: address.mailAddress,
                            error: result.error || 'Nieznany błąd SMTP'
                        });
                        await MarketingCampaniesMailingResult.upsert({
                            marketingCampaniesId: activeCampaign.id,
                            mailAddressesId: address.id,
                            error: true,
                            errorMessage: result.error
                        });
                    } else {
                        submittedCount++;
                        logCampaignEvent('smtp_submission_accepted', {
                            campaign_id: String(activeCampaign.id),
                            campaign_run_id: campaignRunId,
                            campaign_name: activeCampaign.name,
                            contact_id: String(address.id),
                            recipient: address.mailAddress,
                            message_id: result.messageId || '',
                            smtp_response: result.response || ''
                        });
                        await MarketingCampaniesMailingResult.upsert({
                            marketingCampaniesId: activeCampaign.id,
                            mailAddressesId: address.id,
                            isSend: true,
                            sendDate: new Date(),
                            messageId: result.messageId || null
                        }).catch(err => {
                            console.error(`Błąd zapisu statusu wysyłki dla ${address.mailAddress}:`, err && err.message ? err.message : err);
                        });
                        if (EnvironmentConfig.isDevelopment()) {
                            console.log(`✉️ [MailingTask] Wysłano: campaignId=${activeCampaign.id} mailAddressId=${address.id} messageId=${result.messageId}`);
                        }
                    }

                        // Opóźnienie między wysyłkami na podstawie zmiennej środowiskowej
                        const sendDelay = EnvironmentConfig.get('MAILING_SEND_DELAY', 100);
                        await new Promise(resolve => setTimeout(resolve, sendDelay));
                    } catch (error) {
                        console.error(`Błąd wysyłki na adres ${address.mailAddress}:`, error && error.message ? error.message : error);
                        failedCount++;
                        logCampaignEvent('smtp_submission_failed', {
                            campaign_id: String(activeCampaign.id),
                            campaign_run_id: campaignRunId,
                            campaign_name: activeCampaign.name,
                            contact_id: String(address.id),
                            recipient: address.mailAddress,
                            error: error && error.message ? error.message : String(error)
                        });
                        continue;
                    }
            }
            logCampaignEvent('campaign_finished', {
                campaign_id: String(activeCampaign.id),
                campaign_run_id: campaignRunId,
                campaign_name: activeCampaign.name,
                customer_id: String(customer.id),
                recipient_count: mailAddresses.length,
                submitted_count: submittedCount,
                failed_count: failedCount
            });
            activeCampaign.sent = true;
            await activeCampaign.save();
            console.log(`Kampania ${activeCampaign.name} (klient ${customer.id}): wysyłka zakończona`);
        } catch (error) {
            console.error('Błąd podczas wysyłania maili:', error && error.message ? error.message : error);
        }
    }

    /**
     * Uruchamia zadanie cykliczne wysyłania maili
     */
    static run() {
        console.log(`📧 MailingTask uruchomiony - środowisko: ${EnvironmentConfig.get('NODE_ENV')}`);
        console.log(`⏰ Interwał wysyłania: ${interval}ms`);
        
        // Pierwsza wysyłka od razu
        MailingTask.sendMails();
        
        // Następne w określonym interwale
        setInterval(MailingTask.sendMails, interval);
    }
}

export default MailingTask;