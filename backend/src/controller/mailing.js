import MarketingCampanies from '../models/marketingCampanies.model.js';
import { Response } from '../include/response.js';
import XLSX from 'xlsx';
import MailAddress from '../models/mailAddress.model.js';
import UPLOAD_DIR from '../config/upload.config.js';
import Path from 'path';
import Databases from '../models/databases.model.js';
import Customers from '../models/customers.model.js';
import sequelize from '../include/db.js';
import { Op } from 'sequelize';
import fetch from "node-fetch";
import fs from 'fs';
import Auth from '../include/auth.js';
import Sequelize from 'sequelize';
import Mail from '../include/mail.js';
import { Admin } from '../include/admin.js';
import MarketingCampaniesMailingResult from '../models/marketingCampaniesMailing.model.js';
import { generateText, getDefaultProvider, listModels as fetchAiModels } from '../services/ai.service.js';

async function getLatestSendDates(campaignIds) {
    if (campaignIds.length === 0) return new Map();

    const results = await MarketingCampaniesMailingResult.findAll({
        attributes: [
            'marketingCampaniesId',
            [Sequelize.fn('MAX', Sequelize.col('send_date')), 'sentAt']
        ],
        where: {
            marketingCampaniesId: { [Op.in]: campaignIds },
            isSend: true
        },
        group: ['marketingCampaniesId'],
        raw: true
    });

    return new Map(results.map(result => [result.marketingCampaniesId, result.sentAt]));
}

// Pobierz wszystkie kampanie
export async function getCampaignsList(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "User not found."));
        }

        const campaigns = await MarketingCampanies.findAll({
            where: { customerId: userData.customerId },
            attributes: { exclude: ['htmlContent', 'textContent', 'suggestions'] }
        });
        const latestSendDates = await getLatestSendDates(campaigns.map(campaign => campaign.id));
        const campaignsWithSendDates = campaigns.map(campaign => ({
            ...campaign.toJSON(),
            sentAt: latestSendDates.get(campaign.id) || null
        }));
        res.status(200).send(new Response(campaignsWithSendDates, true, "Data received successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to fetch campaigns. ${error.message}`));
    }
}

// Pobierz jedną kampanię po ID
export async function getCampaignById(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "User not found."));
        }

        const campaign = await MarketingCampanies.findOne({
            where: { id: req.params.id, customerId: userData.customerId }
        });

        if (!campaign) {
            return res.status(403).send(new Response(null, false, "Campaign not found."));
        }
        const latestSendDates = await getLatestSendDates([campaign.id]);
        res.status(200).send(new Response({
            ...campaign.toJSON(),
            sentAt: latestSendDates.get(campaign.id) || null
        }, true, "Data received successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to fetch campaign. ${error.message}`));
    }
}

// Utwórz nową kampanię
export async function createCampaign(req, res) {
    try {
        let data = req.body;
        console.log(data);

        // Normalizacja danych dla MySQL/MariaDB
        const normalized = {
            ...data,
            active: (data.active === true || data.active === 'true' || data.active === 1 || data.active === '1'),
            sent: (data.sent === true || data.sent === 'true' || data.sent === 1 || data.sent === '1') || false,
            progress: data.progress ? Number(data.progress) : 0,
            customerId: data.customerId ? Number(data.customerId) : 1,
            // suggestions już jest JSON w modelu — obsługiwane automatycznie
            replyCheckEnabled: (data.replyCheckEnabled === true || data.replyCheckEnabled === 'true' || data.replyCheckEnabled === 1 || data.replyCheckEnabled === '1') || false,
            replyMailboxHost: data.replyMailboxHost || null,
            replyMailboxPort: data.replyMailboxPort ? Number(data.replyMailboxPort) : 993,
            replyMailboxUser: data.replyMailboxUser || null,
            replyMailboxPass: data.replyMailboxPass || null,
            replyMailboxProtocol: data.replyMailboxProtocol || 'IMAP',
            replyMailboxFolder: data.replyMailboxFolder || 'INBOX',
            replyMailboxTls: data.replyMailboxTls !== undefined ? (data.replyMailboxTls === true || data.replyMailboxTls === 'true' || data.replyMailboxTls === 1 || data.replyMailboxTls === '1') : null,
            replyMailboxAllowSelfSigned: (data.replyMailboxAllowSelfSigned === true || data.replyMailboxAllowSelfSigned === 'true' || data.replyMailboxAllowSelfSigned === 1 || data.replyMailboxAllowSelfSigned === '1') || false
        };

        // Utwórz kampanię
        const newCampaign = await MarketingCampanies.create(normalized);

        // Automatycznie licz scoring i sugestie po utworzeniu kampanii
        await computeSpamRating({ body: { id: newCampaign.id } }, { send: () => { } });

        res.send(new Response(newCampaign, true, "Campaign created successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to create campaign. ${error.message}`));
    }
}

// Aktualizuj kampanię po ID
export async function updateCampaign(req, res) {
    try {
        // Normalizacja danych (jak w createCampaign)
        const updateData = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.subject !== undefined) updateData.subject = req.body.subject;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.senderName !== undefined) updateData.senderName = req.body.senderName;
        if (req.body.senderEmail !== undefined) updateData.senderEmail = req.body.senderEmail;
        if (req.body.senderPhone !== undefined) updateData.senderPhone = req.body.senderPhone;
        if (req.body.textContent !== undefined) updateData.textContent = req.body.textContent;
        if (req.body.htmlContent !== undefined) updateData.htmlContent = req.body.htmlContent;
        if (req.body.aiGenerationData !== undefined) updateData.aiGenerationData = req.body.aiGenerationData;
        if (req.body.dateStart !== undefined) updateData.dateStart = req.body.dateStart;
        if (req.body.dateEnd !== undefined) updateData.dateEnd = req.body.dateEnd;
        if (req.body.progress !== undefined) updateData.progress = Number(req.body.progress);
        if (req.body.active !== undefined) updateData.active = (req.body.active === true || req.body.active === 'true' || req.body.active === 1 || req.body.active === '1');
        if (req.body.sent !== undefined) updateData.sent = (req.body.sent === true || req.body.sent === 'true' || req.body.sent === 1 || req.body.sent === '1');
        if (req.body.scoring !== undefined) updateData.scoring = req.body.scoring ? Number(req.body.scoring) : null;
        if (req.body.suggestions !== undefined) updateData.suggestions = req.body.suggestions; // JSON
        if (req.body.databaseId !== undefined) updateData.databaseId = Number(req.body.databaseId);
        if (req.body.customerId !== undefined) updateData.customerId = Number(req.body.customerId);
        // Pola konfiguracji sprawdzania skrzynki
        if (req.body.replyCheckEnabled !== undefined) updateData.replyCheckEnabled = (req.body.replyCheckEnabled === true || req.body.replyCheckEnabled === 'true' || req.body.replyCheckEnabled === 1 || req.body.replyCheckEnabled === '1');
        if (req.body.replyMailboxHost !== undefined) updateData.replyMailboxHost = req.body.replyMailboxHost;
        if (req.body.replyMailboxPort !== undefined) updateData.replyMailboxPort = Number(req.body.replyMailboxPort);
        if (req.body.replyMailboxUser !== undefined) updateData.replyMailboxUser = req.body.replyMailboxUser;
        if (req.body.replyMailboxPass !== undefined) updateData.replyMailboxPass = req.body.replyMailboxPass;
        if (req.body.replyMailboxProtocol !== undefined) updateData.replyMailboxProtocol = req.body.replyMailboxProtocol;
        if (req.body.replyMailboxFolder !== undefined) updateData.replyMailboxFolder = req.body.replyMailboxFolder;
        if (req.body.replyMailboxTls !== undefined) updateData.replyMailboxTls = (req.body.replyMailboxTls === true || req.body.replyMailboxTls === 'true' || req.body.replyMailboxTls === 1 || req.body.replyMailboxTls === '1') ? true : (req.body.replyMailboxTls === false || req.body.replyMailboxTls === 'false' || req.body.replyMailboxTls === 0 || req.body.replyMailboxTls === '0') ? false : null;
        if (req.body.replyMailboxAllowSelfSigned !== undefined) updateData.replyMailboxAllowSelfSigned = (req.body.replyMailboxAllowSelfSigned === true || req.body.replyMailboxAllowSelfSigned === 'true' || req.body.replyMailboxAllowSelfSigned === 1 || req.body.replyMailboxAllowSelfSigned === '1');
        if (req.body.smtpHost !== undefined) updateData.smtpHost = req.body.smtpHost;
        if (req.body.smtpPort !== undefined) updateData.smtpPort = Number(req.body.smtpPort);
        if (req.body.smtpUser !== undefined) updateData.smtpUser = req.body.smtpUser;
        if (req.body.smtpPass !== undefined) updateData.smtpPass = req.body.smtpPass;
        if (req.body.smtpSecure !== undefined) updateData.smtpSecure = (req.body.smtpSecure === true || req.body.smtpSecure === 'true' || req.body.smtpSecure === 1 || req.body.smtpSecure === '1');
        if (req.body.smtpAllowSelfSigned !== undefined) updateData.smtpAllowSelfSigned = (req.body.smtpAllowSelfSigned === true || req.body.smtpAllowSelfSigned === 'true' || req.body.smtpAllowSelfSigned === 1 || req.body.smtpAllowSelfSigned === '1');

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "User not found."));
        }

        const campaignWhere = { id: req.params.id, customerId: userData.customerId };
        const campaign = await MarketingCampanies.findOne({ where: campaignWhere });
        if (!campaign) {
            return res.status(404).send(new Response(null, false, "Campaign not found."));
        }
        if (campaign.sent) {
            return res.status(409).send(new Response(null, false, "Sent campaigns cannot be updated."));
        }

        const [updated] = await MarketingCampanies.update(updateData, {
            where: { ...campaignWhere, sent: false }
        });

        const updatedCampaign = await MarketingCampanies.findOne({
            where: campaignWhere
        });
        if (!updatedCampaign) {
            return res.status(404).send(new Response(null, false, "Campaign not found."));
        }
        if (updatedCampaign.sent) {
            return res.status(409).send(new Response(null, false, "Sent campaigns cannot be updated."));
        }

        // Automatycznie licz scoring i sugestie po edycji kampanii
        if (updated) {
            await computeSpamRating({ body: { id: updatedCampaign.id } }, { send: () => { } });
        }

        res.status(200).send(new Response(updatedCampaign, true, "Campaign updated successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to update campaign. ${error.message}`));
    }
}

