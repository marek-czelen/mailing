import { Response } from '../include/response.js';
import CampaignReply from '../models/campaignReply.model.js';
import MarketingCampanies from '../models/marketingCampanies.model.js';
import MailAddress from '../models/mailAddress.model.js';
import { Admin } from '../include/admin.js';
import { Op } from 'sequelize';

/**
 * GET /mailing/campaigns/:campaignId/replies
 * 
 * Pobiera listę TYLKO PRAWIDŁOWYCH odpowiedzi (isBounce=false) dla danej kampanii marketingowej.
 * Wspiera paginację, sortowanie i filtrowanie.
 * 
 * Parametry URL:
 * - campaignId: ID kampanii (wymagane)
 * 
 * Query params:
 * - page: numer strony (domyślnie 1)
 * - limit: liczba rekordów na stronę (domyślnie 50, max 200)
 * - sortBy: pole sortowania (domyślnie 'receivedAt')
 * - sortOrder: kierunek sortowania 'asc'|'desc' (domyślnie 'desc')
 * - search: wyszukiwanie po from_email lub subject (opcjonalne)
 * - hasContact: filtr po mail_address_id - 'true' (tylko zidentyfikowane) | 'false' (tylko niezidentyfikowane) | null (wszystkie)
 * - dateFrom: filtr po dacie odpowiedzi >= (format ISO)
 * - dateTo: filtr po dacie odpowiedzi <= (format ISO)
 * 
 * Zwraca:
 * {
 *   campaign: { id, name, subject },
 *   replies: [{ id, fromEmail, subject, receivedAt, mailAddress, hasContact }],
 *   pagination: { total, page, limit, totalPages },
 *   summary: { totalReplies, identifiedReplies, unidentifiedReplies }
 * }
 */
export async function getCampaignReplies(req, res) {
    try {
        const { campaignId } = req.params;
        const {
            page = 1,
            limit = 50,
            sortBy = 'receivedAt',
            sortOrder = 'desc',
            search = '',
            hasContact = null,
            dateFrom = null,
            dateTo = null
        } = req.query;

        // Walidacja parametrów
        if (!campaignId) {
            return res.send(new Response(null, false, "Campaign ID is required."));
        }

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "Unauthorized."));
        }

        // Sprawdź czy kampania istnieje i należy do klienta
        const campaign = await MarketingCampanies.findOne({
            where: {
                id: campaignId,
                customerId: userData.customerId
            },
            attributes: ['id', 'name', 'subject', 'customerId', 'databaseId']
        });

        if (!campaign) {
            return res.status(404).send(new Response(null, false, "Campaign not found."));
        }

        // Budowa warunku where - TYLKO odpowiedzi (bez bounce)
        const whereClause = { 
            campaignId: campaignId,
            isBounce: { [Op.or]: [0, null] }  // Tylko nie-bounce
        };

        // Filtr wyszukiwania
        const trimmedSearch = (search || '').trim();
        if (trimmedSearch) {
            whereClause[Op.or] = [
                { fromEmail: { [Op.like]: `%${trimmedSearch}%` } },
                { subject: { [Op.like]: `%${trimmedSearch}%` } }
            ];
        }

        // Filtr po identyfikacji kontaktu
        if (hasContact === 'true') {
            whereClause.mailAddressId = { [Op.ne]: null };
        } else if (hasContact === 'false') {
            whereClause.mailAddressId = null;
        }

        // Filtr po dacie
        if (dateFrom) {
            whereClause.receivedAt = { ...whereClause.receivedAt, [Op.gte]: new Date(dateFrom) };
        }
        if (dateTo) {
            whereClause.receivedAt = { ...whereClause.receivedAt, [Op.lte]: new Date(dateTo) };
        }

        // Paginacja
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Sortowanie
        const validSortFields = ['receivedAt', 'fromEmail', 'subject', 'id'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'receivedAt';
        const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Pobierz odpowiedzi z relacjami
        const { count, rows: replies } = await CampaignReply.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: MailAddress,
                    as: 'MailAddress',
                    attributes: ['id', 'mailAddress', 'miasto', 'rodzaj', 'active'],
                    required: false
                }
            ],
            order: [[sortField, sortDir]],
            limit: limitNum,
            offset: offset
        });

        // Statystyki (tylko dla odpowiedzi, nie bounce)
        const totalReplies = count;
        const identifiedReplies = await CampaignReply.count({
            where: { 
                campaignId, 
                mailAddressId: { [Op.ne]: null },
                isBounce: { [Op.or]: [0, null] }
            }
        });
        const unidentifiedReplies = totalReplies - identifiedReplies;

        const result = {
            campaign: {
                id: campaign.id,
                name: campaign.name,
                subject: campaign.subject
            },
            replies: replies.map(reply => ({
                id: reply.id,
                fromEmail: reply.fromEmail,
                subject: reply.subject,
                receivedAt: reply.receivedAt,
                hasContact: !!reply.mailAddressId,
                mailAddress: reply.MailAddress ? {
                    id: reply.MailAddress.id,
                    email: reply.MailAddress.mailAddress,
                    miasto: reply.MailAddress.miasto,
                    rodzaj: reply.MailAddress.rodzaj,
                    active: reply.MailAddress.active
                } : null,
                bodyPreview: reply.bodyPreview ? reply.bodyPreview.substring(0, 200) : null
            })),
            pagination: {
                total: totalReplies,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalReplies / limitNum)
            },
            summary: {
                totalReplies,
                identifiedReplies,
                unidentifiedReplies
            }
        };

        res.send(new Response(result, true, "Campaign replies retrieved successfully."));

    } catch (error) {
        console.error('[getCampaignReplies] Error:', error);
        res.status(500).send(new Response(null, false, `Failed to fetch campaign replies. ${error.message}`));
    }
}

