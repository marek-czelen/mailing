import nodemailer from 'nodemailer';
import { createConnection } from 'net';
import dns from 'dns';
import { promisify } from 'util';
import crypto from 'crypto';
const SECRET_KEY = 'oiej!@#sdoiqjsd09324dnsadaSDqwe1!##$@34'; // trzymaj w .env lub konfiguracji

const resolveMx = promisify(dns.resolveMx);

/**
 * Klasa Mail - kompleksowa obsługa wysyłania e-maili
 * Obsługuje wysyłanie przez SMTP (z SSL/TLS) oraz bezpośrednie połączenie SMTP
 * Wszystkie metody są statyczne i asynchroniczne dla łatwego użytkowania w aplikacjach
 * 
 * @example
 * // Podstawowe wysyłanie przez SMTP
 * await Mail.sendEmail({
 *   smtp: {
 *     host: 'smtp.gmail.com',
 *     port: 587,
 *     secure: false,
 *     auth: { user: 'user@gmail.com', pass: 'password' }
 *   },
 *   from: 'sender@example.com',
 *   to: ['recipient@example.com'],
 *   subject: 'Test Email',
 *   html: '<h1>Hello World</h1>'
 * });
 * 
 * @example
 * // Wysyłanie z obsługą self-signed certyfikatów
 * await Mail.sendEmail({
 *   smtp: {
 *     host: 'mail.twoja-firma.com',
 *     port: 587,
 *     secure: false,
 *     ignoreTLS: true,  // Ignoruje błędy certyfikatów SSL/TLS
 *     auth: { user: 'user@twoja-firma.com', pass: 'password' }
 *   },
 *   from: 'sender@twoja-firma.com',
 *   to: 'recipient@example.com',
 *   subject: 'Email z self-signed cert',
 *   html: '<p>Email pomimo problemów z certyfikatem</p>'
 * });
 * 
 * @example
 * // Zaawansowana konfiguracja TLS
 * await Mail.sendEmail({
 *   smtp: {
 *     host: 'smtp.example.com',
 *     port: 587,
 *     rejectUnauthorized: false,  // Jawnie wyłącza weryfikację certyfikatów
 *     tls: {
 *       ciphers: 'SSLv3',
 *       secureProtocol: 'TLSv1_method'
 *     },
 *     auth: { user: 'user@example.com', pass: 'password' }
 *   },
 *   from: 'sender@example.com',
 *   to: 'recipient@example.com',
 *   subject: 'Email z custom TLS',
 *   html: '<p>Email z niestandardową konfiguracją TLS</p>'
 * });
 * 
 * @example
 * // Wysyłanie wielu maili jednocześnie
 * await Mail.sendBulkEmails({
 *   smtp: { host: 'smtp.example.com', ignoreTLS: true, auth: {...} },
 *   emails: [
 *     { to: 'user1@example.com', subject: 'Hello 1', html: '<p>Content 1</p>' },
 *     { to: 'user2@example.com', subject: 'Hello 2', html: '<p>Content 2</p>' }
 *   ]
 * });
 * 
 * @example
 * // Bezpośrednie wysyłanie (bez SMTP serwera)
 * await Mail.sendDirectEmail({
 *   from: 'sender@yourdomain.com',
 *   to: 'recipient@example.com',
 *   subject: 'Direct Email',
 *   html: '<p>Sent directly</p>'
 * });
 */
export class Mail {
  
  /**
   * Konfiguracja domyślnych placeholderów systemu
   * Rozszerz tę listę o własne globalne placeholdery
   * Wartości są pobierane ze zmiennych środowiskowych
   */
  static DEFAULT_PLACEHOLDERS = {
    CURRENT_YEAR: () => new Date().getFullYear(),
    CURRENT_DATE: () => new Date().toLocaleDateString('pl-PL'),
    CURRENT_DATETIME: () => new Date().toLocaleString('pl-PL'),
    COMPANY_NAME: () => process.env.COMPANY_NAME || 'Nasza Firma',
    COMPANY_ADDRESS: () => process.env.COMPANY_ADDRESS || '',
    WEBSITE_URL: () => process.env.WEBSITE_URL || 'https://example.com',
    SUPPORT_EMAIL: () => process.env.SUPPORT_EMAIL || 'support@example.com',
    PRIVACY_POLICY_URL: () => process.env.PRIVACY_POLICY_URL || '#',
    TERMS_URL: () => process.env.TERMS_URL || '#',
    UNSUBSCRIBE_URL: () => process.env.UNSUBSCRIBE_URL || 'https://example.com'
  };

