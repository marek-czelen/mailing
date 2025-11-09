import EnvironmentConfig from '../config/environment.config.js';
import MarketingCampanies from '../models/marketingCampanies.model.js';
import Customers from '../models/customers.model.js';
import CampaignReply from '../models/campaignReply.model.js';
import MailAddress from '../models/mailAddress.model.js';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import { Op } from 'sequelize';
import { ImapFlow } from 'imapflow';
import crypto from 'crypto';

// Włącza szczegółowe logi gdy CHECK_MAILBOX_DEBUG=true/1/yes/on lub w trybie development
const DEBUG_MAILBOX = ['true', '1', 'yes', 'on'].includes(String(EnvironmentConfig.get('CHECK_MAILBOX_DEBUG', EnvironmentConfig.isDevelopment())).toLowerCase());

/**
 * CheckMailboxTask
 * -----------------
 * Cycliczne zadanie monitorujące skrzynki pocztowe kampanii marketingowych w celu
 * wykrycia odpowiedzi (replies) od odbiorców mailingu.
 * Konfiguracja skrzynki definiowana jest na poziomie kampanii (pola reply* w modelu MarketingCampanies).
 * Na razie przetwarzanie odpowiedzi jest mockowane.
 */
class CheckMailboxTask {
    static interval = EnvironmentConfig.get('CHECK_MAILBOX_INTERVAL', 60000); // domyślnie 5 min