/**
 * GET /mailing/campaigns/:campaignId/bounces
 * 
 * Pobiera listę TYLKO BOUNCE messages (isBounce=true) dla danej kampanii marketingowej.
 * Wspiera paginację, sortowanie i filtrowanie.
 * 
 * Parametry URL:
 * - campaignId: ID kampanii (wymagane)
 * 
 * Query params:
 * - page: numer strony (domyślnie 1)
 * - limit: liczba rekordów na stronę (domyślnie 50, max 200)
 * - sortBy: pole sortowania (domyślnie 'receivedAt')
 * - sortOrder: kierunek sortowania 'asc'|'desc' (domyślnie 'desc')
 * - search: wyszukiwanie po from_email lub subject (opcjonalne)
 * - bounceType: filtr po bounce_type - 'hard'|'soft'|'unknown' (opcjonalne)
 * - hasContact: filtr po mail_address_id - 'true' (tylko zidentyfikowane) | 'false' (tylko niezidentyfikowane) | null (wszystkie)
 * - dateFrom: filtr po dacie >= (format ISO)
 * - dateTo: filtr po dacie <= (format ISO)
 * 
 * Zwraca:
 * {
 *   campaign: { id, name, subject },
 *   bounces: [{ id, fromEmail, subject, receivedAt, bounceType, bounceReason, mailAddress }],
 *   pagination: { total, page, limit, totalPages },
 *   summary: { totalBounces, hardBounces, softBounces, unknownBounces, identifiedBounces, unidentifiedBounces }
 * }
 */
