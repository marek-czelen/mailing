/**
 * Przykłady użycia klasy Mail
 * Demonstruje wszystkie funkcjonalności klasy Mail do wysyłania e-maili
 */

import Mail from '../src/include/mail.js';

// ========================================
// PRZYKŁAD 1: Podstawowe wysyłanie przez SMTP
// ========================================

async function przykład1_podstawoweWysyłanie() {
  console.log('=== Przykład 1: Podstawowe wysyłanie przez SMTP ===');
  
  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true dla portu 465, false dla innych
      auth: {
        user: 'twoj-email@gmail.com',
        pass: 'twoje-haslo-aplikacji' // Używaj App Password dla Gmail
      }
    },
    from: 'nadawca@example.com',
    to: 'odbiorca@example.com',
    subject: 'Test Email z klasy Mail',
    html: `
      <h1>Witaj!</h1>
      <p>To jest testowy email wysłany z klasy Mail.</p>
      <p>Dzisiaj jest {{CURRENT_DATE}} i rok {{CURRENT_YEAR}}.</p>
    `,
    text: 'Wersja tekstowa: Witaj! To jest testowy email.',
    placeholders: {
      FIRMA: 'Nasza Firma Sp. z o.o.'
    }
  });

  console.log('Wynik wysyłki:', result);
}

// ========================================
// PRZYKŁAD 1B: Wysyłanie z self-signed certyfikatami
// ========================================

async function przykład1b_selfSignedCertyfikaty() {
  console.log('=== Przykład 1B: Wysyłanie z self-signed certyfikatami ===');
  
  // Metoda 1: Użycie ignoreTLS
  const result1 = await Mail.sendEmail({
    smtp: {
      host: 'mail.twoja-firma.com',
      port: 587,
      secure: false,
      ignoreTLS: true,  // <-- Ignoruje błędy certyfikatów
      auth: {
        user: 'sender@twoja-firma.com',
        pass: 'password123'
      }
    },
    from: 'sender@twoja-firma.com',
    to: 'recipient@example.com',
    subject: 'Test z ignoreTLS',
    html: '<p>Email wysłany pomimo self-signed certyfikatu (ignoreTLS)</p>'
  });

  console.log('Wynik z ignoreTLS:', result1);

  // Metoda 2: Użycie rejectUnauthorized = false
  const result2 = await Mail.sendEmail({
    smtp: {
      host: 'mail.twoja-firma.com',
      port: 587,
      secure: false,
      rejectUnauthorized: false,  // <-- Jawnie wyłącza weryfikację
      auth: {
        user: 'sender@twoja-firma.com',
        pass: 'password123'
      }
    },
    from: 'sender@twoja-firma.com',
    to: 'recipient@example.com',
    subject: 'Test z rejectUnauthorized=false',
    html: '<p>Email z jawnie wyłączoną weryfikacją certyfikatów</p>'
  });

  console.log('Wynik z rejectUnauthorized=false:', result2);

  // Metoda 3: Zaawansowana konfiguracja TLS
  const result3 = await Mail.sendEmail({
    smtp: {
      host: 'mail.twoja-firma.com',
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
        secureProtocol: 'TLSv1_method'
      },
      auth: {
        user: 'sender@twoja-firma.com',
        pass: 'password123'
      }
    },
    from: 'sender@twoja-firma.com',
    to: 'recipient@example.com',
    subject: 'Test z zaawansowaną TLS',
    html: '<p>Email z niestandardową konfiguracją TLS</p>'
  });

  console.log('Wynik z zaawansowaną TLS:', result3);
}

// ========================================
// PRZYKŁAD 2: Masowe wysyłanie emaili
// ========================================

