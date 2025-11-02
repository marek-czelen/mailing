/**
 * Przykład obsługi self-signed certyfikatów w klasie Mail
 * Pokazuje różne sposoby wyłączenia weryfikacji certyfikatów SSL/TLS
 */

import Mail from '../src/include/mail.js';

// ========================================
// PRZYKŁAD 1: Ignorowanie certyfikatów przez opcję ignoreTLS
// ========================================

async function przykładIgnoreTLS() {
  console.log('=== Przykład 1: Użycie opcji ignoreTLS ===');
  
  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.twoj-serwer.com',
      port: 587,
      secure: false,
      ignoreTLS: true,  // <-- Ta opcja wyłącza weryfikację certyfikatów
      auth: {
        user: 'user@twoj-serwer.com',
        pass: 'password'
      }
    },
    from: 'sender@twoj-serwer.com',
    to: 'recipient@example.com',
    subject: 'Test z ignoreTLS',
    html: '<p>Email wysłany z wyłączoną weryfikacją certyfikatów</p>'
  });

  console.log('Wynik:', result);
}

// ========================================
// PRZYKŁAD 2: Jawne ustawienie rejectUnauthorized = false
// ========================================

async function przykładRejectUnauthorized() {
  console.log('=== Przykład 2: Użycie rejectUnauthorized = false ===');
  
  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.twoj-serwer.com',
      port: 587,
      secure: false,
      rejectUnauthorized: false,  // <-- Jawnie wyłącza weryfikację
      auth: {
        user: 'user@twoj-serwer.com',
        pass: 'password'
      }
    },
    from: 'sender@twoj-serwer.com',
    to: 'recipient@example.com',
    subject: 'Test z rejectUnauthorized = false',
    html: '<p>Email z jawnie wyłączoną weryfikacją certyfikatów</p>'
  });

  console.log('Wynik:', result);
}

// ========================================
// PRZYKŁAD 3: Użycie zmiennej środowiskowej
// ========================================

async function przykładZmiennaŚrodowiskowa() {
  console.log('=== Przykład 3: Użycie zmiennej środowiskowej ===');
  
  // Ustaw zmienną środowiskową
  process.env.IGNORE_TLS = 'true';
  
  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.twoj-serwer.com',
      port: 587,
      secure: false,
      // Nie trzeba nic więcej - zmienna środowiskowa załatwi sprawę
      auth: {
        user: 'user@twoj-serwer.com',
        pass: 'password'
      }
    },
    from: 'sender@twoj-serwer.com',
    to: 'recipient@example.com',
    subject: 'Test ze zmienną IGNORE_TLS',
    html: '<p>Email z wyłączoną weryfikacją przez zmienną środowiskową</p>'
  });

  console.log('Wynik:', result);
}

// ========================================
// PRZYKŁAD 4: Zaawansowana konfiguracja TLS
// ========================================

async function przykładZaawansowanaTLS() {
  console.log('=== Przykład 4: Zaawansowana konfiguracja TLS ===');
  
  const result = await Mail.sendEmail({
    smtp: {
      host: 'smtp.twoj-serwer.com',
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: false,
        // Dodatkowe opcje TLS dla problemów z certyfikatami
        ciphers: 'SSLv3',
        secureProtocol: 'TLSv1_method'
      },
      auth: {
        user: 'user@twoj-serwer.com',
        pass: 'password'
      }
    },
    from: 'sender@twoj-serwer.com',
    to: 'recipient@example.com',
    subject: 'Test z zaawansowaną konfiguracją TLS',
    html: '<p>Email z custom konfiguracją TLS</p>'
  });

  console.log('Wynik:', result);
}

// ========================================
// PRZYKŁAD 5: Test połączenia z self-signed certyfikatem
// ========================================