export async function getCampaignBounces(req, res) {
    try {
        const { campaignId } = req.params;
        const {
            page = 1,
            limit = 50,
            sortBy = 'receivedAt',
            sortOrder = 'desc',
            search = '',
            bounceType = null,
            hasContact = null,
            dateFrom = null,
            dateTo = null
        } = req.query;

        // Walidacja parametrów
        if (!campaignId) {
            return res.send(new Response(null, false, "Campaign ID is required."));
        }

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "Unauthorized."));
        }

        // Sprawdź czy kampania istnieje i należy do klienta
        const campaign = await MarketingCampanies.findOne({
            where: {
                id: campaignId,
                customerId: userData.customerId
            },
            attributes: ['id', 'name', 'subject', 'customerId', 'databaseId']
        });

        if (!campaign) {
            return res.status(404).send(new Response(null, false, "Campaign not found."));
        }

        // Budowa warunku where - TYLKO bounce
        const whereClause = { 
            campaignId: campaignId,
            isBounce: 1  // Tylko bounce
        };

        // Filtr wyszukiwania
        const trimmedSearch = (search || '').trim();
        if (trimmedSearch) {
            whereClause[Op.or] = [
                { fromEmail: { [Op.like]: `%${trimmedSearch}%` } },
                { subject: { [Op.like]: `%${trimmedSearch}%` } },
                { bounceReason: { [Op.like]: `%${trimmedSearch}%` } }
            ];
        }

        // Filtr po typie bounce
        if (bounceType && ['hard', 'soft', 'unknown'].includes(bounceType)) {
            whereClause.bounceType = bounceType;
        }

        // Filtr po identyfikacji kontaktu
        if (hasContact === 'true') {
            whereClause.mailAddressId = { [Op.ne]: null };
        } else if (hasContact === 'false') {
            whereClause.mailAddressId = null;
        }

        // Filtr po dacie
        if (dateFrom) {
            whereClause.receivedAt = { ...whereClause.receivedAt, [Op.gte]: new Date(dateFrom) };
        }
        if (dateTo) {
            whereClause.receivedAt = { ...whereClause.receivedAt, [Op.lte]: new Date(dateTo) };
        }

        // Paginacja
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Sortowanie
        const validSortFields = ['receivedAt', 'fromEmail', 'subject', 'id', 'bounceType'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'receivedAt';
        const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Pobierz bounce z relacjami
        const { count, rows: bounces } = await CampaignReply.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: MailAddress,
                    as: 'MailAddress',
                    attributes: ['id', 'mailAddress', 'miasto', 'rodzaj', 'active', 'bounceCount', 'bounceDate'],
                    required: false
                }
            ],
            order: [[sortField, sortDir]],
            limit: limitNum,
            offset: offset
        });

        // Statystyki bounce
        const totalBounces = count;
        const hardBounces = await CampaignReply.count({
            where: { campaignId, isBounce: 1, bounceType: 'hard' }
        });
        const softBounces = await CampaignReply.count({
            where: { campaignId, isBounce: 1, bounceType: 'soft' }
        });
        const unknownBounces = await CampaignReply.count({
            where: { campaignId, isBounce: 1, bounceType: 'unknown' }
        });
        const identifiedBounces = await CampaignReply.count({
            where: { 
                campaignId, 
                isBounce: 1,
                mailAddressId: { [Op.ne]: null }
            }
        });
        const unidentifiedBounces = totalBounces - identifiedBounces;

        const result = {
            campaign: {
                id: campaign.id,
                name: campaign.name,
                subject: campaign.subject
            },
            bounces: bounces.map(bounce => ({
                id: bounce.id,
                fromEmail: bounce.fromEmail,
                subject: bounce.subject,
                receivedAt: bounce.receivedAt,
                bounceType: bounce.bounceType,
                bounceReason: bounce.bounceReason,
                hasContact: !!bounce.mailAddressId,
                mailAddress: bounce.MailAddress ? {
                    id: bounce.MailAddress.id,
                    email: bounce.MailAddress.mailAddress,
                    miasto: bounce.MailAddress.miasto,
                    rodzaj: bounce.MailAddress.rodzaj,
                    active: bounce.MailAddress.active,
                    bounceCount: bounce.MailAddress.bounceCount || 0,
                    bounceDate: bounce.MailAddress.bounceDate
                } : null,
                bodyPreview: bounce.bodyPreview ? bounce.bodyPreview.substring(0, 200) : null
            })),
            pagination: {
                total: totalBounces,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalBounces / limitNum)
            },
            summary: {
                totalBounces,
                hardBounces,
                softBounces,
                unknownBounces,
                identifiedBounces,
                unidentifiedBounces
            }
        };

        res.send(new Response(result, true, "Campaign bounces retrieved successfully."));

    } catch (error) {
        console.error('[getCampaignBounces] Error:', error);
        res.status(500).send(new Response(null, false, `Failed to fetch campaign bounces. ${error.message}`));
    }
}