// Usuń kampanię po ID
export async function deleteCampaign(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        const deleted = await MarketingCampanies.destroy({
            where: { id: req.params.id, customerId: userData.customerId }
        });
        if (!deleted) {
            return res.status(403).send(new Response(null, false, "Campaign not found."));
        }
        res.status(200).send(new Response(null, true, "Campaign deleted successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to delete campaign. ${error.message}`));
    }
}

export async function setCampaignArchived(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (!userData) {
            return res.status(403).send(new Response(null, false, "User not found."));
        }
        if (typeof req.body.archived !== 'boolean') {
            return res.status(400).send(new Response(null, false, "Archived must be a boolean."));
        }

        const [updated] = await MarketingCampanies.update({
            archivedAt: req.body.archived ? new Date() : null
        }, {
            where: { id: req.params.id, customerId: userData.customerId }
        });

        if (!updated) {
            return res.status(404).send(new Response(null, false, "Campaign not found."));
        }

        const campaign = await MarketingCampanies.findOne({
            where: { id: req.params.id, customerId: userData.customerId }
        });
        res.status(200).send(new Response(campaign, true, "Campaign archive status updated."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to update campaign archive status. ${error.message}`));
    }
}

export async function campaignSendingProgress(req, res) {
    try {
        const { id } = req.params;
        const campaign = await MarketingCampanies.findByPk(id);
        if (!campaign) {
            return res.status(403).send(new Response(null, false, "Campaign not found."));
        }

        const mailAddressesCount = await MailAddress.count({
            where: { databaseId: campaign.databaseId }
        });

        const sentCount = await MarketingCampaniesMailingResult.count({
            where: { marketingCampaniesId: id}
        });
        // Tutaj możesz dodać logikę zwracającą postęp wysyłki kampanii
        res.status(200).send(new Response({ progress: sentCount *100 / mailAddressesCount }, true, "Progress fetched successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to fetch campaign progress. ${error.message}`));
    }   
}

export async function listModels(req, res) {
    try {
        const models = await fetchAiModels();
        res.send(new Response(models, true, "Models fetched successfully."));
    } catch (err) {
        res.send(new Response(null, false, `Failed to fetch models: ${err.message}`));
    }
}