async function przykład2_masoweWysyłanie() {
  console.log('=== Przykład 2: Masowe wysyłanie emaili ===');

  const emails = [
    {
      to: 'user1@example.com',
      subject: 'Witaj {{FIRST_NAME}}!',
      html: `
        <h2>Cześć {{FIRST_NAME}} {{LAST_NAME}}!</h2>
        <p>Zapraszamy Cię do skorzystania z naszych usług w {{COMPANY_NAME}}.</p>
        <p>Twój kod promocyjny: {{PROMO_CODE}}</p>
      `,
      placeholders: {
        FIRST_NAME: 'Jan',
        LAST_NAME: 'Kowalski',
        PROMO_CODE: 'JAN2025'
      }
    },
    {
      to: 'user2@example.com',
      subject: 'Witaj {{FIRST_NAME}}!',
      html: `
        <h2>Cześć {{FIRST_NAME}} {{LAST_NAME}}!</h2>
        <p>Zapraszamy Cię do skorzystania z naszych usług w {{COMPANY_NAME}}.</p>
        <p>Twój kod promocyjny: {{PROMO_CODE}}</p>
      `,
      placeholders: {
        FIRST_NAME: 'Anna',
        LAST_NAME: 'Nowak',
        PROMO_CODE: 'ANNA2025'
      }
    },
    {
      to: 'user3@example.com',
      subject: 'Witaj {{FIRST_NAME}}!',
      html: `
        <h2>Cześć {{FIRST_NAME}} {{LAST_NAME}}!</h2>
        <p>Zapraszamy Cię do skorzystania z naszych usług w {{COMPANY_NAME}}.</p>
        <p>Twój kod promocyjny: {{PROMO_CODE}}</p>
      `,
      placeholders: {
        FIRST_NAME: 'Piotr',
        LAST_NAME: 'Wiśniewski',
        PROMO_CODE: 'PIOTR2025'
      }
    }
  ];

  const result = await Mail.sendBulkEmails({
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      ignoreTLS: true,  // Obsługa self-signed certyfikatów w masowym wysyłaniu
      auth: {
        user: 'sender@example.com',
        pass: 'password123'
      }
    },
    from: 'newsletter@example.com',
    globalPlaceholders: {
      COMPANY_NAME: 'ABC Corporation',
      WEBSITE_URL: 'https://abc-corp.com'
    },
    emails: emails,
    batchSize: 10,  // Wysyłaj po 10 na raz
    delay: 500      // 500ms opóźnienia między emailami
  });

  console.log('Wyniki masowego wysyłania:', result);
}

// ========================================
// PRZYKŁAD 3: Bezpośrednie wysyłanie (bez SMTP)
// ========================================

async function przykład3_bezpośrednieWysyłanie() {
  console.log('=== Przykład 3: Bezpośrednie wysyłanie ===');
  
  const result = await Mail.sendDirectEmail({
    from: 'admin@twoja-domena.com', // Musi być z Twojej domeny
    to: 'klient@example.com',
    subject: 'Wiadomość wysłana bezpośrednio',
    html: `
      <h1>Email bezpośredni</h1>
      <p>Ta wiadomość została wysłana bezpośrednio do serwera poczty odbiorcy.</p>
      <p>Wysłane: {{CURRENT_DATETIME}}</p>
    `,
    text: 'Wersja tekstowa emaila bezpośredniego',
    placeholders: {
      NADAWCA: 'System Automatyczny'
    }
  });

  console.log('Wynik bezpośredniego wysyłania:', result);
}

// ========================================
// PRZYKŁAD 4: Używanie szablonów blokowych
// ========================================

