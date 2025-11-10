
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import Customers from '../models/customers.model.js';
import Mail from '../include/mail.js';
import { Op } from 'sequelize';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import EnvironmentConfig from '../config/environment.config.js';

// Interwał na podstawie zmiennej środowiskowej
let interval = EnvironmentConfig.get('MAILING_TASK_INTERVAL', 60000); // domyślnie 1 minuta

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
            const activeCampaigns = await MarketingCampanies.findAll({
                where: {
                    active: true,
                    sent: false,
                    dateStart: {
                        [Op.lte]: new Date()
                    },
                },
                include: [{ model: Customers, as: 'Customer' }]
            });

            console.log(`Znaleziono ${activeCampaigns.length} aktywnych kampanii`);

            for (const campaign of activeCampaigns) {
                const customer = campaign.Customer || null;

                if (!customer) {
                    console.warn(`Kampania ${campaign.id} nie ma przypisanego klienta - pomijam`);
                    continue;
                }

                // Sprawdź konfigurację SMTP kampanii - jeśli brak, pomiń wysyłkę
                if (!campaign.smtpHost || !campaign.smtpPort || !campaign.smtpUser || !campaign.smtpPass) {
                    console.warn(`⚠️ Kampania ${campaign.id} "${campaign.name}": Brak konfiguracji SMTP - pomijam wysyłkę`);
                    continue;
                }

                // Pobierz listę adresów dla klienta
                const mailAddresses = await MailAddress.findAll({
                    where: {
                        active: 1,
                        customerId: campaign.customerId,
                        databaseId: campaign.databaseId,
                        unsubscribesDate: null
                    }
                });

                console.log(`Kampania ${campaign.name} (klient ${customer.id}): znaleziono ${mailAddresses.length} adresów do wysyłki`);

                // Konfiguracja SMTP z kampanii
                const smtpHost = campaign.smtpHost;
                const smtpPort = campaign.smtpPort;
                const smtpUser = campaign.smtpUser;
                const smtpPass = campaign.smtpPass;
                const smtpSecure = campaign.smtpSecure !== null ? campaign.smtpSecure : (smtpPort === 465);
                const smtpAllowSelfSigned = campaign.smtpAllowSelfSigned || false;
                const unsubscribeBase = customer.unsubscribeUrl || EnvironmentConfig.get('UNSUBSCRIBE_URL');
                
                // Konfiguracja TLS
                const ignoreTLS = !smtpSecure;
                const rejectUnauthorized = !smtpAllowSelfSigned; // Nie weryfikuj jeśli self-signed dozwolone

                console.log(`📤 [MailingTask] Kampania ${campaign.id}: SMTP ${smtpHost}:${smtpPort} user=${smtpUser} secure=${smtpSecure} allowSelfSigned=${smtpAllowSelfSigned}`);



                for (const address of mailAddresses) {
                    try {
                        Mail.sendEmail({
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
                            from: `${campaign.senderName}<${campaign.senderEmail}>`,
                            to: address.mailAddress,
                            subject: campaign.subject,
                            html: campaign.htmlContent,
                            campaignId: campaign.id,
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
                        })
                        .then((result) => {
                            if (!result.success) {
                                MarketingCampaniesMailingResult.upsert({
                                    marketingCampaniesId: campaign.id,
                                    mailAddressesId: address.id,
                                    error: true,
                                    errorMessage: result.error
                                });
                                return;
                            }else {
                                // Zaktualizuj status wysyłki w bazie danych
                                MarketingCampaniesMailingResult.upsert({
                                    marketingCampaniesId: campaign.id,
                                    mailAddressesId: address.id,
                                    isSend: true,
                                    sendDate: new Date(),
                                    messageId: result.messageId || null
                                }).catch(err => {
                                    console.error(`Błąd zapisu statusu wysyłki dla ${address.mailAddress}:`, err && err.message ? err.message : err);
                                });
                                if (EnvironmentConfig.isDevelopment()) {
                                    console.log(`✉️ [MailingTask] Wysłano: campaignId=${campaign.id} mailAddressId=${address.id} messageId=${result.messageId}`);
                                }
                            }
                        });

                        // Opóźnienie między wysyłkami na podstawie zmiennej środowiskowej
                        const sendDelay = EnvironmentConfig.get('MAILING_SEND_DELAY', 100);
                        await new Promise(resolve => setTimeout(resolve, sendDelay));
                    } catch (error) {
                        console.error(`Błąd wysyłki na adres ${address.mailAddress}:`, error && error.message ? error.message : error);
                        continue;
                    }
                }
                campaign.sent = true;
                await campaign.save();
                console.log(`Kampania ${campaign.name} (klient ${customer.id}): wysyłka zakończona`);

            }
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