export async function generateMailContent(req, res) {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.send(new Response(null, false, "Brak promptu do wygenerowania treści."));
    }

    try {
        const generatedText = await generateText({
            prompt,
            systemPrompt: typeof req.body.systemPrompt === 'string' ? req.body.systemPrompt.slice(0, 4000) : undefined,
            provider: req.body.provider || getDefaultProvider(),
            model: req.body.model,
            maxTokens: req.body.maxTokens,
            temperature: req.body.temperature
        });
        res.send(new Response(generatedText, true, "OK."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to generate mail content: ${error.message}`));
    }
}

// computeSpamRating (advanced heuristics)
// zachowuje strukturę wyniku: { score, rating, details, suggestions }
// uwagi: wymaga Node.js z dns.promises oraz fetch (globalny lub polyfill).
import dns from 'dns';
const dnsPromises = dns.promises;

// helper: bezpieczne resolve TXT
async function resolveTxtSafe(name) {
    try {
        const txts = await dnsPromises.resolveTxt(name);
        // resolveTxt zwraca tablice tablic -> spłaszczamy do stringów
        return txts.flat().join(' ');
    } catch (e) {
        return null;
    }
}

// główna funkcja
export async function computeSpamRating(req, res) {
    try {
        const { id } = req.body || {};
        if (!id) return res.send(new Response(null, false, 'Brak id kampanii.'));

        const campaign = await MarketingCampanies.findByPk(id);
        if (!campaign) return res.send(new Response(null, false, 'Nie znaleziono kampanii.'));

        const subject = (campaign.subject || '') + '';
        const html = (campaign.htmlContent || '') + '';
        const text = (campaign.textContent || '') + '';
        const content = (html || text).toString();
        const from = (campaign.senderEmail || '') + '';
        const unsubscribeField = campaign.unsubscribe ?? null;
        const sendingIp = campaign.sendingIp || null;
        const sendingIpReputation = typeof campaign.sendingIpReputation === 'number' ? campaign.sendingIpReputation : null;
        const bounceRate = typeof campaign.bounceRate === 'number' ? campaign.bounceRate : null;
        const complaintRate = typeof campaign.complaintRate === 'number' ? campaign.complaintRate : null;

        const details = {};
        const suggestions = [];

        // rozszerzona lista spam words (angielski + polski)
        const spamWords = [
            // English spam keywords
            'free', 'buy now', 'click here', 'winner', 'win', 'prize', 'urgent', 'limited', 'offer',
            'money', 'cash', 'credit', 'cheap', 'guarantee', 'congratulations', 'act now',
            'discount', 'earn', 'income', 'investment', 'get paid', 'work from home', 'no cost',
            'trial', 'bonus', 'bargain', 'exclusive', 'deal', 'amazing', 'special', 'miracle',
            'secret', 'risk free', 'instant', 'promo', 'promotion', 'cheap meds', 'lottery',
            'jackpot', 'selected', 'you have been chosen', 'apply now', 'order now', 'get started',
            'unsubscribe', 'don’t delete', 'lowest price', 'clearance', 'save big', 'double your',
            'increase sales', 'extra income', 'hot', 'winner', 'reward', 'gift', '100% free',
            'unsecured', 'credit card', 'loan', 'debt', 'forex', 'crypto', 'bitcoin', 'get rich',
            'limited time', 'final notice', 'act fast', 'attention', 'important update',
            'this is not spam', 'click below', 'read this', 'apply online', 'exclusive offer',
            'urgent response', 'claim now', 'risk-free', 'try it now', 'instant access',
            'money back', 'free quote', 'no obligation', 'easy money', 'investment opportunity',
            'donation', 'lotto', 'casino', 'bet', 'guaranteed results', 'special promotion',
            // Polish spam keywords
            'okazja', 'promocja', 'wyprzedaż', 'rabat', 'gratisy', 'za darmo', 'darmowy', 'kup teraz',
            'oferta ograniczona', 'ostatnia szansa', 'nie przegap', 'tylko dziś', 'promocja specjalna',
            'super okazja', 'ekskluzywna oferta', 'zdobądź', 'zamów teraz', 'kliknij tutaj',
            'nagroda', 'wygraj', 'wygrana', 'gratulacje', 'pilne', 'ważne', 'alert', 'limitowana oferta',
            'zarób', 'dodatkowy dochód', 'praca z domu', 'łatwy zarobek', 'bez ryzyka', 'inwestycja',
            'pewny zysk', 'kredyt', 'pożyczka', 'chwilówka', 'gotówka', 'darmowa próbka',
            'gwarancja zwrotu', 'najniższa cena', 'oszczędź', 'zniżka', 'specjalna oferta',
            'ekstra bonus', 'oferta dnia', 'bez zobowiązań', 'natychmiastowy dostęp', 'wyjątkowa okazja',
            'nie usuwaj', 'ważne informacje', 'kliknij poniżej', 'aktualizacja konta', 'uwaga',
            'alert bezpieczeństwa', 'promocja ograniczona czasowo', 'super oferta', 'bonus', 'kupon',
            'wyślij sms', 'sprawdź teraz', 'zarejestruj się', 'otrzymaj za darmo'
        ];

        // wagi (możesz dostroić)
        const W = {
            subject_suboptimal: 5,
            subject_uppercase: 12,
            subject_exclaim: 6,
            spamword_subject: 8,
            personalization_missing: 10,
            personalization_present: -8,
            body_too_short: 10,
            body_too_long: 3,
            body_optimal: -4,
            footer_missing: 6,
            footer_present: -8,
            dirty_html: 8,
            clean_html: -6,
            missing_alt: 6,
            all_alt: -5,
            from_free_provider: 5,
            from_invalid: 10,
            from_valid: -8,
            links_excess_per: 6,
            links_excess_cap: 30,
            bad_link: 5,
            bad_link_cap: 25,
            too_many_images: 6,
            spamword_body_scale_factor: 6,
            unsubscribe_missing: 22,
            unsubscribe_present: -8,
            auth_missing_spfdkimdmarc: 18,
            ip_reputation_bad: 25,
            bounce_penalty_scale: 40,
            complaint_penalty_scale: 100
        };

        let rawScore = 0;
        const lowerContent = content.toLowerCase();
        const lowerSubject = subject.toLowerCase();

        // ===== ANALIZA TEMAT =====
        const subjLen = subject.length;
        details.subjectLength = subjLen;
        if (subjLen === 0) {
            details.subjectMissing = true;
            rawScore += 3;
        } else if (subjLen >= 20 && subjLen <= 60) {
            details.optimalSubjectLength = true;
            rawScore -= W.subject_suboptimal;
        } else {
            details.suboptimalSubjectLength = true;
            rawScore += W.subject_suboptimal;
        }

        const subjUpperCount = (subject.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g) || []).length;
        const subjUpperRatio = subjLen > 0 ? subjUpperCount / subjLen : 0;
        details.subjectUpperRatio = subjUpperRatio;
        if (subjUpperRatio > 0.6 && subjLen > 5) {
            details.subjectUppercase = true;
            rawScore += W.subject_uppercase;
        }

        const subjExclam = (subject.match(/!/g) || []).length;
        details.subjectExclaimCount = subjExclam;
        if (subjExclam >= 3) {
            details.subjectExclaim = subjExclam;
            rawScore += W.subject_exclaim;
        }

        const foundSpamInSubject = [];
        for (const w of spamWords) {
            if (w && lowerSubject.includes(w)) {
                foundSpamInSubject.push(w);
                rawScore += W.spamword_subject;
            }
        }
        details.foundSpamInSubject = foundSpamInSubject;

        // ===== ANALIZA TREŚCI =====
        const personalizationRegex = /%[A-Za-z0-9_]+%|\{\{[A-Za-z0-9_]+\}\}|\[imię\]|\[nazwisko\]|\[firma\]|\$\([A-Za-z0-9_]+\)|{{\s*first_name\s*}}/i;
        const hasPersonalization = personalizationRegex.test(content);
        details.personalization = !!hasPersonalization;
        rawScore += hasPersonalization ? W.personalization_present : W.personalization_missing;

        const plainText = (content.replace(/<[^>]*>/g, '') || '').trim();
        const textLen = plainText.length;
        details.textLength = textLen;
        if (textLen >= 100 && textLen <= 2000) {
            details.optimalLength = true;
            rawScore += W.body_optimal;
        } else if (textLen < 50) {
            details.tooShort = true;
            rawScore += W.body_too_short;
        } else if (textLen > 2000) {
            details.tooLong = true;
            rawScore += W.body_too_long;
        }

        const footerRegex = /(?:stopka|footer|kontakt|contact|tel|phone|address|adres|nip|regon|krs|zgoda|rodo)/i;
        const hasFooter = footerRegex.test(content);
        details.hasFooter = !!hasFooter;
        rawScore += hasFooter ? W.footer_present : W.footer_missing;

        const dirtyHtmlRegex = /<font\b|<center\b|<marquee\b|style=.*?;|<table[^>]*cellpadding|<iframe\b/i;
        const hasDirtyHtml = dirtyHtmlRegex.test(content);
        details.dirtyHtml = !!hasDirtyHtml;
        rawScore += hasDirtyHtml ? W.dirty_html : W.clean_html;

        const imgTags = content.match(/<img[^>]*>/gi) || [];
        const imgSrcs = [];
        const imgAltMissing = [];
        for (const t of imgTags) {
            const srcMatch = t.match(/src=(?:'|")([^'"]+)(?:'|")/i);
            if (srcMatch) imgSrcs.push(srcMatch[1]);
            if (!/alt=(?:'|")[^'"]+(?:'|")/i.test(t)) imgAltMissing.push(t);
        }
        details.imageCount = imgSrcs.length;
        details.imageList = imgSrcs;
        if (imgSrcs.length > 0) {
            rawScore += imgAltMissing.length === 0 ? W.all_alt : W.missing_alt;
        }
        if (imgSrcs.length > 5) rawScore += W.too_many_images;

        // ===== FROM i uwierzytelnienie =====
        details.from = from || null;
        if (!from) {
            details.missingFrom = true;
            rawScore += W.from_invalid;
        } else {
            const validFrom = /^[^@]+@[^.]+\.[a-z]{2,}$/i.test(from) && !/noreply|no[-]?reply/i.test(from);
            const domainMatch = from.match(/@([\w.-]+)/);
            const domain = domainMatch ? domainMatch[1].toLowerCase() : null;
            const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'onet.pl', 'wp.pl', 'o2.pl', 'tlen.pl'];
            if (validFrom) {
                details.validFromHeader = true;
                rawScore += W.from_valid;
            } else if (domain && freeProviders.includes(domain)) {
                details.freeProviderFrom = true;
                rawScore += W.from_free_provider;
            } else {
                details.invalidFrom = true;
                rawScore += W.from_invalid;
            }

            if (domain) {
                try {
                    const spfTxt = await resolveTxtSafe(domain);
                    const hasSpf = spfTxt && /v=spf1/i.test(spfTxt);
                    details.spf = !!hasSpf;

                    const dmarcTxt = await resolveTxtSafe(`_dmarc.${domain}`);
                    const hasDmarc = dmarcTxt && /v=DMARC1/i.test(dmarcTxt);
                    details.dmarc = !!hasDmarc;

                    let hasDkim = false;
                    const selectors = ['default', 'mail', 'selector1', 's1'];
                    for (const sel of selectors) {
                        const k = await resolveTxtSafe(`${sel}._domainkey.${domain}`);
                        if (k && /v=DKIM1/i.test(k)) { hasDkim = true; break; }
                    }
                    details.dkim = hasDkim;

                    const missingAuthCount = [hasSpf, hasDkim, hasDmarc].filter(x => !x).length;
                    if (missingAuthCount > 0) {
                        const authPenalty = Math.round(W.auth_missing_spfdkimdmarc * (missingAuthCount / 3));
                        details.authPenalty = authPenalty;
                        rawScore += authPenalty;
                    } else {
                        details.authOk = true;
                        rawScore -= 8;
                    }
                } catch (e) {
                    details.authCheckError = e.message || String(e);
                }
            }
        }

        // ===== LINKI =====
        const hrefRegex2 = /href=(?:'|")([^'"]+)(?:'|")/gi;
        const urlRegex2 = /\bhttps?:\/\/[^\s"'>)]+/gi;
        const hrefMatches2 = [];
        let mm;
        while ((mm = hrefRegex2.exec(content)) !== null) hrefMatches2.push(mm[1]);
        const urlMatches2 = content.match(urlRegex2) || [];
        const linkList = Array.from(new Set([...hrefMatches2, ...urlMatches2]));
        details.linkList = linkList;
        details.linkCount = linkList.length;
        if (linkList.length > 2) rawScore += Math.min((linkList.length - 2) * W.links_excess_per, W.links_excess_cap);

        const httpLinks = linkList.filter(u => /^https?:\/\//i.test(u));
        const TIMEOUT_MS = 2000;
        const MAX_CONCURRENCY = 8;
        async function checkUrl(u) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
                let resp = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
                clearTimeout(timeout);
                if (!resp.ok && (resp.status === 405 || resp.status === 501)) {
                    const controller2 = new AbortController();
                    const timeout2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
                    resp = await fetch(u, { method: 'GET', redirect: 'follow', signal: controller2.signal });
                    clearTimeout(timeout2);
                }
                return { url: u, ok: resp.ok, status: resp.status };
            } catch (e) {
                return { url: u, ok: false, error: e?.name || String(e) };
            }
        }

        const linkResults = [];
        for (let i = 0; i < httpLinks.length; i += MAX_CONCURRENCY) {
            const slice = httpLinks.slice(i, i + MAX_CONCURRENCY);
            const batch = await Promise.all(slice.map(u => checkUrl(u)));
            linkResults.push(...batch);
        }
        const badLinks = linkResults.filter(r => !r.ok);
        details.linkValidation = { checked: linkResults.length, bad: badLinks.map(x => x.url) };
        if (badLinks.length > 0) rawScore += Math.min(badLinks.length * W.bad_link, W.bad_link_cap);

        // ===== SŁOWA SPAMOWE W TREŚCI =====
        const foundSpamInBody = [];
        let spamHits = 0;
        for (const w of spamWords) {
            if (!w) continue;
            let count = 0;
            let idx = 0;
            const target = lowerContent;
            while ((idx = target.indexOf(w, idx)) !== -1) {
                count++;
                idx += w.length;
            }
            if (count > 0) {
                foundSpamInBody.push({ word: w, count });
                spamHits += count;
            }
        }
        details.foundSpamInBody = foundSpamInBody;
        if (spamHits > 0) {
            const spamPenalty = Math.min(Math.log2(spamHits + 1) * W.spamword_body_scale_factor, 30);
            rawScore += spamPenalty;
            details.spamPenalty = Math.round(spamPenalty);
        }

        // ===== UNSUBSCRIBE / COMPLIANCE =====
        let hasUnsubscribe = false;
        if (unsubscribeField === true || (typeof unsubscribeField === 'string' && unsubscribeField.length)) hasUnsubscribe = true;
        if (/unsubscribe|UNSUBSCRIBE_URL|wypisz|odsubskrybuj|list-unsubscribe|wycofaj zgodę|rodo/gi.test(content)) hasUnsubscribe = true;
        details.hasUnsubscribe = hasUnsubscribe;
        rawScore += hasUnsubscribe ? W.unsubscribe_present : W.unsubscribe_missing;

        // ===== REPUTATION METRICS =====
        if (typeof bounceRate === 'number') {
            details.bounceRate = bounceRate;
            const bouncePenalty = Math.round(Math.min(bounceRate * W.bounce_penalty_scale, W.bounce_penalty_scale));
            rawScore += bouncePenalty;
        }
        if (typeof complaintRate === 'number') {
            details.complaintRate = complaintRate;
            const complaintPenalty = Math.round(Math.min(complaintRate * W.complaint_penalty_scale, W.complaint_penalty_scale));
            rawScore += complaintPenalty;
        }
        if (typeof sendingIpReputation === 'number') {
            details.sendingIpReputation = sendingIpReputation;
            if (sendingIpReputation < -20) {
                const repPenalty = Math.min(Math.round((Math.abs(sendingIpReputation) / 100) * W.ip_reputation_bad), W.ip_reputation_bad);
                rawScore += repPenalty;
            } else if (sendingIpReputation > 20) {
                rawScore -= Math.round(sendingIpReputation / 10);
            }
        }

        // ===== Integracja z APIVOID (przykład) dla sendingIp =====
        if (sendingIp) {
            try {
                const apiKey = process.env.APIVOID_API_KEY;
                if (apiKey) {
                    const resp = await fetch('https://endpoint.apivoid.com/iprep/v1/pay-as-you-go/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ api_key: apiKey, ip: sendingIp })
                    });
                    const j = await resp.json();
                    details.reputationApi = j;
                    const detections = (j?.data?.reports?.[0]?.blacklist_count) || (j?.data?.report?.blacklists?.detections) || 0;
                    if (detections > 0) {
                        const repPenalty = Math.min(detections * 5, 30);
                        rawScore += repPenalty;
                        suggestions.push({
                            problem: `IP nadawcy (${sendingIp}) na ${detections} blacklistach`,
                            impact: `Zwiększa wynik spam o ~${repPenalty} pkt`,
                            fix: "Usuń IP z list blokujących lub użyj innego, czystego IP.",
                            scoreValue: repPenalty
                        });
                    }
                } else {
                    details.reputationApiNote = 'Brak klucza APIVOID (APIVOID_API_KEY)';
                }
            } catch (e) {
                details.reputationApiError = e.message || String(e);
            }
        }

        // ===== FINALIZACJA: normalizacja i rating =====
        let finalScore = Math.round(50 + rawScore);
        finalScore = Math.max(0, Math.min(100, finalScore));
        details.rawScore = Math.round(rawScore);

        let rating = 'low';
        if (finalScore >= 61) rating = 'high';
        else if (finalScore >= 31) rating = 'medium';

        // ===== GENEROWANIE SUGESTII (kompletne) =====
        // używamy details i wag do zbudowania listy sugestii (unikamy duplikatów)
        function pushUniqueSuggestion(obj) {
            const key = `${obj.problem}|${obj.fix}|${obj.scoreValue}`;
            if (!pushUniqueSuggestion._seen) pushUniqueSuggestion._seen = new Set();
            if (pushUniqueSuggestion._seen.has(key)) return;
            pushUniqueSuggestion._seen.add(key);
            suggestions.push(obj);
        }

        // SUBJECT
        if (details.suboptimalSubjectLength) {
            pushUniqueSuggestion({
                problem: "Nieoptymalna długość tematu",
                impact: `Zwiększa wynik spam o ${W.subject_suboptimal} pkt`,
                fix: "Upewnij się, że temat ma 20–60 znaków; testuj warianty A/B.",
                scoreValue: W.subject_suboptimal
            });
        } else if (details.optimalSubjectLength) {
            pushUniqueSuggestion({
                problem: "Optymalna długość tematu",
                impact: `Zmniejsza ryzyko oznaczenia jako spam`,
                fix: "Temat ma optymalną długość (20–60 znaków).",
                scoreValue: -W.subject_suboptimal
            });
        }
        if (details.subjectUppercase) {
            pushUniqueSuggestion({
                problem: "Zbyt dużo wielkich liter w temacie",
                impact: `Zwiększa wynik spam o ${W.subject_uppercase} pkt`,
                fix: "Używaj wielkich liter tylko tam, gdzie to konieczne.",
                scoreValue: W.subject_uppercase
            });
        }
        if (details.subjectExclaim) {
            pushUniqueSuggestion({
                problem: "Nadmierna liczba wykrzykników w temacie",
                impact: `Zwiększa wynik spam o ${W.subject_exclaim} pkt`,
                fix: "Ogranicz wykrzykniki do 0-1 w temacie.",
                scoreValue: W.subject_exclaim
            });
        }
        if (details.foundSpamInSubject && details.foundSpamInSubject.length) {
            pushUniqueSuggestion({
                problem: `Słowa kojarzone ze spamem w temacie: ${details.foundSpamInSubject.join(', ')}`,
                impact: `Każde słowo ~${W.spamword_subject} pkt`,
                fix: "Usuń lub złagodź słowa typu 'free', 'promocja', 'kup teraz' itp.",
                scoreValue: details.foundSpamInSubject.length * W.spamword_subject
            });
        }

        // PERSONALIZACJA
        if (!details.personalization) {
            pushUniqueSuggestion({
                problem: "Brak personalizacji",
                impact: `Zwiększa wynik spam o ${W.personalization_missing} pkt`,
                fix: "Dodaj znaczniki personalizacji (np. %imie%, {{first_name}}).",
                scoreValue: W.personalization_missing
            });
        } else {
            pushUniqueSuggestion({
                problem: "Personalizacja obecna",
                impact: "Zmniejsza ryzyko oznaczenia jako spam",
                fix: "Personalizuj wiadomości, aby zwiększyć zaangażowanie.",
                scoreValue: W.personalization_present
            });
        }

        // DŁUGOŚĆ TREŚCI
        if (details.tooShort) {
            pushUniqueSuggestion({
                problem: "Treść zbyt krótka",
                impact: `Zwiększa wynik spam o ${W.body_too_short} pkt`,
                fix: "Dodaj więcej wartościowej treści opisującej ofertę/korzyść.",
                scoreValue: W.body_too_short
            });
        }
        if (details.tooLong) {
            pushUniqueSuggestion({
                problem: "Treść zbyt długa",
                impact: `Zwiększa wynik spam o ${W.body_too_long} pkt`,
                fix: "Skróć treść lub podziel ją na sekcje z linkami do szczegółów.",
                scoreValue: W.body_too_long
            });
        }
        if (details.optimalLength) {
            pushUniqueSuggestion({
                problem: "Optymalna długość treści",
                impact: "Pozytywny sygnał",
                fix: "Utrzymaj treść w zakresie 100–2000 znaków.",
                scoreValue: W.body_optimal
            });
        }

        // STOPKA / RODO
        if (!details.hasFooter) {
            pushUniqueSuggestion({
                problem: "Brak stopki / informacji RODO",
                impact: `Zwiększa wynik spam o ${W.footer_missing} pkt`,
                fix: "Dodaj stopkę z danymi firmy, informacją o przetwarzaniu danych i kontakcie.",
                scoreValue: W.footer_missing
            });
        } else {
            pushUniqueSuggestion({
                problem: "Stopka i informacje RODO obecne",
                impact: "Zmniejsza ryzyko",
                fix: "Upewnij się, że dane kontaktowe i instrukcja wypisania są widoczne.",
                scoreValue: W.footer_present
            });
        }

        // HTML / obrazy
        if (details.dirtyHtml) {
            pushUniqueSuggestion({
                problem: "Przestarzałe lub nieczyste HTML",
                impact: `Zwiększa wynik spam o ${W.dirty_html} pkt`,
                fix: "Użyj semantycznego HTML5, unikaj <font>, <marquee>, inline style.",
                scoreValue: W.dirty_html
            });
        } else {
            pushUniqueSuggestion({
                problem: "Poprawne formatowanie HTML",
                impact: "Zmniejsza ryzyko",
                fix: "Utrzymuj semantyczne tagi i minimalny inline CSS.",
                scoreValue: W.clean_html
            });
        }
        if (details.imageCount > 5) {
            pushUniqueSuggestion({
                problem: "Zbyt dużo obrazków",
                impact: `Zwiększa wynik spam o ${W.too_many_images} pkt`,
                fix: "Ogranicz liczbę obrazków do 3-5 i dodaj alt teksty.",
                scoreValue: W.too_many_images
            });
        }
        if (details.imageCount > 0 && imgAltMissing.length > 0) {
            pushUniqueSuggestion({
                problem: "Brak alt tekstów przy obrazkach",
                impact: `Zwiększa wynik spam o ${W.missing_alt} pkt`,
                fix: "Dodaj alt do wszystkich <img> (poprawia też dostępność).",
                scoreValue: W.missing_alt
            });
        } else if (details.imageCount > 0) {
            pushUniqueSuggestion({
                problem: "Alt teksty dla obrazów obecne",
                impact: "Zmniejsza ryzyko",
                fix: "Utrzymuj alt dla wszystkich obrazków.",
                scoreValue: W.all_alt
            });
        }

        // FROM / auth
        if (details.missingFrom) {
            pushUniqueSuggestion({
                problem: "Brak pola From",
                impact: `Zwiększa wynik spam o ${W.from_invalid} pkt`,
                fix: "Uzupełnij prawidłowy adres nadawcy.",
                scoreValue: W.from_invalid
            });
        } else {
            if (details.freeProviderFrom) {
                pushUniqueSuggestion({
                    problem: "Adres z darmowego provider'a",
                    impact: `Zwiększa wynik spam o ${W.from_free_provider} pkt`,
                    fix: "Używaj adresu z własnej domeny (no-reply niezalecane).",
                    scoreValue: W.from_free_provider
                });
            }
            if (details.invalidFrom) {
                pushUniqueSuggestion({
                    problem: "Problem z adresem nadawcy",
                    impact: `Zwiększa wynik spam o ${W.from_invalid} pkt`,
                    fix: "Upewnij się, że adres From jest prawidłowy i znaczący.",
                    scoreValue: W.from_invalid
                });
            }
            if (details.authPenalty) {
                pushUniqueSuggestion({
                    problem: "Brak lub niepełne SPF/DKIM/DMARC",
                    impact: `Zwiększa wynik spam o ${details.authPenalty} pkt`,
                    fix: "Skonfiguruj SPF, DKIM i DMARC; monitoruj DMARC aggregate reports.",
                    scoreValue: details.authPenalty
                });
            } else if (details.authOk) {
                pushUniqueSuggestion({
                    problem: "Poprawne SPF/DKIM/DMARC",
                    impact: "Zmniejsza ryzyko",
                    fix: "Utrzymuj ustawienia i monitoruj raporty DMARC.",
                    scoreValue: -8
                });
            }
        }

        // LINKI
        if (details.linkCount > 2) {
            pushUniqueSuggestion({
                problem: "Zbyt dużo linków",
                impact: `Zwiększa wynik spam (patrz szczegóły)`,
                fix: "Ogranicz linki do 2-3 najważniejszych.",
                scoreValue: Math.min((details.linkCount - 2) * W.links_excess_per, W.links_excess_cap)
            });
        }
        if (details.linkValidation && details.linkValidation.bad && details.linkValidation.bad.length) {
            pushUniqueSuggestion({
                problem: "Niesprawne lub wolne linki",
                impact: `Każdy może dodać ~${W.bad_link} pkt`,
                fix: "Usuń lub popraw niedziałające linki; zapewnij szybkie odpowiedzi serwera.",
                scoreValue: Math.min(details.linkValidation.bad.length * W.bad_link, W.bad_link_cap)
            });
        }

        // SPAM WORDS
        if (details.foundSpamInBody && details.foundSpamInBody.length) {
            const estimated = Math.min(Math.log2(spamHits + 1) * W.spamword_body_scale_factor, 30);
            pushUniqueSuggestion({
                problem: "Słowa kojarzone ze spamem w treści",
                impact: `Może dodać ~${Math.round(estimated)} pkt`,
                fix: "Zastąp słowa reklamowe alternatywnymi określeniami.",
                scoreValue: Math.round(estimated)
            });
        }
        if (details.foundSpamInSubject && details.foundSpamInSubject.length) {
            // już dodano powyżej, ale jeszcze raz w razie potrzeby
        }

        // UNSUBSCRIBE
        if (!details.hasUnsubscribe) {
            pushUniqueSuggestion({
                problem: "Brak linku do wypisania się",
                impact: `Zwiększa wynik spam o ${W.unsubscribe_missing} pkt`,
                fix: "Dodaj wyraźny link lub instrukcję wypisania się.",
                scoreValue: W.unsubscribe_missing
            });
        } else {
            pushUniqueSuggestion({
                problem: "Link do wypisania się obecny",
                impact: `Zmniejsza wynik spam o ${-W.unsubscribe_present} pkt`,
                fix: "Upewnij się, że link działa i jest widoczny.",
                scoreValue: W.unsubscribe_present
            });
        }

        // REPUTATION / METRYKI
        if (typeof bounceRate === 'number' && bounceRate > 0.05) {
            pushUniqueSuggestion({
                problem: "Wysoki bounce rate",
                impact: "Negatywnie wpływa na reputację nadawcy",
                fix: "Oczyść listę adresów; użyj walidatora e-mail.",
                scoreValue: Math.round(Math.min(bounceRate * W.bounce_penalty_scale, W.bounce_penalty_scale))
            });
        }
        if (typeof complaintRate === 'number' && complaintRate > 0.002) {
            pushUniqueSuggestion({
                problem: "Wysoki complaint rate",
                impact: "Bardzo negatywnie wpływa na reputację",
                fix: "Segmentuj listę, uprość proces wypisu, popraw targetowanie.",
                scoreValue: Math.round(Math.min(complaintRate * W.complaint_penalty_scale, W.complaint_penalty_scale))
            });
        }
        if (typeof sendingIpReputation === 'number' && sendingIpReputation < -20) {
            pushUniqueSuggestion({
                problem: "Słaba reputacja IP",
                impact: "Znacznie podnosi ryzyko trafienia do spamu",
                fix: "Sprawdź IP w RBL, rozważ zmianę IP lub kontakt z dostawcą.",
                scoreValue: Math.min(Math.round((Math.abs(sendingIpReputation) / 100) * W.ip_reputation_bad), W.ip_reputation_bad)
            });
        }

        // jeśli gdzieś były już dodane suggestions (np. z APIVOID), są już w tablicy

        // ===== ZAPIS I WYJŚCIE =====
        const result = { score: finalScore, rating, details, suggestions };

        await campaign.update({ scoring: result.score, suggestions: result.suggestions });

        return res.send(new Response(result, true, 'Spam rating (with reputation API + suggestions) calculated successfully'));
    } catch (err) {
        return res.send(new Response(null, false, `Failed to calculate spam rating: ${err.message}`));
    }
}




// ============= IMPORT EXCEL =============

/**
 * Importuj plik Excel do wskazanej bazy danych
 * 
 * WORKFLOW:
 * 1. Najpierw wyślij plik przez POST /mailing/uploadFile (otrzymasz filename)
 * 2. Następnie wywołaj ten endpoint z otrzymanym filename
 * 
 * Parametry:
 * - databaseId (URL param): ID bazy danych do której importować
 * - filename (body): nazwa pliku zwrócona przez /mailing/uploadFile
 * - deleteAfterImport (body, opcjonalne): czy usunąć plik po imporcie (default: false)
 * 
 * Przykład użycia:
 * POST /mailing/importExcelToDatabase/5
 * {
 *   "filename": "1698764123456-contacts.xlsx",
 *   "deleteAfterImport": true
 * }
 */
export async function importExcelToDatabase(req, res) {
    try {
        const { databaseId } = req.params;
        const { filename } = req.body;

        // Walidacja parametrów
        if (!databaseId) {
            return res.send(new Response(null, false, "Database ID is required."));
        }

        if (!filename) {
            return res.send(new Response(null, false, "Filename is required."));
        }

        // Sprawdź czy plik fizycznie istnieje
        const filePath = Path.join(UPLOAD_DIR, filename);
        if (!fs.existsSync(filePath)) {
            return res.send(new Response(null, false, "File not found on server. Please upload the file first using /mailing/uploadFile endpoint."));
        }

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        // Sprawdź czy baza danych istnieje i nie jest usunięta
        const database = await Databases.findOne({
            where: {
                id: databaseId,
                deleted_at: null,
                customer_id: userData.customerId
            },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }]
        });

        if (!database) {
            return res.status(403).send(new Response(null, false, "Database not found or is deleted."));
        }

        // Wczytaj i przetwórz plik Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            return res.send(new Response(null, false, "Excel file is empty or has no valid data."));
        }

        // Rozpocznij transakcję
        const transaction = await sequelize.transaction();
        let importedAddresses = [];
        let errorList = [];
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const row of rows) {
                try {
                    if (row.email) {
                        // Sprawdź czy adres email już istnieje dla tego klienta
                        const existingEmail = await MailAddress.findOne({
                            where: {
                                mailAddress: row.email,
                                databaseId: databaseId

                            },
                            transaction
                        });

                        if (existingEmail) {
                            errorCount++;
                            errorList.push({
                                email: row.email,
                                error: "Email already exists for this customer",
                                row: row
                            });
                            continue;
                        }


                        // Dodaj nowy adres e-mail do bazy
                        const newMailRecord = await MailAddress.create({
                            mailAddress: row.email,
                            hash: Mail.HashEmail(row.email),
                            miasto: row.miasto || null,
                            rodzaj: row.rodzaj || null,
                            active: 1,
                            customerId: database.customer_id,
                            databaseId: databaseId
                        }, { transaction });

                        importedAddresses.push({
                            id: newMailRecord.id,
                            email: newMailRecord.mailAddress,
                            miasto: newMailRecord.miasto,
                            rodzaj: newMailRecord.rodzaj
                        });
                        successCount++;

                    } else {
                        errorCount++;
                        errorList.push({
                            email: 'N/A',
                            error: "Missing email address",
                            row: row
                        });
                    }
                } catch (err) {
                    errorCount++;
                    errorList.push({
                        email: row.email || 'N/A',
                        error: err.message,
                        row: row
                    });
                }
            }

            // Zatwierdź transakcję
            await transaction.commit();

            // Opcjonalnie usuń plik po pomyślnym imporcie (jeśli w body jest deleteAfterImport: true)
            if (req.body.deleteAfterImport === true) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.warn(`Failed to delete file ${filename} after import:`, err.message);
                }
            }

            const result = {
                database: {
                    id: database.id,
                    name: database.name,
                    customer: database.Customer
                },
                summary: {
                    totalRows: rows.length,
                    successCount,
                    errorCount,
                    importedAddresses: importedAddresses.length
                },
                importedAddresses: importedAddresses.slice(0, 100), // Ograniczenie do pierwszych 100 dla lepszej wydajności
                errors: errorList.slice(0, 50), // Ograniczenie do pierwszych 50 błędów
                fileDeleted: req.body.deleteAfterImport === true
            };

            const message = `Import completed. Successfully imported ${successCount} addresses, ${errorCount} errors.`;
            res.send(new Response(result, true, message));

        } catch (error) {
            // Wycofaj transakcję w przypadku błędu
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        res.send(new Response(null, false, `Failed to import Excel file. ${error.message}`));
    }
}

// ============= CRUD DATABASES =============

// Pobierz wszystkie nieusunięte bazy danych
export async function getDatabasesList(req, res) {
    try {

        const authHeader = req.headers.authorization;
        const userData = await Admin.getCurrentUserData(authHeader);
        if (!userData) {
            return unauthorized(req, res);
        }

        const databases = await Databases.findAll({
            where: {
                deleted_at: null,
                customer_id: userData.customerId
            },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }],
            order: [['id', 'DESC']]
        });
        res.send(new Response(databases, true, "Databases retrieved successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to fetch databases. ${error.message}`));
    }
}

