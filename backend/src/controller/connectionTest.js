import nodemailer from 'nodemailer';
import Imap from 'imap';

/**
 * Test połączenia SMTP
 * POST /mailing/test-smtp
 * Body: { host, port, user, pass, secure, allowSelfSigned }
 */
async function testSmtpConnection(req, res) {
  try {
    const { host, port, user, pass, secure, allowSelfSigned } = req.body;

    // Walidacja wymaganych pól
    if (!host || !port || !user || !pass) {
      return res.status(400).json({
        success: false,
        error: 'Brak wymaganych pól: host, port, user, pass'
      });
    }

    console.log(`🔧 [TestSMTP] Testowanie połączenia: ${host}:${port} user=${user} secure=${secure} allowSelfSigned=${allowSelfSigned}`);

    // Konfiguracja transportera
    const transportConfig = {
      host: host,
      port: parseInt(port),
      secure: secure === true, // true dla 465, false dla innych portów
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        rejectUnauthorized: !allowSelfSigned
      }
    };

    // Utworzenie transportera
    const transporter = nodemailer.createTransport(transportConfig);

    // Test połączenia
    const startTime = Date.now();
    await transporter.verify();
    const duration = Date.now() - startTime;

    console.log(`✅ [TestSMTP] Połączenie udane w ${duration}ms`);

    return res.json({
      success: true,
      message: 'Połączenie SMTP udane',
      duration: duration,
      config: {
        host: host,
        port: port,
        user: user,
        secure: secure,
        allowSelfSigned: allowSelfSigned
      }
    });

  } catch (error) {
    console.error('❌ [TestSMTP] Błąd połączenia:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      command: error.command
    });
  }
}

/**
 * Test połączenia IMAP
 * POST /mailing/test-imap
 * Body: { host, port, user, pass, tls, allowSelfSigned, folder }
 */
async function testImapConnection(req, res) {
  try {
    const { host, port, user, pass, tls, allowSelfSigned, folder } = req.body;

    // Walidacja pól
    if (!host || !port || !user || !pass) {
      return res.status(400).json({
        success: false,
        error: 'Brak wymaganych pól: host, port, user, pass'
      });
    }

    const folderToCheck = folder || 'INBOX';
    console.log(`🔧 [TestIMAP] Testowanie połączenia: ${host}:${port} user=${user} tls=${tls} allowSelfSigned=${allowSelfSigned} folder=${folderToCheck}`);

    const imapConfig = {
      user,
      password: pass,
      host,
      port: parseInt(port),
      tls: tls !== false,
      tlsOptions: { rejectUnauthorized: !allowSelfSigned },
      connTimeout: 10000,
      authTimeout: 10000
    };

    const startTime = Date.now();

    const result = await new Promise((resolve, reject) => {
      const imap = new Imap(imapConfig);
      let mailboxInfo = null;
      let connectionSuccess = false;
      let alreadyDone = false;

      const done = (data, isError = false) => {
        if (alreadyDone) return;
        alreadyDone = true;
        try { imap.end(); } catch (_) {}
        if (isError) reject(data);
        else resolve(data);
      };

      imap.once('ready', () => {
        connectionSuccess = true;
        console.log(`✅ [TestIMAP] Połączono w ${Date.now() - startTime}ms`);

        imap.openBox(folderToCheck, true, (err, box) => {
          if (err) {
            console.error(`❌ [TestIMAP] Błąd otwarcia folderu ${folderToCheck}:`, err.message);
            return done(new Error(`Nie można otworzyć folderu ${folderToCheck}: ${err.message}`), true);
          }

          console.log(`✅ [TestIMAP] Folder ${folderToCheck} otwarty - liczba wiadomości: ${box.messages.total}`);
          mailboxInfo = {
            folder: folderToCheck,
            totalMessages: box.messages.total,
            newMessages: box.messages.new,
            unseenMessages: box.messages.unseen
          };

          imap.closeBox(true, (closeErr) => {
            if (closeErr) console.warn(`⚠️ [TestIMAP] Błąd zamykania folderu: ${closeErr.message}`);
            done({
              duration: Date.now() - startTime,
              mailboxInfo
            });
          });
        });
      });

      imap.once('error', (err) => {
        // Jeśli ECONNRESET po udanym połączeniu — traktujemy jako normalne zakończenie
        if (err.message.includes('ECONNRESET') && connectionSuccess && mailboxInfo) {
          console.warn('⚠️ [TestIMAP] ECONNRESET przy zamykaniu — ignorowane (serwer zamknął gniazdo)');
          return done({
            duration: Date.now() - startTime,
            mailboxInfo
          });
        }

        console.error('❌ [TestIMAP] Błąd połączenia:', err.message);
        done(err, true);
      });

      imap.once('end', () => {
        if (!alreadyDone && connectionSuccess && mailboxInfo) {
          console.log(`🔚 [TestIMAP] Połączenie zakończone poprawnie (${Date.now() - startTime}ms)`);
          done({
            duration: Date.now() - startTime,
            mailboxInfo
          });
        } else if (!alreadyDone && !connectionSuccess) {
          done(new Error('Połączenie zakończone bez sukcesu'), true);
        }
      });

      // Timeout awaryjny
      setTimeout(() => {
        if (!alreadyDone) {
          console.error('⏱️ [TestIMAP] Timeout połączenia (10s)');
          done(new Error('Timeout połączenia (10s)'), true);
        }
      }, 10000);

      imap.connect();
    });

    // Zwracamy wynik
    return res.json({
      success: true,
      message: 'Połączenie IMAP udane',
      duration: result.duration,
      mailbox: result.mailboxInfo,
      config: {
        host,
        port,
        user,
        tls,
        allowSelfSigned,
        folder: folderToCheck
      }
    });

  } catch (error) {
    console.error('❌ [TestIMAP] Błąd połączenia:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || error.source
    });
  }
}

export {
  testSmtpConnection,
  testImapConnection
};