/**
 * GET /mailing/replies/:replyId
 * 
 * Pobiera szczegóły pojedynczej odpowiedzi wraz z pełnym kontekstem:
 * - pełne dane kampanii
 * - pełne dane kontaktu (jeśli zidentyfikowany)
 * - treść odpowiedzi (body_preview)
 * - metadane (messageId, receivedAt, replyHash)
 * 
 * Parametry URL:
 * - replyId: ID odpowiedzi (wymagane)
 * 
 * Zwraca:
 * {
 *   reply: {
 *     id, fromEmail, subject, receivedAt, messageId, replyHash, bodyPreview,
 *     campaign: { id, name, subject, senderName, senderEmail },
 *     mailAddress: { id, email, miasto, rodzaj, active } | null
 *   }
 * }
 */
export async function getReplyById(req, res) {
    try {
        const { replyId } = req.params;

        if (!replyId) {
            return res.send(new Response(null, false, "Reply ID is required."));
        }

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "Unauthorized."));
        }

        // Pobierz odpowiedź z pełnymi relacjami
        const reply = await CampaignReply.findOne({
            where: { id: replyId },
            include: [
                {
                    model: MarketingCampanies,
                    as: 'Campaign',
                    attributes: ['id', 'name', 'subject', 'senderName', 'senderEmail', 'customerId', 'databaseId'],
                    required: true
                },
                {
                    model: MailAddress,
                    as: 'MailAddress',
                    attributes: ['id', 'mailAddress', 'miasto', 'rodzaj', 'phone', 'active', 'unsubscribesDate'],
                    required: false
                }
            ]
        });

        if (!reply) {
            return res.status(404).send(new Response(null, false, "Reply not found."));
        }

        // Sprawdź czy odpowiedź należy do kampanii klienta
        if (reply.Campaign.customerId !== userData.customerId) {
            return res.status(403).send(new Response(null, false, "Unauthorized access to this reply."));
        }

        const result = {
            reply: {
                id: reply.id,
                fromEmail: reply.fromEmail,
                subject: reply.subject,
                receivedAt: reply.receivedAt,
                messageId: reply.messageId,
                replyHash: reply.replyHash,
                bodyPreview: reply.bodyPreview,
                isBounce: !!reply.isBounce,
                bounceType: reply.bounceType,
                bounceReason: reply.bounceReason,
                createdAt: reply.createdAt,
                campaign: {
                    id: reply.Campaign.id,
                    name: reply.Campaign.name,
                    subject: reply.Campaign.subject,
                    senderName: reply.Campaign.senderName,
                    senderEmail: reply.Campaign.senderEmail,
                    databaseId: reply.Campaign.databaseId
                },
                mailAddress: reply.MailAddress ? {
                    id: reply.MailAddress.id,
                    email: reply.MailAddress.mailAddress,
                    miasto: reply.MailAddress.miasto,
                    rodzaj: reply.MailAddress.rodzaj,
                    phone: reply.MailAddress.phone,
                    active: reply.MailAddress.active,
                    unsubscribed: !!reply.MailAddress.unsubscribesDate,
                    bounceDate: reply.MailAddress.bounceDate,
                    bounceCount: reply.MailAddress.bounceCount || 0
                } : null
            }
        };

        res.send(new Response(result, true, "Reply details retrieved successfully."));

    } catch (error) {
        console.error('[getReplyById] Error:', error);
        res.status(500).send(new Response(null, false, `Failed to fetch reply details. ${error.message}`));
    }
}