// Pobierz jedną nieusuniętą bazę danych po ID
export async function getDatabaseInfoById(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        // Sprawdź czy baza istnieje i nie jest usunięta
        const database = await Databases.findOne({
            where: {
                id: req.params.id,
                deleted_at: null,
                customer_id: userData.customerId
            }
        });
        if (!database) {
            return res.send(new Response(null, false, "Database not found."));
        }
        const emailCount = await MailAddress.count({
            where: {
                databaseId: database.id
            }
        });
        const activeEmailCount = await MailAddress.count({
            where: {
                databaseId: database.id
            },
            group: ['active']
        })
        const unsubscribedEmailCount = await MailAddress.count({
            where: {
                databaseId: database.id,
                unsubscribesDate: {
                    [Sequelize.Op.ne]: null
                }
            }
        });
        res.status(200).send(new Response({ database, emailCount, activeEmailCount, unsubscribedEmailCount }, true, "Database retrieved successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to fetch database. ${error.message}`));
    }
}

// Pobierz jedną nieusuniętą bazę danych po ID
export async function getDatabaseById(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        // Sprawdź czy baza istnieje i nie jest usunięta
        const database = await Databases.findOne({
            where: {
                id: req.params.id,
                deleted_at: null,
                customer_id: userData.customerId
            },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }]
        });
        if (!database) {
            return res.send(new Response(null, false, "Database not found."));
        }
        res.status(200).send(new Response(database, true, "Database retrieved successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to fetch database. ${error.message}`));
    }
}