  /**
   * Przetwarza placeholdery w treści HTML
   * Obsługuje placeholdery w formacie {{PLACEHOLDER_NAME}} oraz {{PLACEHOLDER_NAME|default_value}}
   * 
   * @param {string} htmlContent - Treść HTML z placeholderami
   * @param {Object} placeholders - Obiekt z wartościami placeholderów
   * @param {Object} userCustomPlaceholders - Dodatkowe placeholdery użytkownika
   * @returns {string} Przetworzona treść HTML
   * 
   * @example
   * const html = '<p>Witaj {{FIRST_NAME|Użytkowniku}}! Dzisiaj jest {{CURRENT_DATE}}</p>';
   * const processed = Mail.processPlaceholders(html, {
   *   FIRST_NAME: 'Jan',
   *   LAST_NAME: 'Kowalski'
   * });
   */
  static processPlaceholders(htmlContent, placeholders = {}, userCustomPlaceholders = {}) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return htmlContent;
    }

    // Połącz wszystkie placeholdery (użytkownik > domyślne > systemowe)
    const allPlaceholders = {
      ...Mail.DEFAULT_PLACEHOLDERS,
      ...userCustomPlaceholders,
      ...placeholders
    };

    // Regex do znajdowania placeholderów: {{PLACEHOLDER}} lub {{PLACEHOLDER|default}}
    const placeholderRegex =  /\{\{([A-Z_][A-Z0-9_]*?)(?:\|([^}]*))?\}\}/g;

    return htmlContent.replace(placeholderRegex, (match, key, defaultValue) => {
      // Sprawdź czy placeholder istnieje
      if (allPlaceholders.hasOwnProperty(key)) {
        const value = allPlaceholders[key];
        // Jeśli to funkcja, wykonaj ją
        return typeof value === 'function' ? value() : value;
      }
      
      // Jeśli nie ma wartości ale jest default, użyj default
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      
      // Jeśli nic nie pasuje, zostaw oryginalny placeholder
      return match;
    });
  }

  /**
   * Generuje unikalny identyfikator wiadomości
   * @returns {string} Message-ID w formacie RFC 2822
   */
  static generateMessageId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const hostname = process.env.HOSTNAME || 'localhost';
    return `<${timestamp}.${random}@${hostname}>`;
  }

  /**
   * Tworzy transporter nodemailer z podanej konfiguracji SMTP
   * @param {Object} smtpConfig - Konfiguracja SMTP
   * @param {Object} smtpConfig.tls - Opcje TLS
   * @param {boolean} smtpConfig.ignoreTLS - Ignoruj błędy certyfikatów SSL/TLS
   * @param {boolean} smtpConfig.rejectUnauthorized - Czy odrzucać nieautoryzowane certyfikaty (domyślnie true)
   * @returns {Object} Transporter nodemailer
   */
  static createTransporter(smtpConfig) {
    const config = {
      host: smtpConfig.host,
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure !== undefined ? smtpConfig.secure : (smtpConfig.port === 465),
    };

    // Dodaj autentykację jeśli podana
    if (smtpConfig.auth) {
      config.auth = smtpConfig.auth;
    }

    // Konfiguracja TLS - obsługa self-signed certyfikatów
    config.tls = {
      ...smtpConfig.tls
    };

    // Opcje dla self-signed certyfikatów lub problemów z certyfikatami
    if (smtpConfig.ignoreTLS || 
        smtpConfig.rejectUnauthorized === false || 
        process.env.NODE_ENV === 'development' ||
        process.env.IGNORE_TLS === 'true') {
      
      config.tls = {
        ...config.tls,
        rejectUnauthorized: false,
        // Dodatkowe opcje dla problemów z certyfikatami
        ciphers: 'SSLv3'
      };
      
      console.warn('[Mail] UWAGA: Weryfikacja certyfikatów SSL/TLS została wyłączona!');
    }

    // Możliwość jawnego ustawienia rejectUnauthorized
    if (smtpConfig.rejectUnauthorized !== undefined) {
      config.tls.rejectUnauthorized = smtpConfig.rejectUnauthorized;
    }

    return nodemailer.createTransport(config);
  }

  /**
   * Wysyła pojedynczy email przez SMTP
   * 
   * @param {Object} options - Opcje wysyłki
   * @param {Object} options.smtp - Konfiguracja SMTP
   * @param {string} options.smtp.host - Host SMTP
   * @param {number} options.smtp.port - Port SMTP (domyślnie 587)
   * @param {boolean} options.smtp.secure - Czy używać SSL (domyślnie false dla portu 587, true dla 465)
   * @param {Object} options.smtp.auth - Dane uwierzytelnienia {user, pass}
   * @param {boolean} options.smtp.ignoreTLS - Ignoruj błędy certyfikatów SSL/TLS
   * @param {boolean} options.smtp.rejectUnauthorized - Czy odrzucać nieautoryzowane certyfikaty (domyślnie true)
   * @param {Object} options.smtp.tls - Dodatkowe opcje TLS
   * @param {string} options.from - Adres nadawcy
   * @param {string|string[]} options.to - Adres(y) odbiorcy
   * @param {string} options.subject - Temat wiadomości
   * @param {string} options.html - Treść HTML
   * @param {string} options.text - Treść tekstowa (opcjonalna)
   * @param {Object} options.placeholders - Placeholdery do przetworzenia
   * @param {Object} options.attachments - Załączniki (format nodemailer)
   * @param {Object} options.headers - Dodatkowe nagłówki
   * @returns {Promise<Object>} Wynik wysyłki
   */
  static async sendEmail(options) {
    try {
      const {
        smtp,
        from,
        to,
        subject,
        html,
        text,
        placeholders = {},
        attachments = [],
        headers = {},
        campaignId = null,
        mailAddressId = null
      } = options;

      if (!smtp || !from || !to || !subject) {
        throw new Error('Brakuje wymaganych parametrów: smtp, from, to, subject');
      }

      // Utwórz transporter
      const transporter = Mail.createTransporter(smtp);

      // Przetwórz placeholdery w treści
      const processedHtml = html ? Mail.processPlaceholders(html, placeholders) : undefined;
      const processedText = text ? Mail.processPlaceholders(text, placeholders) : undefined;
      const processedSubject = Mail.processPlaceholders(subject, placeholders);

      // Przygotuj opcje wiadomości
      // Wygeneruj Message-ID wcześniej aby móc go również zwrócić i zapisać do tabeli wyników
      const generatedMessageId = Mail.generateMessageId();

      const mailOptions = {
        from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: processedSubject,
        html: processedHtml,
        text: processedText,
        attachments,
        headers: {
          'Message-ID': generatedMessageId,
          // Dodatkowe nagłówki do śledzenia kampanii i kontaktu (nie wszystkie serwery zawsze je zachowują)
          ...(campaignId ? { 'X-Campaign-ID': String(campaignId) } : {}),
          ...(mailAddressId ? { 'X-Mail-Address-ID': String(mailAddressId) } : {}),
          ...headers
        }
      };

      // Wyślij email
      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId || generatedMessageId,
        campaignId: campaignId || null,
        mailAddressId: mailAddressId || null,
        response: result.response,
        trackingHeaders: {
          'Message-ID': generatedMessageId,
          ...(campaignId ? { 'X-Campaign-ID': String(campaignId) } : {}),
          ...(mailAddressId ? { 'X-Mail-Address-ID': String(mailAddressId) } : {})
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Wysyła wiele emaili jednocześnie używając jednego połączenia SMTP
   * Optymalizowane dla masowego wysyłania
   * 
   * @param {Object} options - Opcje wysyłki
   * @param {Object} options.smtp - Konfiguracja SMTP
   * @param {string} options.from - Domyślny nadawca (można nadpisać w poszczególnych mailach)
   * @param {Array} options.emails - Lista emaili do wysłania
   * @param {number} options.batchSize - Rozmiar paczki (domyślnie 50)
   * @param {number} options.delay - Opóźnienie między emailami w ms (domyślnie 100)
   * @param {Object} options.globalPlaceholders - Globalne placeholdery dla wszystkich maili
   * @returns {Promise<Object>} Statystyki wysyłki
   * 
   * @example
   * await Mail.sendBulkEmails({
   *   smtp: { host: 'smtp.example.com', port: 587, auth: {...} },
   *   from: 'sender@example.com',
   *   globalPlaceholders: { COMPANY_NAME: 'ABC Corp' },
   *   emails: [
   *     {
   *       to: 'user1@example.com',
   *       subject: 'Hello {{FIRST_NAME}}',
   *       html: '<p>Hi {{FIRST_NAME}} from {{COMPANY_NAME}}</p>',
   *       placeholders: { FIRST_NAME: 'John' }
   *     }
   *   ]
   * });
   */
  static async sendBulkEmails(options) {
    const {
      smtp,
      from: defaultFrom,
      emails = [],
      batchSize = 50,
      delay = 100,
      globalPlaceholders = {}
    } = options;

    if (!smtp || !emails.length) {
      throw new Error('Brakuje konfiguracji SMTP lub listy emaili');
    }

    const results = {
      total: emails.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    try {
      // Utwórz transporter z poolingiem połączeń
      const transporter = Mail.createTransporter({
        ...smtp,
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      });

      // Przetwarzaj emaile w paczkach
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (emailData, index) => {
          try {
            // Opóźnienie między wysyłkami dla uniknięcia rate limiting
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, index * delay));
            }

            const {
              to,
              subject,
              html,
              text,
              placeholders = {},
              attachments = [],
              headers = {},
              from = defaultFrom
            } = emailData;

            // Połącz globalne i lokalne placeholdery
            const allPlaceholders = { ...globalPlaceholders, ...placeholders };

            // Przetwórz placeholdery
            const processedHtml = html ? Mail.processPlaceholders(html, allPlaceholders) : undefined;
            const processedText = text ? Mail.processPlaceholders(text, allPlaceholders) : undefined;
            const processedSubject = Mail.processPlaceholders(subject, allPlaceholders);

            const mailOptions = {
              from,
              to: Array.isArray(to) ? to.join(', ') : to,
              subject: processedSubject,
              html: processedHtml,
              text: processedText,
              attachments,
              headers: {
                'Message-ID': Mail.generateMessageId(),
                ...headers
              }
            };

            await transporter.sendMail(mailOptions);
            results.sent++;

          } catch (error) {
            results.failed++;
            results.errors.push({
              email: emailData.to,
              error: error.message
            });
          }
        });

        // Czekaj na zakończenie paczki
        await Promise.all(batchPromises);
      }

      // Zamknij transporter
      transporter.close();

      return {
        success: true,
        results
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  /**
   * Wysyła email bezpośrednio do serwera poczty odbiorcy (bez pośredniego SMTP)
   * Wymaga aby serwer Node.js był na maszynie z otwartym portem 25
   * 
   * @param {Object} options - Opcje wysyłki
   * @param {string} options.from - Adres nadawcy
   * @param {string} options.to - Adres odbiorcy
   * @param {string} options.subject - Temat
   * @param {string} options.html - Treść HTML
   * @param {string} options.text - Treść tekstowa
   * @param {Object} options.placeholders - Placeholdery
   * @returns {Promise<Object>} Wynik wysyłki
   */
  static async sendDirectEmail(options) {
    const { from, to, subject, html, text, placeholders = {} } = options;

    if (!from || !to || !subject) {
      throw new Error('Brakuje wymaganych parametrów: from, to, subject');
    }

    try {
      // Wyciągnij domenę z adresu odbiorcy
      const domain = to.split('@')[1];
      if (!domain) {
        throw new Error('Nieprawidłowy adres email odbiorcy');
      }

      // Znajdź serwer MX dla domeny
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        throw new Error(`Nie znaleziono serwera MX dla domeny ${domain}`);
      }

      // Sortuj po priorytecie (niższy = wyższy priorytet)
      mxRecords.sort((a, b) => a.priority - b.priority);
      const mxHost = mxRecords[0].exchange;

      // Przetwórz placeholdery
      const processedHtml = html ? Mail.processPlaceholders(html, placeholders) : undefined;
      const processedText = text ? Mail.processPlaceholders(text, placeholders) : undefined;
      const processedSubject = Mail.processPlaceholders(subject, placeholders);

      // Przygotuj treść wiadomości SMTP
      const messageId = Mail.generateMessageId();
      const date = new Date().toUTCString();
      
      let emailBody = `HELO ${process.env.HOSTNAME || 'localhost'}\r\n`;
      emailBody += `MAIL FROM: <${from}>\r\n`;
      emailBody += `RCPT TO: <${to}>\r\n`;
      emailBody += `DATA\r\n`;
      emailBody += `Message-ID: ${messageId}\r\n`;
      emailBody += `Date: ${date}\r\n`;
      emailBody += `From: ${from}\r\n`;
      emailBody += `To: ${to}\r\n`;
      emailBody += `Subject: ${processedSubject}\r\n`;
      emailBody += `MIME-Version: 1.0\r\n`;
      
      if (processedHtml && processedText) {
        // Multipart email
        const boundary = `boundary_${Date.now()}_${Math.random().toString(36)}`;
        emailBody += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
        emailBody += `--${boundary}\r\n`;
        emailBody += `Content-Type: text/plain; charset=utf-8\r\n\r\n`;
        emailBody += `${processedText}\r\n\r\n`;
        emailBody += `--${boundary}\r\n`;
        emailBody += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
        emailBody += `${processedHtml}\r\n\r\n`;
        emailBody += `--${boundary}--\r\n`;
      } else if (processedHtml) {
        // Tylko HTML
        emailBody += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
        emailBody += `${processedHtml}\r\n`;
      } else if (processedText) {
        // Tylko tekst
        emailBody += `Content-Type: text/plain; charset=utf-8\r\n\r\n`;
        emailBody += `${processedText}\r\n`;
      } else {
        throw new Error('Brak treści wiadomości (html lub text)');
      }
      
      emailBody += `\r\n.\r\n`;
      emailBody += `QUIT\r\n`;

      // Połącz z serwerem MX i wyślij
      return new Promise((resolve, reject) => {
        const socket = createConnection(25, mxHost);
        let response = '';

        socket.on('connect', () => {
          console.log(`Połączono z serwerem MX: ${mxHost}`);
        });

        socket.on('data', (data) => {
          response += data.toString();
          
          // Sprawdź czy serwer jest gotowy na dane
          if (response.includes('220')) {
            socket.write(emailBody);
          }
        });

        socket.on('end', () => {
          if (response.includes('250')) {
            resolve({
              success: true,
              messageId: messageId,
              response: response.trim()
            });
          } else {
            reject(new Error(`Serwer odrzucił wiadomość: ${response}`));
          }
        });

        socket.on('error', (error) => {
          reject(new Error(`Błąd połączenia z serwerem MX: ${error.message}`));
        });

        // Timeout po 30 sekundach
        socket.setTimeout(30000, () => {
          socket.destroy();
          reject(new Error('Timeout połączenia z serwerem MX'));
        });
      });

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Testuje połączenie SMTP
   * @param {Object} smtpConfig - Konfiguracja SMTP
   * @returns {Promise<Object>} Wynik testu
   */
  static async testSMTPConnection(smtpConfig) {
    try {
      const transporter = Mail.createTransporter(smtpConfig);
      const verified = await transporter.verify();
      transporter.close();
      
      return {
        success: true,
        verified,
        message: 'Połączenie SMTP działa prawidłowo'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Błąd połączenia SMTP'
      };
    }
  }

  /**
   * Waliduje adres email
   * @param {string} email - Adres email do walidacji
   * @returns {boolean} True jeśli adres jest prawidłowy
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Tworzy template email z placeholderami na podstawie blokowego systemu
   * Kompatybilne z systemem szablonów z bazy danych
   * 
   * @param {Array} blocks - Bloki szablonu
   * @param {Object} placeholders - Placeholdery do zastąpienia
   * @returns {string} HTML email
   */
  static renderTemplate(blocks = [], placeholders = {}) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">`;

    for (const block of blocks) {
      switch (block.type) {
        case 'text':
          html += Mail._renderTextBlock(block);
          break;
        case 'button':
          html += Mail._renderButtonBlock(block);
          break;
        case 'image':
          html += Mail._renderImageBlock(block);
          break;
        default:
          console.warn(`Nieznany typ bloku: ${block.type}`);
      }
    }

    html += `
    </div>
</body>
</html>`;

    return Mail.processPlaceholders(html, placeholders);
  }

  /**
   * Renderuje blok tekstowy
   * @private
   */
  static _renderTextBlock(block) {
    const content = block.content || {};
    const style = block.style || {};
    
    return `<div style="margin-top: ${style.marginTop || 0}px; margin-bottom: ${style.marginBottom || 20}px; text-align: ${style.textAlign || 'left'};">
      <p style="font-size: ${content.fontSize || 16}px; color: ${content.color || '#333'}; font-weight: ${content.fontWeight || 'normal'}; font-style: ${content.fontStyle || 'normal'}; font-family: ${content.fontFamily || 'Arial, sans-serif'}; margin: 0;">
        ${content.text || ''}
      </p>
    </div>`;
  }

  /**
   * Renderuje blok przycisku
   * @private
   */
  static _renderButtonBlock(block) {
    const content = block.content || {};
    const style = block.style || {};
    
    return `<div style="margin-top: ${style.marginTop || 10}px; margin-bottom: ${style.marginBottom || 20}px; text-align: ${style.textAlign || 'center'};">
      <a href="${content.url || '#'}" style="display: inline-block; background-color: ${content.backgroundColor || '#007bff'}; color: ${content.textColor || '#ffffff'}; text-decoration: none; padding: ${content.padding || '12px 24px'}; border-radius: ${content.borderRadius || 4}px; font-weight: bold;">
        ${content.text || 'Kliknij tutaj'}
      </a>
    </div>`;
  }

  /**
   * Renderuje blok obrazu
   * @private
   */
  static _renderImageBlock(block) {
    const content = block.content || {};
    const style = block.style || {};
    
    return `<div style="margin-top: ${style.marginTop || 10}px; margin-bottom: ${style.marginBottom || 20}px; text-align: ${style.textAlign || 'center'};">
      <img src="${content.src || ''}" alt="${content.alt || ''}" style="max-width: 100%; height: auto; width: ${content.width || 'auto'}; border-radius: ${content.borderRadius || 0}px;">
    </div>`;
  }

  /**
   * Generuje link do wypisania z newslettera
   * @param {string} email - Adres email użytkownika
   * @param {string} baseUrl - Bazowy URL aplikacji
   * @param {string} token - Token bezpieczeństwa (opcjonalny)
   * @returns {string} Pełny URL do wypisania
   */
  static generateUnsubscribeLink(email, baseUrl, token = null) {
    const params = new URLSearchParams({ email });
    if (token) params.append('token', token);
    return `${baseUrl}/unsubscribe?${params.toString()}`;
  }


static HashEmail(email) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(email)
    .digest('base64url'); // można użyć też 'hex'
}
}
export default Mail