/**
 * GET /mailing/replies/:replyId/full
 * 
 * Pobiera PEŁNĄ treść odpowiedzi z serwera IMAP na żądanie i automatycznie oznacza ją jako odczytaną.
 * Endpoint dla frontendu do wyświetlenia pełnej treści emaila użytkownikowi.
 * 
 * Mechanizm:
 * - Jeśli bodyFull już jest w bazie, zwraca z cache
 * - Jeśli bodyFull=NULL, łączy się z IMAP używając konfiguracji kampanii
 * - Pobiera wiadomość po imapUid
 * - Zapisuje bodyFull i bodyPreview do bazy (cache)
 * - Po pierwszym wywołaniu ustawia is_read=1 i read_at=NOW()
 * 
 * Parametry URL:
 * - replyId: ID odpowiedzi (wymagane)
 * 
 * Zwraca:
 * {
 *   reply: {
 *     id, fromEmail, subject, receivedAt, bodyFull, bodyPreview,
 *     isRead, readAt, wasUnread,
 *     campaign: { id, name },
 *     mailAddress: { id, email } | null
 *   }
 * }
 */
export async function getReplyFullContent(req, res) {
    try {
        const { replyId } = req.params;

        if (!replyId) {
            return res.send(new Response(null, false, "Reply ID is required."));
        }

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "Unauthorized."));
        }

        // Pobierz odpowiedź z pełnymi relacjami
        const reply = await CampaignReply.findOne({
            where: { id: replyId },
            include: [
                {
                    model: MarketingCampanies,
                    as: 'Campaign',
                    attributes: [
                        'id', 'name', 'subject', 'customerId',
                        'replyMailboxHost', 'replyMailboxPort', 'replyMailboxUser', 
                        'replyMailboxPass', 'replyMailboxFolder', 'replyMailboxTls', 
                        'replyMailboxAllowSelfSigned'
                    ],
                    required: true
                },
                {
                    model: MailAddress,
                    as: 'MailAddress',
                    attributes: ['id', 'mailAddress', 'miasto', 'rodzaj'],
                    required: false
                }
            ]
        });

        if (!reply) {
            return res.status(404).send(new Response(null, false, "Reply not found."));
        }

        // Sprawdź czy odpowiedź należy do kampanii klienta
        if (reply.Campaign.customerId !== userData.customerId) {
            return res.status(403).send(new Response(null, false, "Unauthorized access to this reply."));
        }

        // Jeśli bodyFull nie jest w bazie, pobierz z IMAP i sparsuj MIME
        let parsedHtml = null;
        if (!reply.bodyFull && reply.imapUid) {
            try {
                const campaign = reply.Campaign;
                const { ImapFlow } = await import('imapflow');
                const { simpleParser } = await import('mailparser');

                const secure = campaign.replyMailboxTls !== null ? !!campaign.replyMailboxTls : (campaign.replyMailboxPort === 993);
                const tlsOptions = {};
                if (campaign.replyMailboxAllowSelfSigned) {
                    tlsOptions.rejectUnauthorized = false;
                }

                const client = new ImapFlow({
                    host: campaign.replyMailboxHost,
                    port: campaign.replyMailboxPort || 993,
                    secure,
                    tls: tlsOptions,
                    auth: {
                        user: campaign.replyMailboxUser,
                        pass: campaign.replyMailboxPass
                    },
                    logger: false
                });

                await client.connect();
                await client.mailboxOpen(campaign.replyMailboxFolder || 'INBOX');
                const msg = await client.fetchOne(reply.imapUid, { uid: true, source: true });
                await client.logout();

                if (msg?.source) {
                    // Parsowanie MIME
                    const parsed = await simpleParser(msg.source);
                    const rawHtml = parsed.html || null;
                    const rawText = parsed.text || null;

                    // Wybór HTML albo konwersja z tekstu
                    let bodyHtml = rawHtml;
                    if (!bodyHtml && rawText) {
                        bodyHtml = '<pre style="white-space:pre-wrap;font-family:inherit;">' +
                            escapeHtml(rawText) + '</pre>';
                    }

                    // Sanitizacja i dodanie podstawowego CSS
                    if (bodyHtml) {
                        parsedHtml = wrapHtmlWithStyle(sanitizeHtmlBasic(bodyHtml));
                    }

                    // Raw źródło w UTF-8
                    const bodyFullRaw = msg.source.toString('utf-8');

                    // Wygeneruj bodyPreview z czystego tekstu (priorytet text, potem html strip)
                    let previewSource = rawText;
                    if (!previewSource && rawHtml) {
                        previewSource = stripHtml(rawHtml);
                    }
                    const bodyPreview = previewSource ? previewSource.substring(0, 500) : null;

                    await reply.update({
                        bodyFull: bodyFullRaw,
                        bodyPreview: bodyPreview
                    });
                    console.log(`📥 [getReplyFullContent] Pobrano i sparsowano MIME replyId=${replyId} uid=${reply.imapUid}`);
                }
            } catch (imapError) {
                console.error(`❌ [getReplyFullContent] Błąd pobierania/parsersowania MIME replyId=${replyId}:`, imapError?.message);
            }
        } else if (reply.bodyFull) {
            // Jeśli treść już w bazie – wykonaj parsowanie tylko do zwrotu parsedHtml
            try {
                const { simpleParser } = await import('mailparser');
                const parsed = await simpleParser(Buffer.from(reply.bodyFull, 'utf-8'));
                let bodyHtml = parsed.html || null;
                if (!bodyHtml && parsed.text) {
                    bodyHtml = '<pre style="white-space:pre-wrap;font-family:inherit;">' + escapeHtml(parsed.text) + '</pre>';
                }
                if (bodyHtml) parsedHtml = wrapHtmlWithStyle(sanitizeHtmlBasic(bodyHtml));
            } catch (parseErr) {
                console.warn(`⚠️ [getReplyFullContent] Nie udało się sparsować MIME z cache replyId=${replyId}:`, parseErr?.message);
            }
        }

        // Oznacz jako odczytaną (jeśli jeszcze nie była)
        const wasUnread = !reply.isRead;
        if (wasUnread) {
            await reply.update({
                isRead: 1,
                readAt: new Date()
            });

            console.log(`📖 [getReplyFullContent] Oznaczono jako odczytaną: replyId=${replyId}`);
        }

        // Odśwież dane po update
        await reply.reload();

        const result = {
            reply: {
                id: reply.id,
                fromEmail: reply.fromEmail,
                subject: reply.subject,
                receivedAt: reply.receivedAt,
                messageId: reply.messageId,
                bodyFullRaw: reply.bodyFull,
                bodyPreview: reply.bodyPreview,
                bodyFullParsedHtml: parsedHtml, // oczyszczone, kompletne HTML gotowe do osadzenia
                isRead: reply.isRead,
                readAt: reply.readAt,
                wasUnread,
                campaign: {
                    id: reply.Campaign.id,
                    name: reply.Campaign.name,
                    subject: reply.Campaign.subject
                },
                mailAddress: reply.MailAddress ? {
                    id: reply.MailAddress.id,
                    email: reply.MailAddress.mailAddress,
                    miasto: reply.MailAddress.miasto,
                    rodzaj: reply.MailAddress.rodzaj
                } : null
            }
        };

        res.send(new Response(result, true, "Reply full content retrieved successfully."));

    } catch (error) {
        console.error('[getReplyFullContent] Error:', error);
        res.status(500).send(new Response(null, false, `Failed to fetch reply full content. ${error.message}`));
    }
}