// Utwórz nową bazę danych
export async function createDatabase(req, res) {
    try {
        const { name, description, tags, rodo_flag, export_enabled, customer_id } = req.body;

        // Normalizacja typów na potrzeby MySQL/MariaDB
        const normalized = {
            name: name,
            description: description ?? null,
            tags: Array.isArray(tags) ? tags : (tags ? [].concat(tags) : []),
            rodo_flag: (rodo_flag === true || rodo_flag === 'true' || rodo_flag === 1 || rodo_flag === '1'),
            export_enabled: (export_enabled === true || export_enabled === 'true' || export_enabled === 1 || export_enabled === '1'),
            customer_id: Number(customer_id)
        };

        // Walidacja wymaganych pól
        if (!name || rodo_flag === undefined || export_enabled === undefined || !customer_id) {
            return res.send(new Response(null, false, "Required fields: name, rodo_flag, export_enabled, customer_id"));
        }

        // Sprawdź czy klient istnieje
        const customer = await Customers.findByPk(customer_id);
        if (!customer) {
            return res.send(new Response(null, false, "Customer not found."));
        }

        const newDatabase = await Databases.create(normalized);

        console.log('Created database:', newDatabase.toJSON());

        // Dodaj informacje o kliencie do odpowiedzi
        const responseData = {
            ...newDatabase.toJSON(),
            Customer: {
                id: customer.id,
                name: customer.name
            }
        };

        console.log('Response data:', responseData);

        res.send(new Response(responseData, true, "Database created successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to create database. ${error.message}`));
    }
}

// Aktualizuj nieusuniętą bazę danych po ID
export async function updateDatabase(req, res) {
    try {
        const { name, description, tags, rodo_flag, export_enabled, customer_id } = req.body;

        // Normalizacja typów (jak w createDatabase) — tylko dla pól przesłanych
        const normalized = {};
        if (name !== undefined) normalized.name = name;
        if (description !== undefined) normalized.description = description ?? null;
        if (tags !== undefined) normalized.tags = Array.isArray(tags) ? tags : (tags ? [].concat(tags) : []);
        if (rodo_flag !== undefined) normalized.rodo_flag = (rodo_flag === true || rodo_flag === 'true' || rodo_flag === 1 || rodo_flag === '1');
        if (export_enabled !== undefined) normalized.export_enabled = (export_enabled === true || export_enabled === 'true' || export_enabled === 1 || export_enabled === '1');
        if (customer_id !== undefined) normalized.customer_id = Number(customer_id);

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        // Sprawdź czy baza istnieje i nie jest usunięta
        const existingDatabase = await Databases.findOne({
            where: {
                id: req.params.id,
                deleted_at: null,
                customer_id: userData.customerId
            }
        });

        if (!existingDatabase) {
            return res.send(new Response(null, false, "Database not found or is deleted."));
        }

        // Jeśli customer_id jest podany, sprawdź czy istnieje
        if (normalized.customer_id) {
            const customer = await Customers.findByPk(normalized.customer_id);
            if (!customer) {
                return res.send(new Response(null, false, "Customer not found."));
            }
        }

        const [updated] = await Databases.update(normalized, {
            where: {
                id: req.params.id,
                deleted_at: null
            }
        });

        if (!updated) {
            return res.send(new Response(null, false, "Database not found or is deleted."));
        }

        // Pobierz zaktualizowaną bazę z relacją Customer
        const updatedDatabase = await Databases.findOne({
            where: {
                id: req.params.id,
                deleted_at: null
            },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }]
        });

        res.status(200).send(new Response(updatedDatabase, true, "Database updated successfully."));
    } catch (error) {
        res.status(500).send(new Response(null, false, `Failed to update database. ${error.message}`));
    }
}