    /**
     * Główna pętla sprawdzania skrzynek włączonych kampanii
     */
    static async checkMailboxes() {
        const now = new Date();
        if (DEBUG_MAILBOX) {
            console.log(`📥 [CheckMailboxTask] Start mailbox scan @ ${now.toISOString()} interval=${CheckMailboxTask.interval}`);
        }
        try {
            // Pobierz kampanie, które mają aktywne sprawdzanie skrzynki i nie zostały zakończone (opcjonalnie: dateEnd > now)
            const campaigns = await MarketingCampanies.findAll({
                where: {
                    replyCheckEnabled: true,
                    active: true,
                    sent: true, // sprawdzamy odpowiedzi tylko dla kampanii już wysłanych
                    dateStart: { [Op.lte]: now },
                    // Można dodać dodatkowy warunek: dateEnd: { [Op.gte]: now }
                },
                include: [{ model: Customers, as: 'Customer' }]
            });

            if (campaigns.length === 0) {
                if (DEBUG_MAILBOX) console.log('📥 [CheckMailboxTask] Brak kampanii do sprawdzenia.');
                return;
            }

            for (const campaign of campaigns) {
                try {
                    const {
                        replyMailboxHost: host,
                        replyMailboxPort: port,
                        replyMailboxUser: user,
                        replyMailboxPass: pass,
                        replyMailboxProtocol: protocol,
                        replyMailboxFolder: folder,
                        replyMailboxTls: tls,
                        replyMailboxAllowSelfSigned: allowSelfSigned
                    } = campaign;

                    if (!host || !user || !pass) {
                        console.warn(`⚠️ [CheckMailboxTask] Kampania ${campaign.id} nie ma pełnej konfiguracji skrzynki (host/user/pass) - pomijam.`);
                        continue;
                    }
                    if (DEBUG_MAILBOX) {
                        console.log(`🔧 [CheckMailboxTask] Kampania ${campaign.id} proto=${(protocol || 'IMAP').toUpperCase()} host=${host} port=${port} folder=${folder} tls=${tls} allowSelfSigned=${allowSelfSigned}`);
                    }

                    let fetchedReplies = [];
                    const fetchTimeout = EnvironmentConfig.get('CHECK_MAILBOX_FETCH_TIMEOUT', 120000);

                    // Tylko IMAP jest wspierany
                    const proto = (protocol || 'IMAP').toUpperCase();
                    if (proto !== 'IMAP') {
                        console.warn(`⚠️ [CheckMailboxTask] Kampania ${campaign.id}: Protokół ${proto} nie jest wspierany. Obsługujemy wyłącznie IMAP.`);
                        continue;
                    }

                    try {
                        fetchedReplies = await Promise.race([
                            CheckMailboxTask.fetchImapMessages({ host, port, user, pass, folder, tls, allowSelfSigned }),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('IMAP fetch timeout')), fetchTimeout))
                        ]);
                    } catch (fetchErr) {
                        console.error(`❌ [CheckMailboxTask] Błąd pobierania dla kampanii ${campaign.id}: ${fetchErr?.message || fetchErr}`);
                        if (DEBUG_MAILBOX && fetchErr?.stack) console.error(fetchErr.stack);
                        continue; // Pomijamy tę kampanię i przechodzimy do następnej
                    }

                    if (DEBUG_MAILBOX) {
                        console.log(`🔧 [CheckMailboxTask] Kampania ${campaign.id} proto=${(protocol || 'IMAP').toUpperCase()} host=${host} port=${port} tls=${tls} allowSelfSigned=${allowSelfSigned} fetchedReplies.length=${fetchedReplies.length}`);
                    }

                    if (fetchedReplies.length) {
                        await CheckMailboxTask.processReplies(campaign, fetchedReplies);
                        if (DEBUG_MAILBOX) {
                            console.log(`✅ [CheckMailboxTask] Finished processing replies for campaign ${campaign.id}`);
                        }
                    } else if (DEBUG_MAILBOX) {
                        console.log(`📥 [CheckMailboxTask] Kampania ${campaign.id} (${campaign.name}) - brak nowych wiadomości.`);
                    }
                } catch (innerErr) {
                    console.error(`❌ [CheckMailboxTask] Błąd podczas sprawdzania kampanii ${campaign.id}:`, innerErr?.message || innerErr);
                    if (DEBUG_MAILBOX && innerErr?.stack) console.error(innerErr.stack);
                }
            }
        } catch (err) {
            console.error('❌ [CheckMailboxTask] Błąd główny zadania:', err?.message || err);
            if (DEBUG_MAILBOX && err?.stack) console.error(err.stack);
        }
    }

    /**
     * Przetwarzanie odpowiedzi: deduplikacja, mapowanie kontaktów, zapis do bazy.
     * - Deduplikacja po reply_hash (nawet jeśli brak message_id).
     * - Próba znalezienia mail_address_id w bazie kontaktów kampanii po from_email.
     * - Zapis każdej odpowiedzi do tabeli campaign_replies.
     * - Obsługa wielu odpowiedzi z tego samego adresu (każda zapisywana osobno).
     */
    static async processReplies(campaign, replies) {
        if (!replies.length) return;

        let saved = 0, duplicates = 0, errors = 0;

    for (const reply of replies) {
            try {
        const { from, subject, date, messageId, hash, uid, index, inReplyTo, references } = reply;

                // Sprawdź czy taka odpowiedź już istnieje (deduplikacja po hash)
                const existing = await CampaignReply.findOne({
                    where: { replyHash: hash }
                });

                if (existing) {
                    duplicates++;
                    if (DEBUG_MAILBOX) {
                        console.log(`⏭️ [ProcessReply] Duplikat hash=${hash} campaignId=${campaign.id} from=${from}`);
                    }
                    continue;
                }

                // Parsuj adres email z nagłówka From (może zawierać format: "Name <email@domain.com>")
                let cleanEmail = from;
                if (from && from.includes('<')) {
                    const match = from.match(/<([^>]+)>/);
                    if (match) cleanEmail = match[1];
                }
                cleanEmail = (cleanEmail || '').trim().toLowerCase();

                // 1) Najpierw spróbuj jednoznacznego mapowania po In-Reply-To/References -> message_id z wyników wysyłki
                let targetCampaignId = campaign.id;
                let mailAddressId = null;
                const refIds = [];
                if (inReplyTo) refIds.push(inReplyTo);
                if (Array.isArray(references)) refIds.push(...references);
                if (refIds.length) {
                    const sent = await MarketingCampaniesMailingResult.findOne({
                        where: { messageId: { [Op.in]: refIds } },
                        order: [['sendDate', 'DESC']]
                    });
                    if (sent) {
                        targetCampaignId = sent.marketingCampaniesId || targetCampaignId;
                        mailAddressId = sent.mailAddressesId || mailAddressId;
                        if (DEBUG_MAILBOX) console.log(`🎯 [ProcessReply] Mapowanie po In-Reply-To/References => campaignId=${targetCampaignId}, mailAddressId=${mailAddressId}`);
                    }
                }

                // 2) Fallback: szukaj kontaktu po e-mailu w ramach databaseId kampanii z pętli
                if (!mailAddressId && cleanEmail && campaign.databaseId) {
                    const mailAddress = await MailAddress.findOne({
                        where: {
                            databaseId: campaign.databaseId,
                            mail_address: cleanEmail
                        }
                    });
                    if (mailAddress) {
                        mailAddressId = mailAddress.id;
                        if (DEBUG_MAILBOX) console.log(`🔗 [ProcessReply] Fallback kontakt mail_address_id=${mailAddressId} dla ${cleanEmail}`);
                    } else if (DEBUG_MAILBOX) {
                        console.log(`❓ [ProcessReply] Fallback: brak kontaktu dla ${cleanEmail} (databaseId=${campaign.databaseId})`);
                    }
                }

                // Przygotuj body_preview (opcjonalnie można pobrać z treści, na razie pusty)
                const bodyPreview = null;

                // Parsuj datę
                let receivedAt = new Date();
                if (date) {
                    try {
                        receivedAt = new Date(date);
                        if (isNaN(receivedAt.getTime())) receivedAt = new Date();
                    } catch {
                        receivedAt = new Date();
                    }
                }

                // Zapisz odpowiedź do bazy
                await CampaignReply.create({
                    campaignId: targetCampaignId,
                    mailAddressId,
                    fromEmail: cleanEmail || from || 'unknown',
                    subject: subject || '(brak tematu)',
                    receivedAt,
                    messageId: messageId || null,
                    replyHash: hash,
                    bodyPreview
                });

                // Aktualizacja rekordu wysyłki (oznacz odpowiedź / przeczytanie) jeśli mamy mailAddressId i referencję
                try {
                    if (mailAddressId && (inReplyTo || (references && references.length))) {
                        const refMatchIds = [];
                        if (inReplyTo) refMatchIds.push(inReplyTo);
                        if (Array.isArray(references)) refMatchIds.push(...references);
                        if (refMatchIds.length) {
                            const orig = await MarketingCampaniesMailingResult.findOne({
                                where: { messageId: { [Op.in]: refMatchIds } },
                                order: [['sendDate', 'DESC']]
                            });
                            if (orig) {
                                await MarketingCampaniesMailingResult.update({
                                    isReaded: true,
                                    responsDate: new Date()
                                }, { where: { marketingCampaniesId: orig.marketingCampaniesId, mailAddressesId: orig.mailAddressesId } });
                                if (DEBUG_MAILBOX) console.log(`📝 [ProcessReply] Zaktualizowano wynik wysyłki (responsDate/isReaded) campaignId=${orig.marketingCampaniesId} mailAddressesId=${orig.mailAddressesId}`);
                            }
                        }
                    }
                } catch (updErr) {
                    if (DEBUG_MAILBOX) console.warn('⚠️ [ProcessReply] Nie udało się zaktualizować wyniku wysyłki:', updErr?.message || updErr);
                }

                saved++;
                console.log(`✅ [ProcessReply] Zapisano odpowiedź: campaignId=${targetCampaignId} from=${cleanEmail || from} subj='${subject || ''}' hash=${hash}`);

            } catch (err) {
                errors++;
                console.error(`❌ [ProcessReply] Błąd zapisu odpowiedzi dla kampanii ${campaign.id}:`, err?.message || err);
                if (DEBUG_MAILBOX && err?.stack) console.error(err.stack);
            }
        }

        console.log(`📊 [ProcessReply] Kampania ${campaign.id}: zapisano=${saved}, duplikaty=${duplicates}, błędy=${errors}, łącznie=${replies.length}`);
    }

    static async fetchImapMessages({ host, port, user, pass, folder = 'INBOX', maxMessages = 10, tls = null, allowSelfSigned = false }) {
        // Jeśli tls jawnie podane, używamy tej wartości; jeśli nie, domyślnie true dla 993
        const secure = tls !== null ? !!tls : (port === 993);
        const tlsOptions = {};
        if (allowSelfSigned) {
            tlsOptions.rejectUnauthorized = false;
        }
        const client = new ImapFlow({
            host,
            port,
            secure,
            tls: tlsOptions,
            auth: { user, pass },
            logger: false
        });
        const results = [];
        try {
            const start = Date.now();
            if (DEBUG_MAILBOX) console.log(`➡️ [IMAP] Connecting secure=${secure} allowSelfSigned=${allowSelfSigned}`);
            await client.connect();
            if (DEBUG_MAILBOX) console.log(`✅ [IMAP] Connected in ${Date.now() - start}ms`);
            await client.mailboxOpen(folder);
            if (DEBUG_MAILBOX) console.log(`📂 [IMAP] Opened mailbox ${folder}`);
            const uids = await client.search({ seen: false }, { uid: true });
            if (DEBUG_MAILBOX) console.log(`🔎 [IMAP] Found UNSEEN count=${uids.length}`);
            const slice = uids.slice(-maxMessages);
            for (const uid of slice) {
                // fetchOne akceptuje UID jeśli przekażemy { uid: true }
                const msg = await client.fetchOne(uid, { uid: true, envelope: true, internalDate: true });
                const fromAddress = (msg?.envelope?.from && msg.envelope.from[0] && (msg.envelope.from[0].address || msg.envelope.from[0].addr)) || null;
                results.push({
                    uid,
                    subject: msg?.envelope?.subject || null,
                    from: fromAddress,
                    date: msg?.internalDate || null,
                    messageId: msg?.envelope?.messageId || null,
                    inReplyTo: msg?.envelope?.inReplyTo || null,
                    references: Array.isArray(msg?.envelope?.references) ? msg.envelope.references : (msg?.envelope?.references ? [msg.envelope.references] : []),
                    hash: crypto.createHash('sha1').update(String((msg?.envelope?.messageId) || uid)).digest('hex')
                });
                if (DEBUG_MAILBOX) console.log(`✉️ [IMAP] uid=${uid} from=${fromAddress} subj='${msg?.envelope?.subject || ''}'`);
            }
            if (slice.length) {
                await client.messageFlagsAdd(slice, ['\\Seen'], { uid: true });
                if (DEBUG_MAILBOX) console.log(`👁️ [IMAP] Marked ${slice.length} msgs as Seen`);
            }
        } catch (err) {
            console.error('❌ [CheckMailboxTask] IMAP fetch error:', err?.message || err);
            if (DEBUG_MAILBOX && err?.stack) console.error(err.stack);
        } finally {
            try { await client.logout(); } catch { }
        }
        return results;
    }

    // POP3 usunięty – obsługujemy wyłącznie IMAP



    /**
     * Wrapper zapewniający, że błędy async nie crashują tasku
     */
    static async safeCheckMailboxes() {
        try {
            await CheckMailboxTask.checkMailboxes();
        } catch (err) {
            console.error('❌ [CheckMailboxTask] Nieobsłużony błąd w checkMailboxes:', err?.message || err);
            if (DEBUG_MAILBOX && err?.stack) console.error(err.stack);
        }
    }

    /**
     * Uruchamia cykliczne skanowanie skrzynek.
     */
    static run() {
        console.log(`📥 CheckMailboxTask uruchomiony - interwał: ${CheckMailboxTask.interval}ms debug=${DEBUG_MAILBOX}`);
        CheckMailboxTask.safeCheckMailboxes(); // pierwsze uruchomienie
        setInterval(() => CheckMailboxTask.safeCheckMailboxes(), CheckMailboxTask.interval);
    }
}

export default CheckMailboxTask;
