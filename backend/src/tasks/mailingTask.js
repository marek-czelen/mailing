
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

                // Pobierz listę adresów dla klienta
                const mailAddresses = await MailAddress.findAll({
                    where: {
                        active: 1,
                        customerId: campaign.customerId,
                        unsubscribesDate: null
                    }
                });

                console.log(`Kampania ${campaign.name} (klient ${customer.id}): znaleziono ${mailAddresses.length} adresów do wysyłki`);

                // Konfiguracja SMTP klienta (fallback na zmienne środowiskowe)
                const smtpHost = customer.smtpHost || EnvironmentConfig.get('SMTP_HOST');
                const smtpPort = customer.smtpPort || EnvironmentConfig.get('SMTP_PORT');
                const smtpUser = customer.smtpUser || EnvironmentConfig.get('SMTP_USER');
                const smtpPass = customer.smtpPass || EnvironmentConfig.get('SMTP_PASS');
                const smtpFrom = customer.smtpFrom || EnvironmentConfig.get('SMTP_FROM');
                const unsubscribeBase = customer.unsubscribeUrl || EnvironmentConfig.get('UNSUBSCRIBE_URL');
                
                // Konfiguracja SSL/TLS na podstawie środowiska
                const smtpSecure = smtpPort === 465;
                const ignoreTLS = EnvironmentConfig.get('SMTP_IGNORE_TLS', false);
                const rejectUnauthorized = EnvironmentConfig.get('SMTP_REJECT_UNAUTHORIZED', true);

                if (!smtpHost || !smtpPort) {
                    console.warn(`Brak konfiguracji SMTP dla klienta ${customer.id} - pomijam wysyłkę kampanii ${campaign.id}`);
                    continue;
                }



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
                                auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
                            },
                            from: `${campaign.senderName}<${campaign.senderEmail}>`,
                            to: address.mailAddress,
                            subject: campaign.subject,
                            html: campaign.htmlContent,
                            placeholders: {
                                UNSUBSCRIBE_URL: `${unsubscribeBase}/${address.hash}`,
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
                                    sendData: new Date()
                                }).catch(err => {
                                    console.error(`Błąd zapisu statusu wysyłki dla ${address.mailAddress}:`, err && err.message ? err.message : err);
                                });
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