# Integracja klasy Mail z systemem mailingowym

## Przegląd integracji

Klasa `Mail` została zaprojektowana tak, aby łatwo zintegrować się z istniejącym systemem mailingowym. Poniżej znajdziesz informacje jak zastąpić obecny kod w `mailingTask.js` i wykorzystać nową klasę.

## Kroki integracji

### 1. Aktualizacja mailingTask.js

Zastąp istniejący kod w `src/tasks/mailingTask.js`:

```javascript
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import Customers from '../models/customers.model.js';
import Mail from '../include/mail.js'; // Nowa klasa Mail
import { Op } from 'sequelize';

class MailingTask {
    static async sendMails() {
        try {
            console.log('Rozpoczęcie wysyłania maili:', new Date().toISOString());

            // Pobierz aktywne kampanie razem z danymi klienta
            const activeCampaigns = await MarketingCampanies.findAll({
                where: {
                    active: true,
                    dateStart: { [Op.lte]: new Date() },
                    dateEnd: { [Op.gte]: new Date() }
                },
                include: [{ model: Customers, as: 'Customer' }]
            });

            console.log(`Znaleziono ${activeCampaigns.length} aktywnych kampanii`);

            for (const campaign of activeCampaigns) {
                const customer = campaign.Customer;
                if (!customer) continue;

                // Pobierz listę adresów
                const mailAddresses = await MailAddress.findAll({
                    where: {
                        active: 1,
                        customerId: campaign.customerId,
                        unsubscribesDate: null
                    }
                });

                console.log(`Kampania ${campaign.name}: ${mailAddresses.length} adresów`);

                // Przygotuj emaile do wysłania
                const emails = mailAddresses.map(address => ({
                    to: address.mailAddress,
                    subject: campaign.subject || campaign.name,
                    html: campaign.htmlContent || campaign.textContent,
                    placeholders: {
                        FIRST_NAME: address.firstName || 'Drogi Kliencie',
                        EMAIL: address.mailAddress,
                        COMPANY_NAME: customer.companyName,
                        UNSUBSCRIBE_LINK: Mail.generateUnsubscribeLink(
                            address.mailAddress,
                            process.env.UNSUBSCRIBE_URL || 'https://example.com',
                            `token_${address.id}`
                        ),
                        RODO_FOOTER: customer.rodoFooter || 'Informacja RODO'
                    }
                }));

                // Wysłanie używając nowej klasy Mail
                const smtpConfig = {
                    host: customer.smtpHost || process.env.SMTP_HOST,
                    port: customer.smtpPort || process.env.SMTP_PORT || 587,
                    secure: (customer.smtpPort || process.env.SMTP_PORT) == 465,
                    // Obsługa self-signed certyfikatów jeśli klient ma tę opcję
                    ignoreTLS: customer.ignoreTLS || process.env.IGNORE_TLS === 'true',
                    rejectUnauthorized: customer.rejectUnauthorized !== false,
                    auth: customer.smtpUser ? {
                        user: customer.smtpUser,
                        pass: customer.smtpPass
                    } : undefined
                };

                // Wybór metody wysyłania
                let result;
                if (customer.internalMailServer) {
                    // Bezpośrednie wysyłanie - po jednym mailu
                    result = { sent: 0, failed: 0, errors: [] };
                    for (const email of emails) {
                        const directResult = await Mail.sendDirectEmail({
                            from: customer.smtpFrom || customer.smtpUser,
                            to: email.to,
                            subject: email.subject,
                            html: email.html,
                            placeholders: email.placeholders
                        });
                        
                        if (directResult.success) {
                            result.sent++;
                        } else {
                            result.failed++;
                            result.errors.push({ email: email.to, error: directResult.error });
                        }
                        
                        // Opóźnienie między wysyłkami
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } else {
                    // SMTP - masowe wysyłanie
                    const bulkResult = await Mail.sendBulkEmails({
                        smtp: smtpConfig,
                        from: customer.smtpFrom || customer.smtpUser,
                        emails: emails,
                        batchSize: 25,
                        delay: 200
                    });
                    
                    result = bulkResult.results;
                }

                console.log(`Kampania ${campaign.name}: wysłano ${result.sent}, błędów ${result.failed}`);

                // Aktualizuj postęp kampanii
                const progress = Math.min(
                    Math.round((result.sent / emails.length) * 100), 
                    100
                );
                await campaign.update({ process: progress });
            }

            console.log('Zakończenie wysyłania maili:', new Date().toISOString());
        } catch (error) {
            console.error('Błąd podczas wysyłania maili:', error);
        }
    }

    static run() {
        console.log('MailingTask started with new Mail class.');
        MailingTask.sendMails();
        setInterval(MailingTask.sendMails, 86400000); // 24h
    }
}

export default MailingTask;
```

### 2. Aktualizacja kontrolera mailingowego

W `src/controller/mailing.js` dodaj endpoint do testowania SMTP:

```javascript
import Mail from '../include/mail.js';

// Testowanie połączenia SMTP
export const testSMTPConnection = async (req, res) => {
    try {
        const { customerId } = req.body;
        
        const customer = await Customers.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Klient nie znaleziony' });
        }

        const smtpConfig = {
            host: customer.smtpHost,
            port: customer.smtpPort || 587,
            secure: customer.smtpPort == 465,
            auth: customer.smtpUser ? {
                user: customer.smtpUser,
                pass: customer.smtpPass
            } : undefined
        };

        const result = await Mail.testSMTPConnection(smtpConfig);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Wysłanie testu email
export const sendTestEmail = async (req, res) => {
    try {
        const { customerId, testEmail, subject = 'Email testowy' } = req.body;
        
        const customer = await Customers.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Klient nie znaleziony' });
        }

        const smtpConfig = {
            host: customer.smtpHost,
            port: customer.smtpPort || 587,
            secure: customer.smtpPort == 465,
            auth: customer.smtpUser ? {
                user: customer.smtpUser,
                pass: customer.smtpPass
            } : undefined
        };

        const result = await Mail.sendEmail({
            smtp: smtpConfig,
            from: customer.smtpFrom || customer.smtpUser,
            to: testEmail,
            subject: subject,
            html: `
                <h1>Email testowy</h1>
                <p>To jest testowy email z systemu {{COMPANY_NAME}}.</p>
                <p>Wysłano: {{CURRENT_DATETIME}}</p>
                <hr>
                <p><small>{{RODO_FOOTER}}</small></p>
            `,
            placeholders: {
                COMPANY_NAME: customer.companyName,
                RODO_FOOTER: customer.rodoFooter || 'Informacja RODO'
            }
        });

        res.json(result);
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};
```

### 3. Dodanie tras

W `src/routes/mailing.js` dodaj nowe trasy:

```javascript
import { testSMTPConnection, sendTestEmail } from '../controller/mailing.js';

// Dodaj te trasy
router.post('/test-smtp', testSMTPConnection);
router.post('/send-test', sendTestEmail);
```

### 4. Aktualizacja kontrolera szablonów

W `src/controller/TemplatesController.js` dodaj funkcję preview z placeholderami:

```javascript
import Mail from '../include/mail.js';

// Preview szablonu z placeholderami
export const previewTemplate = async (req, res) => {
    try {
        const { templateId, placeholders = {} } = req.body;
        
        // Pobierz szablon z bazy danych
        const template = await EmailTemplate.findByPk(templateId, {
            include: [{ model: TemplateBlock, as: 'blocks' }]
        });

        if (!template) {
            return res.status(404).json({ error: 'Szablon nie znaleziony' });
        }

        // Renderuj szablon z placeholderami
        const html = Mail.renderTemplate(template.blocks, {
            COMPANY_NAME: 'Przykładowa Firma',
            FIRST_NAME: 'Jan',
            LAST_NAME: 'Kowalski',
            CURRENT_DATE: new Date().toLocaleDateString('pl-PL'),
            ...placeholders
        });

        res.json({ 
            success: true,
            html: html,
            template: template
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};
```

## Korzyści z nowej implementacji

### 1. Lepsza wydajność
- Pooling połączeń SMTP
- Masowe wysyłanie z optymalizacją
- Inteligentne zarządzanie opóźnieniami

### 2. Większa elastyczność
- Wsparcie dla bezpośredniego wysyłania
- Konfigurowalny rozmiar paczek
- Różne metody uwierzytelniania

### 3. Lepsze zarządzanie błędami
- Szczegółowe raporty z wysyłki
- Graceful handling błędów
- Możliwość retry dla failed emails

### 4. Zgodność z standardami
- Proper Message-ID generation
- Support dla List-Unsubscribe headers
- RODO compliance

### 5. Łatwiejsze testowanie
- Funkcja testowania połączenia SMTP
- Preview szablonów z placeholderami
- Walidacja konfiguracji

## Migracja danych

### Dodanie nowych pól do tabeli customers (jeśli nie istnieją)

```sql
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS use_internal_mail_server BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS smtp_from VARCHAR(255),
ADD COLUMN IF NOT EXISTS rodo_footer TEXT,
ADD COLUMN IF NOT EXISTS ignore_tls BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reject_unauthorized BOOLEAN DEFAULT TRUE;
```

### Dodanie indeksów dla wydajności

```sql
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_active 
ON marketing_campanies(active, date_start, date_end);

CREATE INDEX IF NOT EXISTS idx_mail_addresses_customer_active 
ON mail_addresses(customer_id, active, unsubscribes_date);
```

## Konfiguracja środowiska

Dodaj do pliku `.env`:

```bash
# SMTP Configuration (fallback values)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com

# SSL/TLS Configuration
IGNORE_TLS=false
REJECT_UNAUTHORIZED=true

# Company defaults
COMPANY_NAME=Your Company Name
WEBSITE_URL=https://yourwebsite.com
SUPPORT_EMAIL=support@yourdomain.com
UNSUBSCRIBE_URL=https://yourwebsite.com

# For direct mail sending
HOSTNAME=mail.yourdomain.com

# Development
NODE_ENV=development
```

## Testowanie

1. **Test połączenia SMTP**:
   ```bash
   curl -X POST http://localhost:3000/api/mailing/test-smtp \
     -H "Content-Type: application/json" \
     -d '{"customerId": 1}'
   ```

2. **Wysłanie email testowego**:
   ```bash
   curl -X POST http://localhost:3000/api/mailing/send-test \
     -H "Content-Type: application/json" \
     -d '{"customerId": 1, "testEmail": "test@example.com"}'
   ```

3. **Preview szablonu**:
   ```bash
   curl -X POST http://localhost:3000/api/templates/preview \
     -H "Content-Type: application/json" \
     -d '{"templateId": 1, "placeholders": {"FIRST_NAME": "Jan"}}'
   ```

Ta integracja zapewni bardziej niezawodne, wydajne i funkcjonalne wysyłanie emaili w systemie mailingowym.