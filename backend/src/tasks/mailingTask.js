
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import Customers from '../models/customers.model.js';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

let interval = 86400000;

/**
 * Pobiera i wysyła maile dla aktywnych kampanii, używając konfiguracji SMTP przypisanej do klienta
 */
class MailingTask {
    static async sendMails() {
        try {
            console.log('Rozpoczęcie wysyłania maili:', new Date().toISOString());

            // Pobierz aktywne kampanie razem z danymi klienta
            const activeCampaigns = await MarketingCampanies.findAll({
                where: {
                    active: true,
                    dateStart: {
                        [Op.lte]: new Date()
                    },
                    dateEnd: {
                        [Op.gte]: new Date()
                    }
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

                // Konfiguracja SMTP klienta (fallback na env)
                const smtpHost = customer.smtpHost || process.env.SMTP_HOST;
                const smtpPort = customer.smtpPort || (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587);
                const smtpUser = customer.smtpUser || process.env.SMTP_USER;
                const smtpPass = customer.smtpPass || process.env.SMTP_PASS;
                const smtpFrom = customer.smtpFrom || process.env.SMTP_FROM;
                const unsubscribeBase = customer.unsubscribeUrl || process.env.UNSUBSCRIBE_URL;

                if (!smtpHost || !smtpPort) {
                    console.warn(`Brak konfiguracji SMTP dla klienta ${customer.id} - pomijam wysyłkę kampanii ${campaign.id}`);
                    continue;
                }

                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: Number(smtpPort),
                    secure: Number(smtpPort) === 465,
                    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
                });

                for (const address of mailAddresses) {
                    try {
                        await transporter.sendMail({
                            from: smtpFrom || smtpUser,
                            to: address.mailAddress,
                            subject: campaign.name,
                            html: campaign.mailContent,
                            headers: unsubscribeBase ? { 'List-Unsubscribe': `<${unsubscribeBase}?email=${address.mailAddress}>` } : undefined
                        });

                        // Krótkie opóźnienie między wysyłkami
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error(`Błąd wysyłki na adres ${address.mailAddress}:`, error && error.message ? error.message : error);
                        continue;
                    }
                }

                // Aktualizuj postęp kampanii
                try {
                    await campaign.update({ process: Math.min((campaign.process || 0) + 1, 100) });
                } catch (err) {
                    console.error(`Nie udało się zaktualizować postępu kampanii ${campaign.id}:`, err && err.message ? err.message : err);
                }
            }

            console.log('Zakończenie wysyłania maili:', new Date().toISOString());
        } catch (error) {
            console.error('Błąd podczas wysyłania maili:', error && error.message ? error.message : error);
        }
    }

    /**
     * Starts timers for standard and offline state checkers
     */
    static run() {
        console.log('MailingTask started.');
        MailingTask.sendMails();
        setInterval(MailingTask.sendMails, interval);
    }
}

export default MailingTask;