// Oznacz bazę danych jako usuniętą (soft delete)
export async function deleteDatabase(req, res) {
    try {
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        // Sprawdź czy baza istnieje
        const database = await Databases.findOne({
            where: {
                id: req.params.id,
                deleted_at: null,
                customer_id: userData.customerId
            }
        });
        if (!database) {
            return res.send(new Response(null, false, "Database not found."));
        }

        if (database.deleted_at) {
            return res.send(new Response(null, false, "Database is already deleted."));
        }

        await database.update({
            deleted_at: new Date()
        });

        res.send(new Response(null, true, "Database deleted successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to delete database. ${error.message}`));
    }
}

// Pobierz nieusunięte bazy danych dla konkretnego klienta
export async function getDatabasesByCustomer(req, res) {
    try {
        const { customerId } = req.params;
        const userData = await Admin.getCurrentUserData(req.headers.authorization);

        if (userData.customerId !== Number(customerId)) {
            return res.status(403).send(new Response(null, false, "Unauthorized access to customer databases."));
        }

        const databases = await Databases.findAll({
            where: {
                customer_id: customerId,
                deleted_at: null
            },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }],
            order: [['name', 'ASC']]
        });

        const contactCounts = await MailAddress.findAll({
            where: {
                customerId: customerId
            },
            group: ['databaseId'],
            attributes: ['databaseId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']]
        });

        for (const db of databases) {
            const countRecord = contactCounts.find(c => c.databaseId === db.id);
            db.dataValues.contactsCount = countRecord ? parseInt(countRecord.get('count'), 10) : 0;
        }

        res.send(new Response(databases, true, "Customer databases retrieved successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to fetch customer databases. ${error.message}`));
    }
}

// Pobierz statystyki baz danych dla klienta
export async function getCustomerDatabasesStats(req, res) {
    try {
        const { customerId } = req.params;
        const userData = await Admin.getCurrentUserData(req.headers.authorization);

        if (userData.customerId !== Number(customerId)) {
            return res.status(403).send(new Response(null, false, "Unauthorized access to customer statistics."));
        }
        // Sprawdź czy klient istnieje
        const customer = await Customers.findByPk(customerId);
        if (!customer) {
            return res.status(404).send(new Response(null, false, "Customer not found."));
        }

        // Pobierz podstawowe statystyki nieusuniętych baz danych
        const databases = await Databases.findAll({
            where: {
                customer_id: customerId,
                deleted_at: null
            },
            attributes: ['id', 'name', 'tags', 'rodo_flag', 'export_enabled'],
            order: [['id', 'ASC']]
        });

        // Pobierz wszystkie kontakty klienta
        const allContacts = await MailAddress.findAll({
            where: { customerId: customerId },
            attributes: ['id', 'active', 'unsubscribesDate']
        });

        // Oblicz podstawowe statystyki
        const totalDatabases = databases.length;
        const totalContacts = allContacts.length;
        const totalActiveContacts = allContacts.filter(c => c.active === 1).length;
        const totalInactiveContacts = allContacts.filter(c => c.active === 0).length;
        const totalUnsubscribed = allContacts.filter(c => c.unsubscribesDate !== null).length;
        const totalBounced = Math.floor(totalContacts * 0.01); // Przykładowa wartość 1%

        // Statystyki wzrostu (mockowane - w rzeczywistości wymagałoby historycznych danych)
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const previousDatabases = Math.max(0, totalDatabases - Math.floor(Math.random() * 3));
        const previousContacts = Math.max(0, totalContacts - Math.floor(totalContacts * 0.1));
        const previousActiveContacts = Math.max(0, totalActiveContacts - Math.floor(totalActiveContacts * 0.08));

        // Rozkład według statusów
        const contactsByStatus = {
            active: totalActiveContacts,
            inactive: totalInactiveContacts,
            bounced: totalBounced,
            unsubscribed: totalUnsubscribed,
            pending: Math.floor(totalContacts * 0.005) // 0.5% pending
        };

        // Statystyki według baz danych (symulowane - w rzeczywistości wymagałoby relacji)
        const databasesStats = databases.map((db, index) => {
            const estimatedContacts = Math.floor(totalContacts / totalDatabases) + Math.floor(Math.random() * 500);
            const estimatedActive = Math.floor(estimatedContacts * 0.95);
            return {
                id: db.id,
                name: db.name,
                contactsCount: estimatedContacts,
                activeCount: estimatedActive,
                lastActivity: new Date().toISOString(),
                tags: db.tags || []
            };
        });

        // Aktywność w czasie (ostatnie 7 dni)
        const activityChart = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            activityChart.push({
                date: date.toISOString().split('T')[0],
                newContacts: Math.floor(Math.random() * 100),
                removedContacts: Math.floor(Math.random() * 20),
                bounces: Math.floor(Math.random() * 15),
                unsubscribes: Math.floor(Math.random() * 25)
            });
        }

        // Top tagi
        const allTags = [];
        databases.forEach(db => {
            if (db.tags && db.tags.length > 0) {
                allTags.push(...db.tags);
            }
        });

        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + Math.floor(Math.random() * 1000) + 100;
        });

        const topTags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Compliance
        const rodoDatabases = databases.filter(db => db.rodo_flag === true).length;
        const exportEnabledDatabases = databases.filter(db => db.export_enabled === true).length;

        const stats = {
            // Podstawowe statystyki
            totalDatabases,
            totalContacts,
            totalActiveContacts,
            totalInactiveContacts,
            totalBounced,
            totalUnsubscribed,

            // Statystyki wzrostu
            growth: {
                databases: {
                    current: totalDatabases,
                    previous: previousDatabases,
                    change: totalDatabases - previousDatabases,
                    changePercent: previousDatabases > 0 ?
                        Math.round(((totalDatabases - previousDatabases) / previousDatabases) * 100 * 100) / 100 : 0
                },
                contacts: {
                    current: totalContacts,
                    previous: previousContacts,
                    change: totalContacts - previousContacts,
                    changePercent: previousContacts > 0 ?
                        Math.round(((totalContacts - previousContacts) / previousContacts) * 100 * 100) / 100 : 0
                },
                activeContacts: {
                    current: totalActiveContacts,
                    previous: previousActiveContacts,
                    change: totalActiveContacts - previousActiveContacts,
                    changePercent: previousActiveContacts > 0 ?
                        Math.round(((totalActiveContacts - previousActiveContacts) / previousActiveContacts) * 100 * 100) / 100 : 0
                }
            },

            // Rozkład według statusów kontaktów
            contactsByStatus,

            // Statystyki według baz danych
            databasesStats,

            // Aktywność w czasie
            activityChart,

            // Top tagi
            topTags,

            // Wykorzystanie RODO i eksportu
            compliance: {
                rodoDatabases,
                nonRodoDatabases: totalDatabases - rodoDatabases,
                exportEnabledDatabases,
                exportDisabledDatabases: totalDatabases - exportEnabledDatabases
            },

            // Ostatnia aktualizacja
            lastUpdated: new Date().toISOString()
        };

        res.send(new Response(stats, true, "Customer databases statistics retrieved successfully."));
    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to fetch databases statistics. ${error.message}`));
    }
}

// Pobierz wszystkie kontakty przypisane do konkretnej bazy danych
export async function getDatabaseContacts(req, res) {
    try {
        const { databaseId } = req.params;
        const { page = 1, limit = 50, search = '', status = '', segment = '', sortBy = 'id', sortOrder = 'asc' } = req.query; // status, segment przyszłościowo

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        // Sprawdź czy baza danych istnieje i nie jest usunięta
        const database = await Databases.findOne({
            where: {
                id: databaseId,
                deleted_at: null,
                customer_id: userData.customerId
            },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }],
        });

        if (!database) {
            return res.send(new Response(null, false, "Database not found or is deleted."));
        }

        // Całkowita liczba kontaktów (bez filtra) – przydatne do UI
        const totalContacts = await MailAddress.count({
            where: { databaseId: databaseId }
        });

        // Budowa warunku where z opcjonalnym filtrem search i statusem
        const whereClause = { databaseId: databaseId };

        const trimmedSearch = (search || '').trim();
        if (trimmedSearch !== '') {
            const s = trimmedSearch.toLowerCase();
            const numeric = /^\d+$/.test(s) ? Number(s) : null;

            const orConditions = [
                // Tekstowe pola – LIKE case-insensitive
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('mail_address')), { [Op.like]: `%${s}%` }),
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('miasto')), { [Op.like]: `%${s}%` }),
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('rodzaj')), { [Op.like]: `%${s}%` }),
                // Jeśli kolumna phone istnieje w tabeli – uwzględnij
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('phone')), { [Op.like]: `%${s}%` })
            ];

            // Numeryczne dopasowanie (np. id albo active 0/1)
            if (numeric !== null) {
                orConditions.push({ id: numeric });
                // aktywność: jeśli szukamy '0' lub '1'
                if (numeric === 0 || numeric === 1) {
                    orConditions.push({ active: numeric });
                }
            }

            whereClause[Op.or] = orConditions;
        }

        // Filtrowanie po statusie
        const statusValue = (status || '').toString().toLowerCase();
        if (statusValue === 'active') {
            whereClause.active = 1;
        } else if (statusValue === 'inactive') {
            whereClause.active = 0;
        } else if (statusValue === 'unsubcribed' || statusValue === 'unsubscribed') {
            // wspieramy obie pisownie
            whereClause.unsubscribesDate = { [Op.ne]: null };
        }

        // Liczba kontaktów po filtrze (paginated później)
        const filteredTotal = await MailAddress.count({ where: whereClause });

        // Pobierz kontakty spełniające warunek (z paginacją)
        const contacts = await MailAddress.findAll({
            where: whereClause,
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }],
            order: [[sortBy, sortOrder]],
            limit: limit ? parseInt(limit) : undefined,
            offset: page && limit ? ((parseInt(page) - 1) * parseInt(limit)) : undefined
        });

        const result = {
            database: {
                id: database.id,
                name: database.name,
                customer: database.Customer
            },
            contacts: contacts.map(contact => ({
                id: contact.id,
                mailAddress: contact.mailAddress,
                miasto: contact.miasto,
                rodzaj: contact.rodzaj,
                phone: contact.phone,
                active: contact.active,
                unsubscribesDate: contact.unsubscribesDate,
                hash: contact.hash,
                createdAt: contact.created_at,
                updatedAt: contact.updated_at
            })),
            // total – pełna liczba kontaktów w bazie (bez filtra)
            total: totalContacts,
            // filteredTotal – liczba rekordów spełniających filtr search
            filteredTotal,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : totalContacts,
            search: trimmedSearch,
            status: statusValue || null,
            filterApplied: (trimmedSearch !== '') || (statusValue !== ''),
            summary: {
                // liczba kontaktów zwróconych w tej stronie paginacji
                pageContacts: contacts.length,
                filteredTotal,
                totalContacts,
                activeContacts: contacts.filter(c => c.active === 1).length,
                inactiveContacts: contacts.filter(c => c.active === 0).length,
                unsubscribedContacts: contacts.filter(c => c.unsubscribesDate !== null).length
            }
        };

        res.send(new Response(result, true, "Database contacts retrieved successfully."));
    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to fetch database contacts. ${error.message}`));
    }
}