async function przykład4_szablonyBlokowe() {
  console.log('=== Przykład 4: Szablony blokowe ===');

  // Definicja bloków szablonu (jak w bazie danych)
  const templateBlocks = [
    {
      type: 'text',
      content: {
        text: 'Witaj {{FIRST_NAME}}!',
        fontSize: 24,
        color: '#2c3e50',
        fontWeight: 'bold'
      },
      style: {
        marginBottom: 20,
        textAlign: 'center'
      }
    },
    {
      type: 'text',
      content: {
        text: 'Dziękujemy za zainteresowanie naszymi usługami w {{COMPANY_NAME}}. Twoja oferta specjalna jest już dostępna!',
        fontSize: 16,
        color: '#333333'
      },
      style: {
        marginBottom: 20,
        textAlign: 'left'
      }
    },
    {
      type: 'button',
      content: {
        text: 'Zobacz ofertę',
        url: '{{WEBSITE_URL}}/oferta?code={{PROMO_CODE}}',
        backgroundColor: '#e74c3c',
        textColor: '#ffffff',
        padding: '14px 28px',
        borderRadius: 6
      },
      style: {
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center'
      }
    },
    {
      type: 'image',
      content: {
        src: 'https://example.com/logo.png',
        alt: 'Logo firmy',
        width: '200px'
      },
      style: {
        textAlign: 'center',
        marginBottom: 30
      }
    },
    {
      type: 'text',
      content: {
        text: 'Pozdrawiamy,<br>Zespół {{COMPANY_NAME}}',
        fontSize: 14,
        color: '#666666'
      },
      style: {
        marginBottom: 20,
        textAlign: 'left'
      }
    }
  ];

  // Renderuj template
  const htmlContent = Mail.renderTemplate(templateBlocks, {
    FIRST_NAME: 'Jan',
    COMPANY_NAME: 'TechCorp',
    WEBSITE_URL: 'https://techcorp.com',
    PROMO_CODE: 'SPECIAL2025'
  });

  // Wyślij email z templatem
  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      auth: { user: 'sender@example.com', pass: 'password' }
    },
    from: 'marketing@techcorp.com',
    to: 'jan.kowalski@example.com',
    subject: 'Twoja specjalna oferta od {{COMPANY_NAME}}',
    html: htmlContent,
    placeholders: {
      COMPANY_NAME: 'TechCorp'
    }
  });

  console.log('Wynik wysyłki z templatem:', result);
  console.log('Wygenerowany HTML:', htmlContent);
}

// ========================================
// PRZYKŁAD 5: Newsletter z linkiem do wypisania
// ========================================