async function testPołączeniaSelfSigned() {
  console.log('=== Przykład 5: Test połączenia SMTP z self-signed certyfikatem ===');
  
  const configs = [
    {
      name: 'Z weryfikacją (prawdopodobnie się nie uda)',
      config: {
        host: 'smtp.twoj-serwer.com',
        port: 587,
        auth: { user: 'user@twoj-serwer.com', pass: 'password' }
      }
    },
    {
      name: 'Bez weryfikacji (ignoreTLS)',
      config: {
        host: 'smtp.twoj-serwer.com',
        port: 587,
        ignoreTLS: true,
        auth: { user: 'user@twoj-serwer.com', pass: 'password' }
      }
    },
    {
      name: 'Bez weryfikacji (rejectUnauthorized = false)',
      config: {
        host: 'smtp.twoj-serwer.com',
        port: 587,
        rejectUnauthorized: false,
        auth: { user: 'user@twoj-serwer.com', pass: 'password' }
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`\n${name}:`);
    try {
      const result = await Mail.testSMTPConnection(config);
      console.log(`  ✓ ${result.success ? 'SUKCES' : 'BŁĄD'}: ${result.message}`);
      if (!result.success) {
        console.log(`  Błąd: ${result.error}`);
      }
    } catch (error) {
      console.log(`  ✗ WYJĄTEK: ${error.message}`);
    }
  }
}

// ========================================
// PRZYKŁAD 6: Masowe wysyłanie z ignorowaniem certyfikatów
// ========================================

async function przykładMasoweWysyłanieIgnoreTLS() {
  console.log('=== Przykład 6: Masowe wysyłanie z ignoreTLS ===');

  const emails = [
    {
      to: 'user1@example.com',
      subject: 'Newsletter 1',
      html: '<p>Treść newslettera dla {{FIRST_NAME}}</p>',
      placeholders: { FIRST_NAME: 'Jan' }
    },
    {
      to: 'user2@example.com', 
      subject: 'Newsletter 2',
      html: '<p>Treść newslettera dla {{FIRST_NAME}}</p>',
      placeholders: { FIRST_NAME: 'Anna' }
    }
  ];

  const result = await Mail.sendBulkEmails({
    smtp: {
      host: 'smtp.twoj-serwer.com',
      port: 587,
      secure: false,
      ignoreTLS: true,  // <-- Ignoruj certyfikaty dla wszystkich maili
      auth: {
        user: 'newsletter@twoj-serwer.com',
        pass: 'password'
      }
    },
    from: 'newsletter@twoj-serwer.com',
    emails: emails,
    batchSize: 10,
    delay: 100
  });

  console.log('Wyniki masowego wysyłania:', result);
}

// ========================================
// URUCHOMIENIE PRZYKŁADÓW
// ========================================

async function uruchomPrzykłady() {
  console.log('=== PRZYKŁADY OBSŁUGI SELF-SIGNED CERTYFIKATÓW ===\n');
  
  // UWAGA: Te przykłady wymagają prawdziwego serwera SMTP
  // Odkomentuj i dostosuj konfigurację do swojego serwera
  
  try {
    // await przykładIgnoreTLS();
    // await przykładRejectUnauthorized();
    // await przykładZmiennaŚrodowiskowa();
    // await przykładZaawansowanaTLS();
    await testPołączeniaSelfSigned();
    // await przykładMasoweWysyłanieIgnoreTLS();
    
  } catch (error) {
    console.error('Błąd podczas uruchamiania przykładów:', error);
  }
  
  console.log('\n=== PODSUMOWANIE ===');
  console.log('Dostępne opcje dla self-signed certyfikatów:');
  console.log('1. smtp.ignoreTLS = true');
  console.log('2. smtp.rejectUnauthorized = false');
  console.log('3. process.env.IGNORE_TLS = "true"');
  console.log('4. process.env.NODE_ENV = "development"');
  console.log('5. Zaawansowana konfiguracja przez smtp.tls = {...}');
  console.log('\nWybierz metodę która najlepiej pasuje do Twojego środowiska!');
}

// Uruchom przykłady
uruchomPrzykłady();

export {
  przykładIgnoreTLS,
  przykładRejectUnauthorized,
  przykładZmiennaŚrodowiskowa,
  przykładZaawansowanaTLS,
  testPołączeniaSelfSigned,
  przykładMasoweWysyłanieIgnoreTLS
};