/**
 * Wypisz kontakt ze wszystkich list mailingowych danego klienta
 * 
 * Endpoint: POST /mailing/unsubscribe/:contactId
 * 
 * Parametry:
 * - contactId (URL param): ID kontaktu do wypisania
 * - customerId (URL param): ID klienta dla weryfikacji przynależności
 * 
 * Funkcjonalność:
 * 1. Sprawdza czy kontakt należy do danego klienta
 * 2. Wypisuje główny kontakt (ustawia unsubscribesDate i active=0)
 * 3. Znajduje i wypisuje wszystkie duplikaty tego samego emaila dla klienta
 * 4. Zwraca szczegóły operacji
 * 
 * Przykład użycia:
 * POST /mailing/unsubscribe/123
 */
export async function unsubscribeContact(req, res) {
    try {
        const { contactHash } = req.params;

        // Walidacja parametrów
        if (!contactHash) {
            return res.send(new Response(null, false, "Contact hash is required."));
        }

        // Znajdź kontakt należący do danego klienta
        const contact = await MailAddress.findOne({
            where: {
                hash: contactHash,
            }
        });

        // Sprawdź czy klient istnieje
        const customer = await Customers.findByPk(contact.customerId);
        if (!customer) {
            return res.send(new Response(null, false, "Customer not found."));
        }


        if (!contact) {
            return res.send(new Response(null, false, "Contact not found for this customer."));
        }

        // Wypisz kontakt - ustaw datę wypisania i zmień status na nieaktywny
        const unsubscribeDate = new Date();

        await MailAddress.update(
            {
                unsubscribesDate: unsubscribeDate,
                active: 0
            },
            {
                where: {
                    mailAddress: contact.mailAddress,
                    customerId: contact.customerId,
                    unsubscribesDate: null
                }
            }
        );

        const data = await MailAddress.findOne({
            where: {
                hash: contactHash,
            }
        });

        const result = {
            contact: data,
        };

        const message = `Contact unsubscribed successfully in all databases.`;

        res.send(new Response(result, true, message));

    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to unsubscribe contact. ${error.message}`));
    }
}



export async function resubscribeContact(req, res) {
    try {
        const { contactHash } = req.params;

        // Walidacja parametrów
        if (!contactHash) {
            return res.send(new Response(null, false, "Contact hash is required."));
        }

        // Znajdź kontakt należący do danego klienta
        const contact = await MailAddress.findOne({
            where: {
                hash: contactHash,
            }
        });

        // Sprawdź czy klient istnieje
        const customer = await Customers.findByPk(contact.customerId);
        if (!customer) {
            return res.send(new Response(null, false, "Customer not found."));
        }


        if (!contact) {
            return res.send(new Response(null, false, "Contact not found for this customer."));
        }


        await MailAddress.update(
            {
                unsubscribesDate: null,
                active: 1
            },
            {
                where: {
                    mailAddress: contact.mailAddress,
                    customerId: contact.customerId
                }
            }
        );



        const data = await MailAddress.findOne({
            where: {
                hash: contactHash,
            }
        });

        const result = {
            contact: data,
        };

        const message = `Contact resubscribed successfully in all databases.`;

        res.send(new Response(result, true, message));

    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to resubscribe contact. ${error.message}`));
    }

}




/**
 * Aktualizuj dane kontaktu
 * 
 * Endpoint: POST /mailing/contactUpdate
 * 
 * Parametry (body JSON):
 * - id: number - ID kontaktu do aktualizacji (wymagane)
 * - mailAddress: string - nowy adres email (opcjonalne)
 * - miasto: string - miasto (opcjonalne)
 * - rodzaj: string - rodzaj kontaktu (opcjonalne)
 * - active: number (0/1) - status aktywności (opcjonalne)
 * - databaseId: number - ID bazy danych (opcjonalne)
 * - customerId: number - ID klienta (opcjonalne, dla weryfikacji)
 * 
 * Przykład użycia:
 * POST /mailing/contactUpdate
 * {
 *   "id": 123,
 *   "mailAddress": "new.email@example.com",
 *   "miasto": "Kraków",
 *   "rodzaj": "vip",
 *   "active": 1
 * }
 */