// ========== Pomocnicze funkcje sanitizacji / formatowania MIME ==========
function escapeHtml(str = '') {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function stripHtml(html = '') {
    return html.replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ') // kompresja
        .trim();
}

function sanitizeHtmlBasic(html = '') {
    // Usuwamy skrypty, iframe, event handlery
    let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/on[a-zA-Z]+\s*=\s*"[^"]*"/g, '')
        .replace(/on[a-zA-Z]+\s*=\s*'[^']*'/g, '')
        .replace(/javascript:/gi, '#')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<base[^>]*>/gi, '');
    return cleaned;
}

function wrapHtmlWithStyle(innerHtml = '') {
    const baseCss = `body{margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222;}\nimg{max-width:100%;height:auto;}\na{color:#0b79d0;text-decoration:none;}\na:hover{text-decoration:underline;}\nblockquote{border-left:4px solid #ddd;margin:8px 0;padding:4px 12px;color:#555;background:#fafafa;}\npre,code{background:#f4f4f4;border:1px solid #e0e0e0;padding:4px 8px;border-radius:4px;white-space:pre-wrap;word-break:break-word;}\ntable{border-collapse:collapse;}\ntd,th{border:1px solid #ccc;padding:4px 8px;}`;
    return `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"/><title>Odpowiedź</title><style>${baseCss}</style></head><body>${innerHtml}</body></html>`;
}

