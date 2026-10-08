import EnvironmentConfig from '../config/environment.config.js';
import MarketingCampanies from '../models/marketingCampanies.model.js';
import Customers from '../models/customers.model.js';
import CampaignReply from '../models/campaignReply.model.js';
import MailAddress from '../models/mailAddress.model.js';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import { Op } from 'sequelize';
import { ImapFlow } from 'imapflow';
import crypto from 'crypto';
import { simpleParser } from 'mailparser';

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
    static interval = EnvironmentConfig.get('CHECK_MAILBOX_INTERVAL', 600000); // domyślnie 10 min

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
                    const result = await CheckMailboxTask.checkCampaignMailbox(campaign);
                    if (DEBUG_MAILBOX) {
                        console.log(`🔧 [CheckMailboxTask] Kampania ${campaign.id} fetchedReplies.length=${result.fetchedCount}`);
                        if (result.fetchedCount) {
                            console.log(`✅ [CheckMailboxTask] Finished processing replies for campaign ${campaign.id}`);
                        } else {
                            console.log(`📥 [CheckMailboxTask] Kampania ${campaign.id} (${campaign.name}) - brak nowych wiadomości.`);
                        }
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

    static async checkCampaignMailbox(campaign, { maxMessages = 10 } = {}) {
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
            throw new Error('Kampania nie ma pełnej konfiguracji skrzynki IMAP (host/login/hasło).');
        }

        const proto = (protocol || 'IMAP').toUpperCase();
        if (proto !== 'IMAP') {
            throw new Error(`Protokół ${proto} nie jest wspierany. Obsługujemy wyłącznie IMAP.`);
        }

        if (DEBUG_MAILBOX) {
            console.log(`🔧 [CheckMailboxTask] Kampania ${campaign.id} proto=${proto} host=${host} port=${port} folder=${folder} tls=${tls} allowSelfSigned=${allowSelfSigned}`);
        }

        const fetchTimeout = EnvironmentConfig.get('CHECK_MAILBOX_FETCH_TIMEOUT', 120000);
        const { messages: fetchedReplies, mailboxMessageCount, unseenMessageCount } = await Promise.race([
            CheckMailboxTask.fetchImapMessages({ host, port, user, pass, folder, maxMessages, tls, allowSelfSigned }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('IMAP fetch timeout')), fetchTimeout))
        ]);
        const result = await CheckMailboxTask.processReplies(campaign, fetchedReplies);

        if (result.errorCount === 0 && fetchedReplies.length) {
            try {
                await CheckMailboxTask.markImapMessagesSeen(
                    { host, port, user, pass, folder, tls, allowSelfSigned },
                    fetchedReplies.map(reply => reply.uid)
                );
            } catch (error) {
                console.error(`❌ [CheckMailboxTask] Nie udało się oznaczyć wiadomości IMAP jako przeczytanych; zostaną ponowione:`, error?.message || error);
                throw new Error(`Nie udało się oznaczyć pobranych wiadomości jako przeczytanych: ${error?.message || error}`);
            }
        }

        return {
            mailboxMessageCount,
            unseenMessageCount,
            fetchedCount: fetchedReplies.length,
            ...result
        };
    }

    /**
     * Przetwarzanie odpowiedzi: deduplikacja, mapowanie kontaktów, zapis do bazy.
     * - Deduplikacja po reply_hash (nawet jeśli brak message_id).
     * - Próba znalezienia mail_address_id w bazie kontaktów kampanii po from_email.
     * - Zapis każdej odpowiedzi do tabeli campaign_replies.
     * - Obsługa wielu odpowiedzi z tego samego adresu (każda zapisywana osobno).
     */
    static async processReplies(campaign, replies) {
        if (!replies.length) {
            return { savedCount: 0, duplicateCount: 0, errorCount: 0 };
        }

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

                // Wykryj czy to bounce message
                const bounceInfo = CheckMailboxTask.detectBounce(reply);
                if (DEBUG_MAILBOX && bounceInfo.isBounce) {
                    console.log(`🔴 [ProcessReply] Bounce wykryty! type=${bounceInfo.bounceType} reason='${bounceInfo.bounceReason}' from=${from}`);
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
                // Normalizuj Message-ID: zawsze z nawiasami <>
                if (inReplyTo) {
                    const normalized = inReplyTo.startsWith('<') ? inReplyTo : `<${inReplyTo}>`;
                    refIds.push(normalized);
                }
                if (Array.isArray(references)) {
                    references.forEach(ref => {
                        const normalized = ref.startsWith('<') ? ref : `<${ref}>`;
                        refIds.push(normalized);
                    });
                }
                
                // 1a) Dla bounce: jeśli nie ma In-Reply-To/References, szukaj oryginalnego Message-ID w załącznikach
                if (bounceInfo.isBounce && refIds.length === 0 && uid) {
                    if (DEBUG_MAILBOX) console.log(`🔍 [ProcessReply] BOUNCE: brak In-Reply-To/References, szukam Message-ID w załącznikach...`);
                    
                    try {
                        const { replyMailboxHost, replyMailboxPort, replyMailboxUser, replyMailboxPass, 
                                replyMailboxTls, replyMailboxAllowSelfSigned } = campaign;
                        
                        const client = new ImapFlow({
                            host: replyMailboxHost,
                            port: replyMailboxPort || 993,
                            secure: replyMailboxTls !== false,
                            auth: {
                                user: replyMailboxUser,
                                pass: replyMailboxPass
                            },
                            tls: {
                                rejectUnauthorized: !replyMailboxAllowSelfSigned
                            },
                            logger: false
                        });

                        await client.connect();
                        await client.mailboxOpen(campaign.replyMailboxFolder || 'INBOX');
                        
                        const originalMessageId = await CheckMailboxTask.extractOriginalMessageIdFromBounce(client, uid);
                        
                        await client.logout();
                        
                        if (originalMessageId) {
                            refIds.push(originalMessageId);
                            if (DEBUG_MAILBOX) console.log(`✅ [ProcessReply] BOUNCE: znaleziono oryginalny Message-ID: ${originalMessageId}`);
                        }
                    } catch (error) {
                        console.error(`❌ [ProcessReply] BOUNCE: błąd przy ekstrakcji Message-ID:`, error.message);
                    }
                }
                
                if (refIds.length) {
                    const sent = await MarketingCampaniesMailingResult.findOne({
                        where: { messageId: { [Op.in]: refIds } },
                        order: [['sendDate', 'DESC']]
                    });
                    if (sent) {
                        targetCampaignId = sent.marketingCampaniesId || targetCampaignId;
                        mailAddressId = sent.mailAddressesId || mailAddressId;
                        if (DEBUG_MAILBOX) console.log(`🎯 [ProcessReply] Mapowanie po ${bounceInfo.isBounce ? 'oryginalnym' : ''} Message-ID => campaignId=${targetCampaignId}, mailAddressId=${mailAddressId}`);
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

                // 3) Specjalne mapowanie dla bounce: użyj recipientEmail z bounce info
                if (!mailAddressId && bounceInfo.isBounce && campaign.databaseId) {
                    let bounceRecipientEmail = bounceInfo.recipientEmail;
                    
                    // Jeśli nie znaleziono w nagłówkach, spróbuj parsować treść i załączniki
                    if (!bounceRecipientEmail && uid) {
                        if (DEBUG_MAILBOX) console.log(`🔍 [ProcessReply] BOUNCE: szukam adresu odbiorcy w treści wiadomości...`);
                        
                        // Potrzebujemy połączenia IMAP - użyjemy tego samego co było w fetchImapMessages
                        try {
                            const { replyMailboxHost, replyMailboxPort, replyMailboxUser, replyMailboxPass, 
                                    replyMailboxTls, replyMailboxAllowSelfSigned } = campaign;
                            
                            const client = new ImapFlow({
                                host: replyMailboxHost,
                                port: replyMailboxPort || 993,
                                secure: replyMailboxTls !== false,
                                auth: {
                                    user: replyMailboxUser,
                                    pass: replyMailboxPass
                                },
                                tls: {
                                    rejectUnauthorized: !replyMailboxAllowSelfSigned
                                },
                                logger: false
                            });

                            await client.connect();
                            await client.mailboxOpen(campaign.replyMailboxFolder || 'INBOX');
                            
                            bounceRecipientEmail = await CheckMailboxTask.extractRecipientFromBounceContent(client, uid);
                            
                            await client.logout();
                            
                            if (bounceRecipientEmail) {
                                if (DEBUG_MAILBOX) console.log(`✅ [ProcessReply] BOUNCE: znaleziono adres w treści: ${bounceRecipientEmail}`);
                            }
                        } catch (error) {
                            console.error(`❌ [ProcessReply] BOUNCE: błąd przy parsowaniu treści:`, error.message);
                        }
                    }
                    
                    if (bounceRecipientEmail) {
                        bounceRecipientEmail = bounceRecipientEmail.toLowerCase();
                        const mailAddress = await MailAddress.findOne({
                            where: {
                                databaseId: campaign.databaseId,
                                mail_address: bounceRecipientEmail
                            }
                        });
                        if (mailAddress) {
                            mailAddressId = mailAddress.id;
                            if (DEBUG_MAILBOX) console.log(`🔴 [ProcessReply] BOUNCE mapping: mail_address_id=${mailAddressId} dla ${bounceRecipientEmail}`);
                        } else if (DEBUG_MAILBOX) {
                            console.log(`⚠️ [ProcessReply] BOUNCE: nie znaleziono kontaktu dla ${bounceRecipientEmail} (databaseId=${campaign.databaseId})`);
                        }
                    } else if (DEBUG_MAILBOX) {
                        console.log(`❓ [ProcessReply] BOUNCE: nie udało się wyodrębnić adresu odbiorcy ani z nagłówków ani z treści`);
                    }
                }

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

                // Zapisz odpowiedź do bazy (bodyPreview i bodyFull będą NULL - pobierane na żądanie)
                await CampaignReply.create({
                    campaignId: targetCampaignId,
                    mailAddressId,
                    fromEmail: cleanEmail || from || 'unknown',
                    subject: subject || '(brak tematu)',
                    receivedAt,
                    messageId: messageId || null,
                    replyHash: hash,
                    imapUid: uid ? String(uid) : null,
                    bodyPreview: null,
                    bodyFull: null,
                    isRead: 0,
                    readAt: null,
                    isBounce: bounceInfo.isBounce ? 1 : 0,
                    bounceType: bounceInfo.bounceType || null,
                    bounceReason: bounceInfo.bounceReason || null
                });

                // Aktualizacja rekordu wysyłki (oznacz odpowiedź / przeczytanie) jeśli mamy mailAddressId i referencję
                try {
                    if (mailAddressId && (inReplyTo || (references && references.length))) {
                        const refMatchIds = [];
                        // Normalizuj Message-ID: zawsze z nawiasami <>
                        if (inReplyTo) {
                            const normalized = inReplyTo.startsWith('<') ? inReplyTo : `<${inReplyTo}>`;
                            refMatchIds.push(normalized);
                        }
                        if (Array.isArray(references)) {
                            references.forEach(ref => {
                                const normalized = ref.startsWith('<') ? ref : `<${ref}>`;
                                refMatchIds.push(normalized);
                            });
                        }
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

                // Obsługa bounce: dezaktywacja kontaktu przy hard bounce
                if (bounceInfo.isBounce && mailAddressId) {
                    try {
                        const mailAddressRecord = await MailAddress.findOne({ where: { id: mailAddressId } });
                        if (mailAddressRecord) {
                            const currentBounceCount = mailAddressRecord.bounceCount || 0;
                            const newBounceCount = currentBounceCount + 1;
                            
                            // Hard bounce - natychmiastowa dezaktywacja
                            if (bounceInfo.bounceType === 'hard') {
                                await mailAddressRecord.update({
                                    active: 0,
                                    deliveryStatus: 'undeliverable',
                                    bounceDate: new Date(),
                                    bounceReason: bounceInfo.bounceReason,
                                    bounceCount: newBounceCount
                                });
                                console.log(`🚫 [ProcessReply] HARD BOUNCE: Dezaktywowano kontakt mailAddressId=${mailAddressId} email=${cleanEmail} count=${newBounceCount} reason='${bounceInfo.bounceReason}'`);
                            } 
                            // Soft bounce - zwiększ licznik, dezaktywuj po 3 soft bounces
                            else if (bounceInfo.bounceType === 'soft') {
                                const shouldDeactivate = newBounceCount >= 3;
                                
                                await mailAddressRecord.update({
                                    active: shouldDeactivate ? 0 : mailAddressRecord.active,
                                    bounceDate: new Date(),
                                    bounceReason: bounceInfo.bounceReason,
                                    bounceCount: newBounceCount
                                });
                                
                                if (shouldDeactivate) {
                                    console.log(`🚫 [ProcessReply] SOFT BOUNCE x3: Dezaktywowano kontakt mailAddressId=${mailAddressId} email=${cleanEmail} count=${newBounceCount}`);
                                } else {
                                    console.log(`⚠️ [ProcessReply] SOFT BOUNCE: mailAddressId=${mailAddressId} email=${cleanEmail} count=${newBounceCount}/3`);
                                }
                            }
                            // Unknown bounce - traktuj jak soft bounce (dezaktywuj po 3)
                            else {
                                const shouldDeactivate = newBounceCount >= 3;
                                
                                await mailAddressRecord.update({
                                    active: shouldDeactivate ? 0 : mailAddressRecord.active,
                                    bounceDate: new Date(),
                                    bounceReason: bounceInfo.bounceReason,
                                    bounceCount: newBounceCount
                                });
                                
                                if (shouldDeactivate) {
                                    console.log(`🚫 [ProcessReply] UNKNOWN BOUNCE x3: Dezaktywowano kontakt mailAddressId=${mailAddressId} email=${cleanEmail} count=${newBounceCount}`);
                                } else {
                                    console.log(`❓ [ProcessReply] UNKNOWN BOUNCE: mailAddressId=${mailAddressId} email=${cleanEmail} count=${newBounceCount}/3 reason='${bounceInfo.bounceReason}'`);
                                }
                            }
                        }
                    } catch (bounceErr) {
                        console.error(`❌ [ProcessReply] Błąd aktualizacji bounce dla mailAddressId=${mailAddressId}:`, bounceErr?.message || bounceErr);
                    }
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
        return { savedCount: saved, duplicateCount: duplicates, errorCount: errors };
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
        let mailboxMessageCount = 0;
        let unseenMessageCount = 0;
        try {
            const start = Date.now();
            if (DEBUG_MAILBOX) console.log(`➡️ [IMAP] Connecting secure=${secure} allowSelfSigned=${allowSelfSigned}`);
            await client.connect();
            if (DEBUG_MAILBOX) console.log(`✅ [IMAP] Connected in ${Date.now() - start}ms`);
            await client.mailboxOpen(folder);
            if (DEBUG_MAILBOX) console.log(`📂 [IMAP] Opened mailbox ${folder}`);
            mailboxMessageCount = client.mailbox.exists || 0;
            const uids = await client.search({ seen: false }, { uid: true });
            unseenMessageCount = uids.length;
            if (DEBUG_MAILBOX) console.log(`🔎 [IMAP] Found UNSEEN count=${uids.length}`);
            const slice = uids.slice(-maxMessages);
            for (const uid of slice) {
                // fetchOne akceptuje UID jeśli przekażemy { uid: true }
                // Pobieramy dodatkowo headers do wykrywania bounce
                const msg = await client.fetchOne(uid, { envelope: true, internalDate: true, headers: true }, { uid: true });
                const fromAddress = (msg?.envelope?.from && msg.envelope.from[0] && (msg.envelope.from[0].address || msg.envelope.from[0].addr)) || null;
                
                // Parsuj nagłówki do obiektu (msg.headers jest Map lub obiektem)
                const headers = {};
                if (msg?.headers) {
                    try {
                        // ImapFlow zwraca headers jako Map
                        if (msg.headers instanceof Map) {
                            for (const [key, value] of msg.headers) {
                                const headerKey = key.toLowerCase();
                                headers[headerKey] = Array.isArray(value) ? value.join(', ') : value;
                            }
                        } 
                        // Lub jako obiekt
                        else if (typeof msg.headers === 'object') {
                            for (const [key, value] of Object.entries(msg.headers)) {
                                const headerKey = key.toLowerCase();
                                headers[headerKey] = Array.isArray(value) ? value.join(', ') : value;
                            }
                        }
                    } catch (headerErr) {
                        if (DEBUG_MAILBOX) console.warn(`⚠️ [IMAP] Błąd parsowania nagłówków uid=${uid}:`, headerErr?.message);
                    }
                }
                
                results.push({
                    uid,
                    subject: msg?.envelope?.subject || null,
                    from: fromAddress,
                    date: msg?.internalDate || null,
                    messageId: msg?.envelope?.messageId || null,
                    inReplyTo: msg?.envelope?.inReplyTo || null,
                    references: Array.isArray(msg?.envelope?.references) ? msg.envelope.references : (msg?.envelope?.references ? [msg.envelope.references] : []),
                    headers: headers,
                    hash: crypto.createHash('sha1').update(String((msg?.envelope?.messageId) || uid)).digest('hex')
                });
                if (DEBUG_MAILBOX) console.log(`✉️ [IMAP] uid=${uid} from=${fromAddress} subj='${msg?.envelope?.subject || ''}'`);
            }
        } catch (err) {
            console.error('❌ [CheckMailboxTask] IMAP fetch error:', err?.message || err);
            if (DEBUG_MAILBOX && err?.stack) console.error(err.stack);
            throw err;
        } finally {
            try { await client.logout(); } catch { }
        }
        return {
            messages: results,
            mailboxMessageCount,
            unseenMessageCount
        };
    }

    static async markImapMessagesSeen({ host, port, user, pass, folder = 'INBOX', tls = null, allowSelfSigned = false }, uids) {
        if (!uids.length) return;

        const secure = tls !== null ? !!tls : (port === 993);
        const tlsOptions = allowSelfSigned ? { rejectUnauthorized: false } : {};
        const client = new ImapFlow({
            host,
            port,
            secure,
            tls: tlsOptions,
            auth: { user, pass },
            logger: false
        });

        try {
            await client.connect();
            await client.mailboxOpen(folder);
            await client.messageFlagsAdd(uids, ['\\Seen'], { uid: true });
            if (DEBUG_MAILBOX) console.log(`👁️ [IMAP] Marked ${uids.length} msgs as Seen`);
        } finally {
            try { await client.logout(); } catch { }
        }
    }

    // POP3 usunięty – obsługujemy wyłącznie IMAP

    /**
     * Wykrywanie bounce messages (Non-Delivery Report / Delivery Status Notification)
     * Analizuje nagłówki i treść emaila aby określić czy jest to bounce.
     * 
     * Rozpoznawane typy:
     * - Hard bounce: permanent failure (user unknown, domain not found)
     * - Soft bounce: temporary failure (mailbox full, server timeout)
     * 
     * Bounce indicators:
     * - Auto-Submitted: auto-replied, auto-generated
     * - X-Failed-Recipients, X-Autoreply
     * - Content-Type: multipart/report; report-type=delivery-status
     * - Return-Path: <>
     * - Subject zawiera: "Delivery Status Notification", "Undelivered", "failure", "returned mail"
     * - From zawiera: MAILER-DAEMON, postmaster, noreply
     */
    static detectBounce(reply) {
        const { from, subject, headers } = reply;
        
        if (!headers) return { isBounce: false };

        const autoSubmitted = (headers['auto-submitted'] || '').toLowerCase();
        const contentType = (headers['content-type'] || '').toLowerCase();
        const xFailedRecipients = headers['x-failed-recipients'] || '';
        const returnPath = (headers['return-path'] || '').trim();
        
        let bounceScore = 0; // Punktacja - wymagamy minimum 2 punktów dla bounce
        let bounceType = 'unknown';
        let bounceReason = '';
        let recipientEmail = null;

        // Silne wskaźniki bounce (każdy daje 2 punkty - wystarczy 1)
        
        // 1. X-Failed-Recipients - definitywny wskaźnik bounce
        if (xFailedRecipients) {
            bounceScore += 2;
            recipientEmail = xFailedRecipients.trim();
            if (DEBUG_MAILBOX) console.log(`  [detectBounce] X-Failed-Recipients found: ${recipientEmail}`);
        }

        // 2. Content-Type: multipart/report; report-type=delivery-status (RFC 3464 DSN)
        if (contentType.includes('multipart/report') && contentType.includes('delivery-status')) {
            bounceScore += 2;
            if (DEBUG_MAILBOX) console.log(`  [detectBounce] DSN Content-Type detected`);
        }

        // 3. From MAILER-DAEMON lub postmaster (z domeny systemowej)
        const fromLower = (from || '').toLowerCase();
        if (fromLower.includes('mailer-daemon') || fromLower.startsWith('postmaster@')) {
            bounceScore += 2;
            if (DEBUG_MAILBOX) console.log(`  [detectBounce] System sender: ${from}`);
        }

        // Średnie wskaźniki (każdy daje 1 punkt)
        
        // 4. Auto-Submitted: auto-generated (ale NIE auto-replied - to mogą być OOO)
        if (autoSubmitted.includes('auto-generated')) {
            bounceScore += 1;
            if (DEBUG_MAILBOX) console.log(`  [detectBounce] Auto-Submitted: auto-generated`);
        }

        // 5. Return-Path pusta ORAZ subject sugeruje bounce
        const subjectLower = (subject || '').toLowerCase();
        const hasBounceSubject = subjectLower.includes('delivery') || 
                                 subjectLower.includes('undelivered') || 
                                 subjectLower.includes('returned') ||
                                 subjectLower.includes('failure') ||
                                 subjectLower.includes('undeliverable');
        
        if (returnPath === '<>' && hasBounceSubject) {
            bounceScore += 1;
            if (DEBUG_MAILBOX) console.log(`  [detectBounce] Empty Return-Path with bounce subject`);
        }

        // 6. Subject zawiera kluczowe frazy bounce (bardziej specyficzne)
        const strongBounceKeywords = [
            'delivery status notification',
            'mail delivery failed',
            'undelivered mail returned to sender',
            'returned mail: see transcript for details',
            'delivery failure',
            'mail system error',
            'permanent failure',
            'recipient address rejected'
        ];
        
        for (const keyword of strongBounceKeywords) {
            if (subjectLower.includes(keyword)) {
                bounceScore += 1;
                if (DEBUG_MAILBOX) console.log(`  [detectBounce] Strong bounce keyword in subject: '${keyword}'`);
                break;
            }
        }

        if (DEBUG_MAILBOX) console.log(`  [detectBounce] Total score: ${bounceScore} (need >=2 for bounce)`);

        // Wymagamy minimum 2 punktów aby uznać za bounce
        if (bounceScore < 2) {
            return { isBounce: false };
        }

        // Określ typ bounce (hard vs soft)
        const hardBounceIndicators = [
            'user unknown', 'user not found', 'no such user',
            'address rejected', 'recipient rejected',
            'mailbox unavailable', 'mailbox not found',
            'domain not found', 'host not found',
            'permanent failure', '5.1.1', '5.1.2', '5.4.4'
        ];

        const softBounceIndicators = [
            'mailbox full', 'quota exceeded', 'over quota',
            'temporary failure', 'try again', 'deferred',
            'connection timeout', 'server timeout',
            '4.2.2', '4.4.1', '4.4.2'
        ];

        const combinedText = `${subjectLower} ${autoSubmitted} ${contentType}`.toLowerCase();

        for (const indicator of hardBounceIndicators) {
            if (combinedText.includes(indicator)) {
                bounceType = 'hard';
                bounceReason = indicator;
                break;
            }
        }

        if (bounceType === 'unknown') {
            for (const indicator of softBounceIndicators) {
                if (combinedText.includes(indicator)) {
                    bounceType = 'soft';
                    bounceReason = indicator;
                    break;
                }
            }
        }

        // Jeśli nie znaleziono specyficznego powodu, użyj tematu
        if (!bounceReason && subject) {
            bounceReason = subject.substring(0, 200);
        }

        // Ekstrakcja adresu email odbiorcy z różnych źródeł
        if (!recipientEmail) {
            // 1. Sprawdź inne nagłówki bounce
            const xActualRecipient = headers['x-actual-recipient'] || '';
            const finalRecipient = headers['final-recipient'] || '';
            const originalRecipient = headers['original-recipient'] || '';
            
            if (xActualRecipient) {
                const match = xActualRecipient.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                if (match) recipientEmail = match[1];
            }
            
            if (!recipientEmail && finalRecipient) {
                const match = finalRecipient.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                if (match) recipientEmail = match[1];
            }
            
            if (!recipientEmail && originalRecipient) {
                const match = originalRecipient.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                if (match) recipientEmail = match[1];
            }
            
            // 2. Ekstrahuj z tematu (często zawiera email w <>)
            if (!recipientEmail && subject) {
                // Wzorce: <email@domain.com> lub "to email@domain.com"
                const subjectEmailMatch = subject.match(/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/) ||
                                         subject.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
                if (subjectEmailMatch) {
                    recipientEmail = subjectEmailMatch[1];
                }
            }
            
            // 3. Ekstrahuj z Auto-Submitted lub innych headers tekstowych
            if (!recipientEmail) {
                const allHeadersText = Object.values(headers).join(' ');
                const emailMatch = allHeadersText.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
                if (emailMatch) {
                    const foundEmail = emailMatch[1].toLowerCase();
                    // Pomiń systemowe adresy (mailer-daemon, postmaster itp.)
                    if (!foundEmail.includes('mailer-daemon') && 
                        !foundEmail.includes('postmaster') && 
                        !foundEmail.includes('noreply')) {
                        recipientEmail = foundEmail;
                    }
                }
            }
        }

        if (DEBUG_MAILBOX && recipientEmail) {
            console.log(`  [detectBounce] Extracted recipient email: ${recipientEmail}`);
        }

        return {
            isBounce: true,
            bounceType,
            bounceReason,
            recipientEmail
        };
    }

    /**
     * Ekstrahuje oryginalny Message-ID z załączników bounce message
     * Serwery często załączają oryginalną wiadomość jako message/rfc822
     * 
     * @param {ImapFlow} client - połączenie IMAP
     * @param {string} uid - UID wiadomości
     * @returns {Promise<string|null>} - znaleziony Message-ID lub null
     */
    static async extractOriginalMessageIdFromBounce(client, uid) {
        try {
            if (DEBUG_MAILBOX) console.log(`  [extractOriginalMessageId] Fetching full message UID=${uid}`);
            
            // Pobierz pełną wiadomość
            const message = await client.fetchOne(uid, { source: true }, { uid: true });
            if (!message || !message.source) {
                if (DEBUG_MAILBOX) console.log(`  [extractOriginalMessageId] No source for UID=${uid}`);
                return null;
            }

            // Parsuj MIME
            const parsed = await simpleParser(message.source);
            
            // Sprawdź załączniki (często oryginalna wiadomość jest załączona jako message/rfc822)
            if (parsed.attachments && parsed.attachments.length > 0) {
                for (const attachment of parsed.attachments) {
                    // Załącznik typu message/rfc822 lub text/rfc822-headers
                    if (attachment.contentType && 
                        (attachment.contentType.includes('message/rfc822') || 
                         attachment.contentType.includes('rfc822-headers'))) {
                        
                        const attachmentContent = attachment.content ? attachment.content.toString('utf-8') : '';
                        
                        // Szukaj nagłówka Message-ID: w załączonym message
                        const messageIdMatch = attachmentContent.match(/^Message-ID:\s*<(.+)>$/mi);
                        if (messageIdMatch) {
                            const originalMessageId = `<${messageIdMatch[1]}>`;  // Zachowaj nawiasy <>
                            if (DEBUG_MAILBOX) console.log(`  [extractOriginalMessageId] Found Message-ID in attachment: ${originalMessageId}`);
                            return originalMessageId;
                        }
                    }
                }
            }

            // Fallback: sprawdź w treści HTML/TEXT (niektóre serwery wklejają headers jako tekst)
            const combinedText = `${parsed.text || ''} ${parsed.html || ''}`;
            const messageIdMatch = combinedText.match(/Message-ID:\s*<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i);
            if (messageIdMatch) {
                const originalMessageId = `<${messageIdMatch[1]}>`;  // Zachowaj nawiasy <>
                if (DEBUG_MAILBOX) console.log(`  [extractOriginalMessageId] Found Message-ID in text: ${originalMessageId}`);
                return originalMessageId;
            }

            if (DEBUG_MAILBOX) console.log(`  [extractOriginalMessageId] No Message-ID found in attachments/content`);
            return null;

        } catch (error) {
            console.error(`❌ [extractOriginalMessageId] Error parsing bounce:`, error.message);
            if (DEBUG_MAILBOX) console.error(error.stack);
            return null;
        }
    }

    /**
     * Parsuje treść wiadomości bounce w poszukiwaniu adresu odbiorcy
     * Analizuje treść HTML/text i załączniki (często oryginalny mail jest załączony)
     * 
     * @param {ImapFlow} client - połączenie IMAP
     * @param {string} uid - UID wiadomości
     * @returns {Promise<string|null>} - znaleziony adres email lub null
     */
    static async extractRecipientFromBounceContent(client, uid) {
        try {
            if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] Fetching full message UID=${uid}`);
            
            // Pobierz pełną wiadomość
            const message = await client.fetchOne(uid, { source: true }, { uid: true });
            if (!message || !message.source) {
                if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] No source for UID=${uid}`);
                return null;
            }

            // Parsuj MIME
            const parsed = await simpleParser(message.source);
            
            // 1. Szukaj w treści HTML
            if (parsed.html) {
                const htmlText = parsed.html;
                
                // Wzorce często występujące w bounce:
                // "The following recipient(s) could not be reached: email@domain.com"
                // "Your message to email@domain.com couldn't be delivered"
                // "<email@domain.com>: host ... said: ..."
                
                const patterns = [
                    /(?:recipient|user|address|to|failed)[\s:]+<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/gi,
                    /<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?[\s:]+(?:could not be|couldn't be|was not|wasn't|failed)/gi,
                    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>[\s:]+(?:host|relay|said|rejected)/gi
                ];

                for (const pattern of patterns) {
                    const matches = [...htmlText.matchAll(pattern)];
                    for (const match of matches) {
                        const email = match[1].toLowerCase();
                        // Pomiń systemowe adresy
                        if (!email.includes('mailer-daemon') && 
                            !email.includes('postmaster') && 
                            !email.includes('noreply') &&
                            !email.includes('no-reply')) {
                            if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] Found in HTML: ${email}`);
                            return email;
                        }
                    }
                }
            }

            // 2. Szukaj w treści tekstowej
            if (parsed.text) {
                const patterns = [
                    /(?:recipient|user|address|to|failed)[\s:]+<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/gi,
                    /<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?[\s:]+(?:could not be|couldn't be|was not|wasn't|failed)/gi,
                    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>[\s:]+(?:host|relay|said|rejected)/gi
                ];

                for (const pattern of patterns) {
                    const matches = [...parsed.text.matchAll(pattern)];
                    for (const match of matches) {
                        const email = match[1].toLowerCase();
                        if (!email.includes('mailer-daemon') && 
                            !email.includes('postmaster') && 
                            !email.includes('noreply') &&
                            !email.includes('no-reply')) {
                            if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] Found in text: ${email}`);
                            return email;
                        }
                    }
                }
            }

            // 3. Sprawdź załączniki (często oryginalna wiadomość jest załączona jako message/rfc822)
            if (parsed.attachments && parsed.attachments.length > 0) {
                for (const attachment of parsed.attachments) {
                    // Załącznik typu message/rfc822 lub text/rfc822-headers
                    if (attachment.contentType && 
                        (attachment.contentType.includes('message/rfc822') || 
                         attachment.contentType.includes('rfc822-headers'))) {
                        
                        const attachmentContent = attachment.content ? attachment.content.toString('utf-8') : '';
                        
                        // Szukaj nagłówka To: w załączonym message
                        const toMatch = attachmentContent.match(/^To:\s*(.+)$/mi);
                        if (toMatch) {
                            const toHeader = toMatch[1];
                            const emailMatch = toHeader.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                            if (emailMatch) {
                                const email = emailMatch[1].toLowerCase();
                                if (!email.includes('mailer-daemon') && 
                                    !email.includes('postmaster') && 
                                    !email.includes('noreply') &&
                                    !email.includes('no-reply')) {
                                    if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] Found in attachment To: ${email}`);
                                    return email;
                                }
                            }
                        }

                        // Alternatywnie szukaj X-Original-To
                        const xOriginalToMatch = attachmentContent.match(/^X-Original-To:\s*(.+)$/mi);
                        if (xOriginalToMatch) {
                            const emailMatch = xOriginalToMatch[1].match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                            if (emailMatch) {
                                const email = emailMatch[1].toLowerCase();
                                if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] Found in attachment X-Original-To: ${email}`);
                                return email;
                            }
                        }
                    }
                }
            }

            if (DEBUG_MAILBOX) console.log(`  [extractRecipientFromBounceContent] No recipient email found in content/attachments`);
            return null;

        } catch (error) {
            console.error(`❌ [extractRecipientFromBounceContent] Error parsing bounce content:`, error.message);
            if (DEBUG_MAILBOX) console.error(error.stack);
            return null;
        }
    }

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