export async function contactUpdate(req, res) {
    try {
        const { id, mailAddress, miasto, rodzaj, active, databaseId, customerId, phone } = req.body;

        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        if (customerId && userData.customerId !== Number(customerId)) {
            return res.status(403).send(new Response(null, false, "Unauthorized access to update contact for this customer."));
        }
        // Walidacja wymaganego parametru
        if (!id) {
            return res.send(new Response(null, false, "Contact ID is required."));
        }

        // Sprawdź czy kontakt istnieje
        let whereCondition = { id: id };
        if (customerId) {
            whereCondition.customerId = customerId; // Dodatkowa weryfikacja bezpieczeństwa
        }

        const existingContact = await MailAddress.findOne({
            where: whereCondition,
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }]
        });

        if (!existingContact) {
            const message = customerId
                ? "Contact not found or does not belong to specified customer."
                : "Contact not found.";
            return res.send(new Response(null, false, message));
        }

        // Sprawdź czy nowy email już istnieje (jeśli email jest zmieniany)
        if (mailAddress && mailAddress !== existingContact.mailAddress) {
            const emailExists = await MailAddress.findOne({
                where: {
                    mailAddress: mailAddress,
                    customerId: existingContact.customerId,
                    databaseId: existingContact.databaseId || databaseId,
                    id: { [Op.ne]: id } // Wyklucz aktualny kontakt
                }
            });

            if (emailExists) {
                return res.send(new Response(null, false, "Email address already exists for this customer in database."));
            }
        }

        // Sprawdź czy baza danych istnieje (jeśli databaseId jest zmieniany)
        if (databaseId && databaseId !== existingContact.databaseId) {
            const database = await Databases.findOne({
                where: {
                    id: databaseId,
                    deleted_at: null,
                    customer_id: existingContact.customerId // Baza musi należeć do tego samego klienta
                }
            });

            if (!database) {
                return res.send(new Response(null, false, "Database not found or does not belong to the same customer."));
            }
        }

        // Przygotuj dane do aktualizacji (tylko pola które zostały przekazane)
        const updateData = {};
        if (mailAddress !== undefined) updateData.mailAddress = mailAddress;
        if (miasto !== undefined) updateData.miasto = miasto;
        if (rodzaj !== undefined) updateData.rodzaj = rodzaj;
        if (active !== undefined) updateData.active = active;
        if (databaseId !== undefined) updateData.databaseId = databaseId;
        if (phone !== undefined) updateData.phone = phone;

        // Jeśli nie ma żadnych danych do aktualizacji
        if (Object.keys(updateData).length === 0) {
            return res.send(new Response(null, false, "No fields to update provided."));
        }

        // Wykonaj aktualizację
        await existingContact.update(updateData);

        // Pobierz zaktualizowany kontakt z relacjami
        const updatedContact = await MailAddress.findOne({
            where: { id: id },
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }]
        });

        const result = {
            contact: {
                id: updatedContact.id,
                mailAddress: updatedContact.mailAddress,
                miasto: updatedContact.miasto,
                rodzaj: updatedContact.rodzaj,
                active: updatedContact.active,
                databaseId: updatedContact.databaseId,
                customerId: updatedContact.customerId,
                unsubscribesDate: updatedContact.unsubscribesDate,
                createdAt: updatedContact.created_at,
                updatedAt: updatedContact.updated_at
            },
            customer: updatedContact.Customer,
            updatedFields: Object.keys(updateData),
            updateCount: Object.keys(updateData).length
        };

        res.send(new Response(result, true, "Contact updated successfully."));

    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to update contact. ${error.message}`));
    }
}

/**
 * Dodaj nowy kontakt do wybranej bazy danych
 * 
 * Endpoint: POST /mailing/contactAdd
 * 
 * Parametry (body JSON):
 * - mailAddress: string - adres email (wymagane)
 * - databaseId: number - ID bazy danych (wymagane)
 * - miasto: string - miasto (opcjonalne)
 * - rodzaj: string - rodzaj kontaktu (opcjonalne)
 * - phone: string - telefon (opcjonalne)
 * - active: number (0/1) - status aktywności (domyślnie 1)
 * 
 * Uwaga: ID klienta jest pobierane z tokena JWT
 * 
 * Przykład użycia:
 * POST /mailing/contactAdd
 * Authorization: Bearer <token>
 * {
 *   "mailAddress": "new.user@example.com",
 *   "databaseId": 5,
 *   "miasto": "Warszawa",
 *   "rodzaj": "lead"
 * }
 */
export async function contactAdd(req, res) {
    try {
        const { mailAddress, databaseId, miasto, rodzaj, phone, active = 1 } = req.body;

        // Walidacja wymaganych parametrów
        if (!mailAddress || !databaseId) {
            return res.send(new Response(null, false, "Email address and database ID are required."));
        }

        // Walidacja formatu email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mailAddress)) {
            return res.send(new Response(null, false, "Invalid email address format."));
        }

        // Pobierz ID klienta z tokena
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.send(new Response(null, false, "Authorization token required."));
        }

        const token = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = Auth.decodeToken(token);
        } catch (err) {
            return res.send(new Response(null, false, "Invalid or expired token."));
        }

        // Pobierz użytkownika i jego klienta z bazy danych
        const user = await Admin.getUserByEmail(decodedToken.data.userEmail);
        if (!user || !user.Customer) {
            return res.send(new Response(null, false, "User not found or not assigned to any customer."));
        }

        const customerId = user.Customer.id;

        // Sprawdź czy baza danych istnieje i należy do tego klienta
        const database = await Databases.findOne({
            where: {
                id: databaseId,
                deleted_at: null,
                customer_id: customerId
            }
        });

        if (!database) {
            return res.send(new Response(null, false, "Database not found or does not belong to your customer account."));
        }

        // Sprawdź czy email już istnieje dla tego klienta
        const existingEmail = await MailAddress.findOne({
            where: {
                mailAddress: mailAddress,
                databaseId: databaseId,
                customerId: customerId
            }
        });

        if (existingEmail) {
            return res.send(new Response(null, false, "Email address already exists for this customer."));
        }

        // Utwórz nowy kontakt
        const newContact = await MailAddress.create({
            mailAddress,
            miasto: miasto || null,
            hash: Mail.HashEmail(mailAddress),
            rodzaj: rodzaj || null,
            phone: phone || null,
            active: active,
            customerId: customerId,
            databaseId: databaseId
        });

        // Pobierz utworzony kontakt z relacjami
        const createdContact = await MailAddress.findByPk(newContact.id, {
            include: [{
                model: Customers,
                as: 'Customer',
                attributes: ['id', 'name']
            }]
        });

        const result = {
            contact: {
                id: createdContact.id,
                mailAddress: createdContact.mailAddress,
                miasto: createdContact.miasto,
                rodzaj: createdContact.rodzaj,
                phone: createdContact.phone,
                active: createdContact.active,
                databaseId: createdContact.databaseId,
                customerId: createdContact.customerId,
                unsubscribesDate: createdContact.unsubscribesDate,
                createdAt: createdContact.created_at,
                updatedAt: createdContact.updated_at
            },
            customer: createdContact.Customer,
            database: {
                id: database.id,
                name: database.name
            }
        };

        res.send(new Response(result, true, "Contact added successfully."));

    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to add contact. ${error.message}`));
    }
}


export async function contactDelete(req, res) {
    try {
        const { contactId } = req.params;

        // Pobierz ID klienta z tokena
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.send(new Response(null, false, "Authorization token required."));
        }

        const token = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = Auth.decodeToken(token);
        } catch (err) {
            return res.send(new Response(null, false, "Invalid or expired token."));
        }

        // Pobierz użytkownika i jego klienta z bazy danych
        const user = await Admin.getUserByEmail(decodedToken.data.userEmail);
        if (!user || !user.Customer) {
            return res.send(new Response(null, false, "User not found or not assigned to any customer."));
        }

        const customerId = user.Customer.id;

        // Sprawdź czy kontakt istnieje i należy do tego klienta
        const contact = await MailAddress.findOne({
            where: {
                id: contactId,
                customerId: customerId
            }
        });

        if (!contact) {
            return res.send(new Response(null, false, "Contact not found or does not belong to your customer account."));
        }

        // Usuń kontakt
        await MailAddress.destroy({
            where: {
                id: contactId
            }
        });

        res.send(new Response(null, true, "Contact deleted successfully."));

    } catch (error) {
        console.log(error);
        res.send(new Response(null, false, `Failed to delete contact. ${error.message}`));
    }
}

// ============= EXPORT CONTACTS =============
/**
 * Eksport wszystkich kontaktów z bazy o podanym ID
 * 
 * Endpoint (GET): /mailing/exportDatabaseContacts/:databaseId
 * Query:
 *  - format: 'csv' | 'json' | 'xlsx' (domyślnie 'csv')
 *  - fields: lista pól rozdzielona przecinkami; dostępne: 
 *            id, mailAddress, miasto, rodzaj, phone, active, unsubscribesDate, hash, databaseId, customerId, created_at, updated_at
 *            (jeśli puste – użyte zostaną domyślne)
 *  - status: 'active' | 'inactive' | 'unsubscribed' (lub 'unsubcribed') – filtr statusu
 *  - segment: (na przyszłość) – obecnie ignorowane
 */
export async function exportDatabaseContacts(req, res) {
    try {
        const { databaseId } = req.params;
        const { format = 'csv', fields = '', status = '', segment = '' } = req.query;

        const userData = await Admin.getCurrentUserData(req.headers.authorization);

        // Weryfikacja bazy i przynależności do klienta
        const database = await Databases.findOne({
            where: {
                id: databaseId,
                deleted_at: null,
                customer_id: userData.customerId
            }
        });

        if (!database) {
            return res.send(new Response(null, false, "Database not found or is deleted."));
        }

        // Zbuduj warunek where z filtrem status
        const whereClause = { databaseId: databaseId };
        const statusValue = (status || '').toString().toLowerCase();
        if (statusValue === 'active') {
            whereClause.active = 1;
        } else if (statusValue === 'inactive') {
            whereClause.active = 0;
        } else if (statusValue === 'unsubcribed' || statusValue === 'unsubscribed') {
            whereClause.unsubscribesDate = { [Op.ne]: null };
        }

        // Pobierz wszystkie kontakty dla bazy (bez paginacji)
        const contacts = await MailAddress.findAll({ where: whereClause, order: [['created_at', 'ASC']] });

        // Lista dozwolonych pól (po właściwościach modelu)
        const allowedFields = [
            'id', 'mailAddress', 'miasto', 'rodzaj', 'phone', 'active', 'unsubscribesDate', 'hash',
            'databaseId', 'customerId', 'created_at', 'updated_at'
        ];

        // Domyślne pola eksportu (czytelny CSV)
        const defaultFields = ['id', 'mailAddress', 'miasto', 'rodzaj', 'phone', 'active', 'unsubscribesDate', 'created_at'];

        const selectedFields = (fields || '')
            .split(',')
            .map(f => f.trim())
            .filter(Boolean);

        const exportFields = (selectedFields.length > 0 ? selectedFields : defaultFields)
            .filter(f => allowedFields.includes(f));

        // Jeśli nic nie zostało po walidacji – wróć do default
        const finalFields = exportFields.length > 0 ? exportFields : defaultFields;

        // Pola numeryczne – tylko te NIE będą wymuszały cudzysłowów
        const numericFields = new Set(['id', 'active', 'databaseId', 'customerId']);

        // Funkcja pomocnicza do CSV z opcją wymuszenia cudzysłowu dla pól tekstowych
        const escapeCsv = (val, forceQuote = false) => {
            if (val === null || val === undefined) return '';
            let s = String(val);
            // zamieniamy CRLF na spację, żeby nie psuć struktury
            s = s.replace(/\r\n|\n|\r/g, ' ');
            // podwój cudzysłowy wewnątrz
            s = s.replace(/"/g, '""');
            if (forceQuote || /[",;]/.test(s)) {
                s = '"' + s + '"';
            }
            return s;
        };

        const fileBase = `database_${databaseId}_contacts`;

        const fmt = String(format).toLowerCase();
        if (fmt === 'json') {
            // JSON – zwracamy obiekty z wybranymi polami
            const jsonData = contacts.map(c => {
                const obj = {};
                for (const f of finalFields) obj[f] = c[f];
                return obj;
            });

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.json"`);
            return res.status(200).send(jsonData);
        }

        if (fmt === 'xlsx' || fmt === 'excel' || fmt === 'xls') {
            // EXCEL – budujemy arkusz w kolejności kolumn z finalFields
            const normalizeCell = (val) => {
                if (val === null || val === undefined) return '';
                if (val instanceof Date) return val.toISOString();
                return val;
            };
            const aoa = [finalFields];
            for (const c of contacts) {
                aoa.push(finalFields.map(f => normalizeCell(c[f])));
            }

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            XLSX.utils.book_append_sheet(wb, ws, 'contacts');
            const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.xlsx"`);
            return res.status(200).send(buf);
        }

        // CSV – budujemy nagłówek i wiersze
        const header = finalFields.join(',');
        const rows = contacts.map(c => finalFields
            .map(f => escapeCsv(c[f], !numericFields.has(f)))
            .join(','));
        const csv = [header, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.csv"`);
        return res.status(200).send(csv);
    } catch (error) {
        console.log(error);
        return res.send(new Response(null, false, `Failed to export contacts. ${error.message}`));
    }
}