async function przykład5_newsletterZWypisaniem() {
  console.log('=== Przykład 5: Newsletter z wypisaniem ===');

  const userEmail = 'subscriber@example.com';
  const unsubscribeUrl = 'https://twoja-strona.com';
  
  // Wygeneruj link do wypisania
  const unsubscribeLink = Mail.generateUnsubscribeLink(
    userEmail, 
    unsubscribeUrl, 
    'bezpieczny-token-123'
  );

  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      auth: { user: 'newsletter@example.com', pass: 'password' }
    },
    from: 'newsletter@example.com',
    to: userEmail,
    subject: 'Miesięczny Newsletter - {{CURRENT_DATE}}',
    html: `
      <h1>Newsletter {{COMPANY_NAME}}</h1>
      <h2>Nowości z {{CURRENT_DATE}}</h2>
      
      <p>Cześć {{FIRST_NAME}}!</p>
      
      <p>Oto najważniejsze informacje z tego miesiąca...</p>
      
      <hr style="margin: 30px 0;">
      
      <p style="font-size: 12px; color: #666;">
        {{RODO_FOOTER}}
      </p>
      
      <p style="font-size: 12px; color: #666;">
        Jeśli nie chcesz otrzymywać dalszych newsletterów, 
        <a href="{{UNSUBSCRIBE_LINK}}">kliknij tutaj aby się wypisać</a>.
      </p>
    `,
    placeholders: {
      FIRST_NAME: 'Jan',
      COMPANY_NAME: 'Nasza Firma',
      UNSUBSCRIBE_LINK: unsubscribeLink,
      RODO_FOOTER: 'Przetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych. Mają Państwo prawo do wycofania zgody w dowolnym momencie.'
    },
    headers: {
      'List-Unsubscribe': `<${unsubscribeLink}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  });

  console.log('Wynik wysyłki newslettera:', result);
  console.log('Link do wypisania:', unsubscribeLink);
}

// ========================================
// PRZYKŁAD 6: Test połączenia SMTP
// ========================================

async function przykład6_testPołączenia() {
  console.log('=== Przykład 6: Test połączenia SMTP ===');

  const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@gmail.com',
      pass: 'app-password'
    }
  };

  const testResult = await Mail.testSMTPConnection(smtpConfig);
  console.log('Test połączenia SMTP:', testResult);

  // Test walidacji emaila
  const emails = [
    'prawidlowy@example.com',
    'nieprawidlowy-email',
    'brak@domeny',
    '@example.com',
    'test@'
  ];

  emails.forEach(email => {
    const isValid = Mail.validateEmail(email);
    console.log(`Email ${email}: ${isValid ? 'PRAWIDŁOWY' : 'NIEPRAWIDŁOWY'}`);
  });
}

// ========================================
// PRZYKŁAD 7: Integracja z systemem mailingowym
// ========================================

async function przykład7_systemMailingowy() {
  console.log('=== Przykład 7: System mailingowy ===');

  // Symulacja danych z bazy danych
  const campaign = {
    id: 1,
    name: 'Kampania Black Friday',
    subject: 'Mega wyprzedaż {{DISCOUNT}}% - tylko dzisiaj!',
    htmlContent: `
      <h1>🔥 Black Friday w {{COMPANY_NAME}}!</h1>
      <p>Cześć {{FIRST_NAME}}!</p>
      <p>Specjalnie dla Ciebie przygotowaliśmy <strong>{{DISCOUNT}}% zniżki</strong> na wszystkie produkty!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{WEBSITE_URL}}/shop?code={{PROMO_CODE}}" 
           style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
          SKORZYSTAJ TERAZ
        </a>
      </div>
      <p>Promocja ważna tylko do północy!</p>
      <hr>
      <p style="font-size: 12px;">{{RODO_FOOTER}}</p>
      <p style="font-size: 12px;">
        <a href="{{UNSUBSCRIBE_LINK}}">Wypisz się z newslettera</a>
      </p>
    `
  };

  const customer = {
    id: 1,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: 'sender@example.com',
    smtpPass: 'password123',
    companyName: 'SuperSkład',
    rodoFooter: 'Dane przetwarzane zgodnie z RODO...'
  };

  const subscribers = [
    { email: 'jan@example.com', firstName: 'Jan', promoCode: 'JAN50' },
    { email: 'anna@example.com', firstName: 'Anna', promoCode: 'ANNA50' },
    { email: 'piotr@example.com', firstName: 'Piotr', promoCode: 'PIOTR50' }
  ];

  // Przygotuj emaile do wysyłki
  const emailsToSend = subscribers.map(subscriber => ({
    to: subscriber.email,
    subject: campaign.subject,
    html: campaign.htmlContent,
    placeholders: {
      FIRST_NAME: subscriber.firstName,
      COMPANY_NAME: customer.companyName,
      DISCOUNT: '50',
      PROMO_CODE: subscriber.promoCode,
      WEBSITE_URL: 'https://superskład.com',
      RODO_FOOTER: customer.rodoFooter,
      UNSUBSCRIBE_LINK: Mail.generateUnsubscribeLink(
        subscriber.email,
        'https://superskład.com',
        'token_' + subscriber.email.replace('@', '_')
      )
    }
  }));

  // Wyślij masowo
  const result = await Mail.sendBulkEmails({
    smtp: {
      host: customer.smtpHost,
      port: customer.smtpPort,
      auth: {
        user: customer.smtpUser,
        pass: customer.smtpPass
      }
    },
    from: customer.smtpUser,
    emails: emailsToSend,
    batchSize: 25,
    delay: 200
  });

  console.log('Wyniki kampanii mailingowej:', result);
}

// ========================================
// URUCHOMIENIE PRZYKŁADÓW
// ========================================

async function uruchomPrzykłady() {
  try {
    // Uwaga: Te przykłady wymagają prawdziwej konfiguracji SMTP
    // Odkomentuj te które chcesz przetestować
    
    // await przykład1_podstawoweWysyłanie();
    // await przykład1b_selfSignedCertyfikaty();
    // await przykład2_masoweWysyłanie();
    // await przykład3_bezpośrednieWysyłanie();
    await przykład4_szablonyBlokowe();
    // await przykład5_newsletterZWypisaniem();
    await przykład6_testPołączenia();
    // await przykład7_systemMailingowy();
    
  } catch (error) {
    console.error('Błąd podczas uruchamiania przykładów:', error);
  }
}

// Uruchom jeśli plik jest wykonywany bezpośrednio
if (import.meta.url === `file://${process.argv[1]}`) {
  uruchomPrzykłady();
}

export {
  przykład1_podstawoweWysyłanie,
  przykład1b_selfSignedCertyfikaty,
  przykład2_masoweWysyłanie,
  przykład3_bezpośrednieWysyłanie,
  przykład4_szablonyBlokowe,
  przykład5_newsletterZWypisaniem,
  przykład6_testPołączenia,
  przykład7_systemMailingowy
};