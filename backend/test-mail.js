/**
 * Test klasy Mail - szybka weryfikacja funkcjonalności
 */

import Mail from './src/include/mail.js';

async function testMailClass() {
  console.log('=== Test klasy Mail ===\n');

  // Test 1: Walidacja adresów email
  console.log('1. Test walidacji emaili:');
  const emails = [
    'test@example.com',
    'invalid-email',
    'user@domain.co.uk',
    'bad@',
    '@domain.com'
  ];
  
  emails.forEach(email => {
    const isValid = Mail.validateEmail(email);
    console.log(`   ${email}: ${isValid ? '✓ PRAWIDŁOWY' : '✗ NIEPRAWIDŁOWY'}`);
  });
  console.log('');

  // Test 2: Przetwarzanie placeholderów
  console.log('2. Test placeholderów:');
  const htmlTemplate = `
    <h1>Witaj {{FIRST_NAME|Użytkowniku}}!</h1>
    <p>Dzisiaj jest {{CURRENT_DATE}} w firmie {{COMPANY_NAME}}.</p>
    <p>Twój kod: {{PROMO_CODE|BRAK}}</p>
  `;
  
  const processed = Mail.processPlaceholders(htmlTemplate, {
    FIRST_NAME: 'Jan',
    PROMO_CODE: 'JAN2025'
  });
  
  console.log('   Szablon HTML po przetworzeniu:');
  console.log(processed);
  console.log('');

  // Test 3: Generowanie Message-ID
  console.log('3. Test generowania Message-ID:');
  const messageId1 = Mail.generateMessageId();
  const messageId2 = Mail.generateMessageId();
  console.log(`   Message-ID 1: ${messageId1}`);
  console.log(`   Message-ID 2: ${messageId2}`);
  console.log(`   Unikalne: ${messageId1 !== messageId2 ? '✓ TAK' : '✗ NIE'}`);
  console.log('');

  // Test 4: Generowanie linku wypisania
  console.log('4. Test linku wypisania:');
  const unsubscribeLink = Mail.generateUnsubscribeLink(
    'test@example.com',
    'https://example.com',
    'token123'
  );
  console.log(`   Link: ${unsubscribeLink}`);
  console.log('');

  // Test 5: Renderowanie szablonu blokowego
  console.log('5. Test szablonu blokowego:');
  const blocks = [
    {
      type: 'text',
      content: {
        text: 'Witaj {{FIRST_NAME}}!',
        fontSize: 24,
        color: '#2c3e50',
        fontWeight: 'bold'
      },
      style: {
        textAlign: 'center',
        marginBottom: 20
      }
    },
    {
      type: 'button',
      content: {
        text: 'Kliknij tutaj',
        url: '{{WEBSITE_URL}}/action',
        backgroundColor: '#e74c3c'
      }
    }
  ];

  const renderedTemplate = Mail.renderTemplate(blocks, {
    FIRST_NAME: 'Anna',
    WEBSITE_URL: 'https://example.com'
  });
  
  console.log('   Renderowany szablon (pierwsze 200 znaków):');
  console.log('   ' + renderedTemplate.substring(0, 200) + '...');
  console.log('');

  // Test 6: Test połączenia SMTP (z nieprawidłowymi danymi - powinien się nie udać)
  console.log('6. Test połączenia SMTP (z nieprawidłowymi danymi):');
  try {
    const smtpTest = await Mail.testSMTPConnection({
      host: 'nonexistent-smtp-server.test',
      port: 587,
      auth: { user: 'test', pass: 'test' }
    });
    
    console.log(`   Wynik: ${smtpTest.success ? '✓ SUKCES' : '✗ BŁĄD'}`);
    console.log(`   Wiadomość: ${smtpTest.message}`);
    if (!smtpTest.success) {
      console.log(`   Błąd: ${smtpTest.error}`);
    }
  } catch (error) {
    console.log('   ✗ BŁĄD:', error.message);
  }
  console.log('');

  console.log('=== Koniec testów ===');
  console.log('Klasa Mail jest gotowa do użycia!');
  console.log('');
  console.log('Aby przetestować rzeczywiste wysyłanie emaili, użyj:');
  console.log('- Mail.sendEmail() dla pojedynczych emaili');
  console.log('- Mail.sendBulkEmails() dla masowego wysyłania');
  console.log('- Mail.sendDirectEmail() dla bezpośredniego wysyłania');
  console.log('');
  console.log('Przykład użycia w examples/mail-examples.js');
}

// Uruchom test
testMailClass().catch(console.error);

export default testMailClass;