/**
 * GET /mailing/campaigns/:campaignId/replies/stats
 * 
 * Pobiera statystyki odpowiedzi dla kampanii:
 * - liczba odpowiedzi ogółem
 * - liczba zidentyfikowanych vs niezidentyfikowanych
 * - rozkład w czasie (dzień po dniu)
 * - top 10 odpowiadających (po email)
 * 
 * Parametry URL:
 * - campaignId: ID kampanii (wymagane)
 * 
 * Zwraca:
 * {
 *   campaign: { id, name },
 *   stats: {
 *     totalReplies, identifiedReplies, unidentifiedReplies,
 *     repliesByDay: [{ date, count }],
 *     topRespondents: [{ email, count }]
 *   }
 * }
 */
export async function getCampaignRepliesStats(req, res) {
    try {
        const { campaignId } = req.params;

        if (!campaignId) {
            return res.send(new Response(null, false, "Campaign ID is required."));
        }

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "Unauthorized."));
        }

        // Sprawdź czy kampania istnieje i należy do klienta
        const campaign = await MarketingCampanies.findOne({
            where: {
                id: campaignId,
                customerId: userData.customerId
            },
            attributes: ['id', 'name']
        });

        if (!campaign) {
            return res.status(404).send(new Response(null, false, "Campaign not found."));
        }

        // Pobierz wszystkie odpowiedzi dla kampanii
        const replies = await CampaignReply.findAll({
            where: { campaignId },
            attributes: ['fromEmail', 'receivedAt', 'mailAddressId', 'isBounce', 'bounceType'],
            raw: true
        });

        // Statystyki podstawowe
        const totalReplies = replies.length;
        const identifiedReplies = replies.filter(r => r.mailAddressId !== null).length;
        const unidentifiedReplies = totalReplies - identifiedReplies;
        const totalBounces = replies.filter(r => r.isBounce).length;
        const hardBounces = replies.filter(r => r.isBounce && r.bounceType === 'hard').length;
        const softBounces = replies.filter(r => r.isBounce && r.bounceType === 'soft').length;

        // Rozkład w czasie (grupowanie po dniu)
        const repliesByDay = {};
        replies.forEach(reply => {
            const date = new Date(reply.receivedAt).toISOString().split('T')[0];
            repliesByDay[date] = (repliesByDay[date] || 0) + 1;
        });

        const repliesByDayArray = Object.entries(repliesByDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top respondents (po email)
        const emailCounts = {};
        replies.forEach(reply => {
            const email = reply.fromEmail.toLowerCase();
            emailCounts[email] = (emailCounts[email] || 0) + 1;
        });

        const topRespondents = Object.entries(emailCounts)
            .map(([email, count]) => ({ email, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const result = {
            campaign: {
                id: campaign.id,
                name: campaign.name
            },
            stats: {
                totalReplies,
                identifiedReplies,
                unidentifiedReplies,
                identificationRate: totalReplies > 0 ? Math.round((identifiedReplies / totalReplies) * 100) : 0,
                totalBounces,
                hardBounces,
                softBounces,
                bounceRate: totalReplies > 0 ? Math.round((totalBounces / totalReplies) * 100) : 0,
                repliesByDay: repliesByDayArray,
                topRespondents
            }
        };

        res.send(new Response(result, true, "Campaign replies statistics retrieved successfully."));

    } catch (error) {
        console.error('[getCampaignRepliesStats] Error:', error);
        res.status(500).send(new Response(null, false, `Failed to fetch campaign replies statistics. ${error.message}`));
    }
}
