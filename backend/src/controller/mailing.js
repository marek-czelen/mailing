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
        res.status(200).send(new Response(campaigns, true, "Data received successfully."));
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
        res.status(200).send(new Response(campaign, true, "Data received successfully."));
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
    await computeSpamRating({ body: { id: newCampaign.id } }, { send: () => {} });
        
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
        if (req.body.textContent !== undefined) updateData.textContent = req.body.textContent;
        if (req.body.htmlContent !== undefined) updateData.htmlContent = req.body.htmlContent;
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
        
        const userData = await Admin.getCurrentUserData(req.headers.authorization);
        const [updated] = await MarketingCampanies.update(updateData, {
            where: { id: req.params.id, customerId: userData.customerId }
        });

        const updatedCampaign = await MarketingCampanies.findOne({
            where: { id: req.params.id, customerId: userData.customerId }
        });
        // Automatycznie licz scoring i sugestie po edycji kampanii

    await computeSpamRating({ body: { id: updatedCampaign.id } }, { send: () => {} });

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




const HF_API_KEY = "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"; // ustaw swój token Hugging Face


export async function listModels(req, res) {
    try {
        const response = await fetch("https://router.huggingface.co/v1/models", {
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            return res.send(new Response(null, false, `HTTP ${response.status}: ${text}`));
        }

        const models = await response.json();
        // Zwróć listę modeli w odpowiedzi
        res.send(new Response(models.data, true, "Models fetched successfully."));
    } catch (err) {
        res.send(new Response(null, false, `Failed to fetch models: ${err.message}`));
    }
}


export async function generateMailContent(req, res) {
    console.log("generateMailContent called");

    const prompt = req.body.prompt;
    if (!prompt) {
        return res.send(new Response(null, false, "Brak promptu do wygenerowania treści."));
    }

    try {
        const model = "togethercomputer/GPT-NeoXT-Chat-Base-20B"; // Możesz zmienić na inny model dostępny na HF

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { max_new_tokens: 300 },
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const resultJson = await response.json();

        // Obsługa formatu zwracanego przez HF
        let generatedText = "";
        if (Array.isArray(resultJson) && resultJson[0]?.generated_text) {
            generatedText = resultJson[0].generated_text;
        } else if (resultJson.generated_text) {
            generatedText = resultJson.generated_text;
        } else {
            generatedText = JSON.stringify(resultJson);
        }

        res.send(new Response(generatedText, true, "OK."));

    } catch (error) {
        res.send(new Response(null, false, `Failed to generate mail content: ${error.message}`));
    }
}


/**
 * computeSpamRating - oblicza ocenę SPAM dla treści mailingu
 *
 * Parametry (body JSON):
 * - id: number - ID kampanii marketingowej
 *
 * Zwracana wartość (Response JSON - pole `data`):
 * {
 *   score: number,        // 0-100 - wyliczona punktacja spamowa (im wyższa, tym bardziej "spam")
 *   rating: 'low'|'medium'|'high',
 *   details: {            // szczegółowe składowe oceny
 *     optimalSubjectLength?: boolean,
 *     suboptimalSubjectLength?: boolean,
 *     subjectUppercase?: boolean,
 *     subjectExclaim?: number,
 *     foundSpamInSubject: string[],
 *     personalization?: boolean,
 *     noPersonalization?: boolean,
 *     textLength: number,
 *     optimalLength?: boolean,
 *     tooShort?: boolean,
 *     tooLong?: boolean,
 *     hasFooter?: boolean,
 *     noFooter?: boolean,
 *     cleanHtml?: boolean,
 *     dirtyHtml?: boolean,
 *     hasAltTexts?: boolean,
 *     missingAltTexts?: boolean,
 *     validFromHeader?: boolean,
 *     freeProviderFrom?: boolean,
 *     invalidFrom?: boolean,
 *     missingFrom?: boolean,
 *     linkCount: number,
 *     linkList: string[],
 *     linkValidation?: object,
 *     imageCount: number,
 *     imageList: string[],
 *     foundSpamInBody: Array<{word: string, count: number}>,
 *     hasUnsubscribe: boolean
 *   },
 *   suggestions: Array<{              // sugestie poprawy - każdy test może dodawać (+) lub odejmować (-) punkty
 *     problem: string,                // opis problemu/cechy
 *     impact: string,                 // wpływ na wynik
 *     fix: string,                    // sugerowane rozwiązanie
 *     scoreValue: number              // wartość punktowa (+dodatnia dla kar, -ujemna dla bonusów)
 *   }>
 * }
 *
 * Reguły scoringu (każdy test może zarówno dodawać jak i odejmować punkty):
 * 
 * TEMAT:
 * - optymalna długość 20-60 znaków: -7 | nieoptymalna: +5
 * - duża proporcja wielkich liter: +12
 * - nadmiar wykrzykników (>=3): +6
 * - słowa kluczowe spamowe: +8 za każde wystąpienie
 * 
 * TREŚĆ:
 * - personalizacja (znaczniki %%, {{}}, []): -10 | brak: +10
 * - optymalna długość 100-2000 znaków: -5 | za krótka (<50): +10 | za długa (>2000): +3
 * - profesjonalna stopka: -8 | brak: +5
 * - czyste semantyczne HTML: -7 | przestarzałe znaczniki: +8
 * - alt teksty przy wszystkich obrazkach: -5 | brak: +6
 * 
 * NADAWCA:
 * - spersonalizowany adres z własnej domeny: -8
 * - darmowy provider (gmail, onet itp.): +4
 * - noreply/nieprawidłowy: +8
 * 
 * LINKI I OBRAZY:
 * - więcej niż 2 linki: +(linkCount-2)*6 (max +30)
 * - niesprawne/wolne linki: +5 za każdy (max +25)
 * - dużo obrazków (>5): +6
 * 
 * COMPLIANCE:
 * - link wypisania się obecny: -8 | brak: +22
 * 
 * SPAM WORDS:
 * - słowa spamowe w treści: +3 za wystąpienie (max +30)
 *
 * Końcowy wynik:
 * 1. Zaczynamy od bazy 50 punktów
 * 2. Każdy test dodaje lub odejmuje punkty bezpośrednio od score
 * 3. Wynik normalizowany do zakresu 0-100
 * 4. Rating przydzielany według progów: 0-30 low, 31-60 medium, 61-100 high
 *
 * Przykład wywołania:
 * POST /mailing/spamRating
 * Body: { "id": 123 }
 */
// computeSpamRating: pobiera tylko id kampanii, resztę parametrów pobiera z bazy
export async function computeSpamRating(req, res) {
    try {
        const { id } = req.body || {};
        if (!id) {
            return res.send(new Response(null, false, 'Brak id kampanii.'));
        }
        // Pobierz kampanię z bazy
        const campaign = await MarketingCampanies.findByPk(id);
        if (!campaign) {
            return res.send(new Response(null, false, 'Nie znaleziono kampanii.'));
        }
        // Pobierz parametry z modelu
        const subject = campaign.subject || '';
        const html = campaign.htmlContent || '';
        const from = campaign.from || '';
        const unsubscribe = campaign.unsubscribe || null;
        // Treść tekstowa (opcjonalnie, jeśli chcesz dodać)
        const text =  campaign.textContent || '';
        const content = (html || text || '').toString();

        // Inicjalizuj scoring (zaczynamy od 0, testy mogą dodawać lub odejmować punkty)
        let score = 0;
        const details = {};

        // lista słów typowo kojarzonych ze spamem (PL i EN)
        const spamWords = [
            // angielskie
            'free', 'buy now', 'click here', 'winner', 'win', 'prize', 'urgent', 'limited', 'offer',
            'money', 'cash', 'credit', 'cheap', 'guarantee', 'congratulations', 'act now', 'action required',
            'amazing', 'bargain', 'best price', 'bonus', 'call now', 'cash bonus', 'casino', 'clearance',
            'compare rates', 'discount', 'double your', 'earn extra', 'eliminate debt', 'extra cash',
            'fast cash', 'financial freedom', 'free access', 'free consultation', 'free gift', 'free hosting',
            'free info', 'free investment', 'free membership', 'free money', 'free offer', 'free preview',
            'free quote', 'free trial', 'free website', 'fantastic deal', 'give away', 'great offer',
            'guarantee', 'increase sales', 'increase traffic', 'incredible deal', 'investment', 'join millions',
            'laser printer', 'limited time', 'lose weight', 'lottery', 'lower rates', 'luxury', 'make money',
            'million dollars', 'miracle', 'money back', 'no cost', 'no fees', 'no obligation', 'no purchase',
            'no strings attached', 'once in lifetime', 'order now', 'password', 'penis enlargement', 'porn',
            'pre-approved', 'prestige', 'prince', 'promise', 'pure profit', 'refinance', 'remove wrinkles',
            'reverses aging', 'risk-free', 'satisfaction', 'save big', 'save money', 'save up to', 'special deal',
            'special discount', 'special offer', 'success', 'time limited', 'urgent', 'viagra', 'warranty',
            'web traffic', 'while supplies last', 'winner', 'winning', 'you have been selected',
            // polskie
            'okazja', 'promocja', 'wyprzedaż', 'rabat', 'gratisy', 'za darmo', 'darmowy', 'darmowa',
            'super cena', 'super oferta', 'nie przegap', 'ostatnia szansa', 'tylko teraz', 'tylko dzisiaj',
            'promocja dnia', 'hit cenowy', 'bestseller', 'nowość', 'extra rabat', 'extra bonus',
            'dodatkowy rabat', 'dodatkowa zniżka', 'kup teraz', 'zamów', 'zamawiaj', 'kliknij tutaj',
            'sprawdź teraz', 'wygrana', 'wygrałeś', 'zostałeś wybrany', 'zostałaś wybrana', 'prezent',
            'bonus', 'kredyt', 'pożyczka', 'chwilówka', 'tania rata', 'niskie raty', 'bez prowizji',
            'bez opłat', 'bez zobowiązań', 'oszczędź', 'zaoszczędź', 'zniżka', 'tanie', 'najtańszy',
            'najtaniej', 'szybka gotówka', 'szybkie pieniądze', 'pewny zysk', 'gwarantowany zysk',
            'zarabiaj', 'dorabiaj', 'praca dodatkowa', 'praca zdalna', 'biznes', 'inwestycja',
            'wspaniała okazja', 'nie czekaj', 'zapisz się', 'zarejestruj się', 'odbierz bonus',
            'odbierz nagrodę', 'odbierz prezent', 'specjalna oferta', 'limitowana oferta',
            'ograniczona oferta', 'oferta specjalna', 'złota okazja', 'wyjątkowa okazja',
            'niesamowita okazja', 'pilne', 'ostatnie sztuki', 'końcówka serii', 'wyprzedaż magazynowa',
            'likwidacja sklepu', 'likwidacja magazynu', 'wszystko musi się sprzedać'
        ];

        // 1) analiza tematu
        const subj = subject.toString();
        const subjLength = subj.length;

        // Test: Optymalna długość tematu
        if (subject && subjLength >= 20 && subjLength <= 60) {
            score -= 7;
            details.optimalSubjectLength = true;
        } else if (subjLength > 0) {
            score += 5;
            details.suboptimalSubjectLength = true;
        }

        // Test: Wielkie litery w temacie
        const upperCount = (subj.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g) || []).length;
        const upperRatio = subjLength > 0 ? upperCount / subjLength : 0;
        if (upperRatio > 0.6 && subjLength > 5) {
            score += 12;
            details.subjectUppercase = true;
        }

        // Test: Wykrzykniki w temacie
        const exclam = (subj.match(/!/g) || []).length;
        if (exclam >= 3) { 
            score += 6; 
            details.subjectExclaim = exclam; 
        }

        // Test: Spam words w temacie
        const foundSpamInSubject = [];
        for (const w of spamWords) {
            if (subj.toLowerCase().includes(w)) {
                score += 8;
                foundSpamInSubject.push(w);
            }
        }
        details.foundSpamInSubject = foundSpamInSubject;

        // 2) analiza treści
        const bodyLower = content.toLowerCase();

        // Test: Personalizacja
        const personalizationRegex = /%[A-Za-z_]+%|\{\{[A-Za-z_]+\}\}|\[imię\]|\[nazwisko\]|\[firma\]/g;
        const hasPersonalization = personalizationRegex.test(content);
        if (hasPersonalization) {
            score -= 10;
            details.personalization = true;
        } else {
            score += 10;
            details.noPersonalization = true;
        }

        // Test: Długość treści
        const textLen = (content.replace(/<[^>]*>/g, '') || '').trim().length;
        details.textLength = textLen;
        if (textLen >= 100 && textLen <= 2000) {
            score -= 5;
            details.optimalLength = true;
        } else if (textLen < 50) {
            score += 10;
            details.tooShort = true;
        } else if (textLen > 2000) {
            score += 3;
            details.tooLong = true;
        }

        // Test: Profesjonalna stopka
        const footerRegex = /(?:stopka|footer|kontakt|contact|tel|phone|address|adres|nip|regon|krs)/i;
        if (footerRegex.test(content)) {
            score -= 8;
            details.hasFooter = true;
        } else {
            score += 5;
            details.noFooter = true;
        }

        // Test: Formatowanie HTML
        const hasCleanHtml = !/<font|<center|<marquee|style=/i.test(content) && 
                           /<(p|div|header|footer|section|article|h[1-6]|ul|ol|li|table)[^>]*>/i.test(content);
        if (hasCleanHtml) {
            score -= 7;
            details.cleanHtml = true;
        } else if (/<font|<center|<marquee/.test(content)) {
            score += 8;
            details.dirtyHtml = true;
        }

        // Test: Alt teksty przy obrazkach

        // Test: Alt teksty przy obrazkach
        const imgTags = content.match(/<img[^>]+>/g) || [];
        const altTexts = imgTags.filter(tag => /alt=["'][^"']+["']/i.test(tag));
        if (imgTags.length > 0) {
            if (altTexts.length === imgTags.length) {
                score -= 5;
                details.hasAltTexts = true;
            } else {
                score += 6;
                details.missingAltTexts = true;
            }
        }

        // Test: Nagłówek From
        if (from && typeof from === 'string') {
            const validFromRegex = /^[^@]+@[^.]+\.[a-z]{2,}$/i;
            const isValidFrom = validFromRegex.test(from) && !from.includes('noreply') && !from.includes('no-reply');
            if (isValidFrom) {
                score -= 8;
                details.validFromHeader = true;
            } else {
                const domainMatch = from.match(/@([\w.-]+)/);
                const domain = domainMatch ? domainMatch[1].toLowerCase() : '';
                const freeProviders = ['gmail.com','yahoo.com','hotmail.com','onet.pl','wp.pl','o2.pl'];
                if (freeProviders.includes(domain)) { 
                    score += 4; 
                    details.freeProviderFrom = true;
                } else if (!domain || from.includes('noreply') || from.includes('no-reply')) {
                    score += 8;
                    details.invalidFrom = true;
                }
            }
        } else {
            score += 8;
            details.missingFrom = true;
        }

        // Wyliczanie listy linków i obrazów bezpośrednio z treści (zawsze)
        let m;
        const hrefRegex = /href=(?:\"|\')([^\"']+)(?:\"|\')/gi;
        const urlRegex = /\bhttps?:\/\/[^\s\"'>)]+/gi;
        const hrefMatches = [];
        while ((m = hrefRegex.exec(content)) !== null) {
            hrefMatches.push(m[1]);
        }
        const urlMatches = content.match(urlRegex) || [];
        const linkList = Array.from(new Set([...hrefMatches, ...urlMatches]));
        const linkCount = linkList.length;
        details.linkCount = linkCount;
        details.linkList = linkList;
        if (linkCount > 2) score += Math.min((linkCount - 2) * 6, 30);

        // Walidacja poprawności linków (sprawdzamy wszystkie linki http/https ze ścisłym timeoutem)
        const httpLinks = linkList.filter(u => /^https?:\/\//i.test(u));
        const TIMEOUT_MS = 1000; // bardzo szybka odpowiedź wymagana
        const MAX_CONCURRENCY = 8; // batch'owanie, aby przyspieszyć bez przeciążenia

        async function checkUrl(url) {
            const start = Date.now();
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
                let resp = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
                clearTimeout(timeout);
                // Gdy HEAD jest zablokowane – spróbuj GET dla 405/501 (również ze ścisłym timeoutem)
                if (!resp.ok && (resp.status === 405 || resp.status === 501)) {
                    const controller2 = new AbortController();
                    const timeout2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
                    resp = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller2.signal });
                    clearTimeout(timeout2);
                }
                const durationMs = Date.now() - start;
                // Traktuj długą odpowiedź jako błąd
                const ok = resp.ok && durationMs < TIMEOUT_MS;
                return { url, ok, status: resp.status, durationMs };
            } catch (e) {
                const durationMs = Date.now() - start; // traktujemy jako timeout/błąd
                return { url, ok: false, status: null, durationMs, error: e?.name || String(e) };
            }
        }

        let checked = 0;
        const results = [];
        for (let i = 0; i < httpLinks.length; i += MAX_CONCURRENCY) {
            const slice = httpLinks.slice(i, i + MAX_CONCURRENCY);
            const batch = await Promise.all(slice.map(u => checkUrl(u)));
            results.push(...batch);
            checked += batch.length;
        }

        let linkValidationSuggestion = null;
        if (checked > 0) {
            const invalid = results.filter(r => !r.ok);
            const invalidUrls = invalid.map(r => r.url);
            details.linkValidation = {
                checked,
                total: httpLinks.length,
                invalidCount: invalidUrls.length,
                invalidUrls,
                timeoutMs: TIMEOUT_MS
            };
            const invalidLinksPenalty = Math.min(invalidUrls.length * 5, 25);
            if (invalidLinksPenalty > 0) {
                score += invalidLinksPenalty;
                linkValidationSuggestion = {
                    problem: "Niesprawne lub zbyt wolno odpowiadające linki w treści",
                    impact: `Zwiększa wynik spam o ${invalidLinksPenalty} punktów (sprawdzono ${checked}/${httpLinks.length}, próg ${TIMEOUT_MS}ms)`,
                    fix: "Sprawdź wszystkie linki w wiadomości – popraw błędne adresy, usuń niedziałające i zadbaj o szybkie odpowiedzi serwera.",
                    scoreValue: invalidLinksPenalty
                };
            }
        }

        // Wyliczanie obrazków (src z tagów <img>)
        const imgSrcRegex = /<img[^>]+src=(?:\"|\')([^\"']+)(?:\"|\')/gi;
        const imageList = [];
        while ((m = imgSrcRegex.exec(content)) !== null) {
            imageList.push(m[1]);
        }
        const imageCount = imageList.length;
        details.imageCount = imageCount;
        details.imageList = imageList;
        if (imageCount > 5) score += 6;

        // spam words in body
        let spamHits = 0;
        const foundSpamInBody = [];
        for (const w of spamWords) {
            const re = new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
            const m = (bodyLower.match(re) || []).length;
            if (m > 0) {
                spamHits += m;
                foundSpamInBody.push({ word: w, count: m });
            }
        }
        details.foundSpamInBody = foundSpamInBody;
        if (spamHits > 0) score += Math.min(spamHits * 3, 30);

        // unsubscribe presence
        let hasUnsubscribe = false;
        if (typeof unsubscribe === 'string' && unsubscribe.length > 0) hasUnsubscribe = true;
        if (unsubscribe === true) hasUnsubscribe = true;
        if (/unsubscribe|wypisz|odsubskrybuj|unsubscribe_url|list-unsubscribe/gi.test(content)) hasUnsubscribe = true;
        details.hasUnsubscribe = hasUnsubscribe;
        if (!hasUnsubscribe) {
            score += 22;
        } else {
            score -= 8;
        }

        // normalize to 0-100
        // Ustal bazę na 50 punktów i dodaj/odejmij score
        let finalScore = Math.max(0, Math.min(100, Math.round(50 + score)));

        let rating = 'low';
        if (finalScore >= 61) rating = 'high';
        else if (finalScore >= 31) rating = 'medium';

        const result = {
            score: finalScore,
            rating,
            details,
            suggestions: []
        };

        // Dodajemy konkretne sugestie dla marketerów na podstawie wykrytych problemów

        if (details.suboptimalSubjectLength) {
            result.suggestions.push({
                problem: "Nieoptymalna długość tematu",
                impact: "Zwiększa wynik spam o 5 punktów",
                fix: "Temat powinien mieć 20-60 znaków. Zbyt krótkie tematy mogą być niejasne, zbyt długie – obcięte w skrzynce odbiorczej.",
                scoreValue: 5
            });
        }

        if (details.suboptimalSubjectLength) {
            result.suggestions.push({
                problem: "Nieoptymalna długość tematu",
                impact: "Zwiększa wynik spam o 5 punktów",
                fix: "Temat powinien mieć 20-60 znaków. Zbyt krótkie tematy mogą być niejasne, zbyt długie – obcięte w skrzynce odbiorczej.",
                scoreValue: 5
            });
        }

        if (details.optimalSubjectLength) {
            result.suggestions.push({
                problem: "Optymalna długość tematu",
                impact: "Zmniejsza wynik spam o 7 punktów",
                fix: "Temat ma odpowiednią długość (20-60 znaków) – zwiększa to wiarygodność wiadomości.",
                scoreValue: -7
            });
        }

        if (details.subjectUppercase) {
            result.suggestions.push({
                problem: "Zbyt wiele wielkich liter w temacie",
                impact: "Zwiększa wynik spam o 12 punktów",
                fix: "Użyj wielkich liter tylko na początku zdań i w nazwach własnych. Unikaj pisania całych słów wielkimi literami.",
                scoreValue: 12
            });
        }

        if (details.subjectExclaim) {
            result.suggestions.push({
                problem: "Zbyt wiele wykrzykników w temacie",
                impact: "Zwiększa wynik spam o 6 punktów",
                fix: "Ogranicz liczbę wykrzykników do maksymalnie jednego lub dwóch. Używaj ich tylko gdy są naprawdę potrzebne.",
                scoreValue: 6
            });
        }

        if (details.foundSpamInSubject.length > 0) {
            const spamSubjectScore = details.foundSpamInSubject.length * 8;
            result.suggestions.push({
                problem: `Znaleziono słowa kluczowe często występujące w spamie: ${details.foundSpamInSubject.join(", ")}`,
                impact: "Każde słowo zwiększa wynik spam o 8 punktów",
                fix: "Unikaj używania tych słów w temacie lub zastąp je synonimami. Szczególnie unikaj słów związanych z promocjami i nagłymi okazjami.",
                scoreValue: spamSubjectScore
            });
        }

        if (details.noPersonalization) {
            result.suggestions.push({
                problem: "Brak personalizacji",
                impact: "Zwiększa wynik spam o 10 punktów",
                fix: "Użyj znaczników personalizacji (np. %imie%, {{nazwisko}}, [firma]) aby zwiększyć wiarygodność wiadomości.",
                scoreValue: 10
            });
        }

        if (details.personalization) {
            result.suggestions.push({
                problem: "Personalizacja treści",
                impact: "Zmniejsza wynik spam o 10 punktów",
                fix: "Użycie znaczników personalizacji zwiększa wiarygodność wiadomości.",
                scoreValue: -10
            });
        }

        if (details.tooShort) {
            result.suggestions.push({
                problem: "Zbyt krótka treść wiadomości",
                impact: "Zwiększa wynik spam o 10 punktów",
                fix: "Rozbuduj treść wiadomości. Zbyt krótkie wiadomości często są oznaczane jako spam. Dodaj więcej wartościowej treści dla odbiorcy.",
                scoreValue: 10
            });
        }

        if (details.tooLong) {
            result.suggestions.push({
                problem: "Zbyt długa treść wiadomości",
                impact: "Zwiększa wynik spam o 3 punkty",
                fix: "Treść przekracza 2000 znaków. Rozważ skrócenie lub podział na kilka sekcji z linkami do dalszej treści.",
                scoreValue: 3
            });
        }

        if (details.optimalLength) {
            result.suggestions.push({
                problem: "Optymalna długość treści",
                impact: "Zmniejsza wynik spam o 5 punktów",
                fix: "Treść między 100 a 2000 znaków jest uznawana za optymalną.",
                scoreValue: -5
            });
        }

        if (details.noFooter) {
            result.suggestions.push({
                problem: "Brak profesjonalnej stopki",
                impact: "Zwiększa wynik spam o 5 punktów",
                fix: "Dodaj stopkę z danymi kontaktowymi firmy (adres, telefon, NIP itp.) – zwiększa to wiarygodność.",
                scoreValue: 5
            });
        }

        if (details.hasFooter) {
            result.suggestions.push({
                problem: "Profesjonalna stopka",
                impact: "Zmniejsza wynik spam o 8 punktów",
                fix: "Obecność stopki z danymi kontaktowymi zwiększa wiarygodność.",
                scoreValue: -8
            });
        }

        if (details.dirtyHtml) {
            result.suggestions.push({
                problem: "Przestarzałe znaczniki HTML",
                impact: "Zwiększa wynik spam o 8 punktów",
                fix: "Usuń przestarzałe znaczniki HTML (font, center, marquee, inline style). Użyj semantycznego HTML5.",
                scoreValue: 8
            });
        }

        if (details.cleanHtml) {
            result.suggestions.push({
                problem: "Poprawne formatowanie HTML",
                impact: "Zmniejsza wynik spam o 7 punktów",
                fix: "Używanie semantycznego HTML bez przestarzałych znaczników.",
                scoreValue: -7
            });
        }

        if (details.missingAltTexts) {
            result.suggestions.push({
                problem: "Brak opisów alternatywnych obrazków",
                impact: "Zwiększa wynik spam o 6 punktów",
                fix: "Dodaj opisy alt do wszystkich obrazków – to nie tylko zmniejsza wynik spam, ale poprawia dostępność.",
                scoreValue: 6
            });
        }

        if (details.hasAltTexts) {
            result.suggestions.push({
                problem: "Opisy alternatywne obrazków",
                impact: "Zmniejsza wynik spam o 5 punktów",
                fix: "Wszystkie obrazki mają poprawne opisy alt.",
                scoreValue: -5
            });
        }

        if (details.freeProviderFrom || details.invalidFrom || details.missingFrom) {
            const penalty = details.freeProviderFrom ? 4 : 8;
            let fixMsg = "Używaj profesjonalnego adresu email z własnej domeny zamiast darmowych providerów lub noreply.";
            if (details.missingFrom) fixMsg = "Dodaj prawidłowy adres nadawcy w polu From.";
            result.suggestions.push({
                problem: "Problematyczny adres nadawcy",
                impact: `Zwiększa wynik spam o ${penalty} punktów`,
                fix: fixMsg,
                scoreValue: penalty
            });
        }

        if (details.validFromHeader) {
            result.suggestions.push({
                problem: "Poprawny adres nadawcy",
                impact: "Zmniejsza wynik spam o 8 punktów",
                fix: "Użycie spersonalizowanego adresu email zwiększa wiarygodność.",
                scoreValue: -8
            });
        }

        if (details.linkCount > 2) {
            const linkScore = Math.min((details.linkCount - 2) * 6, 30);
            result.suggestions.push({
                problem: "Zbyt duża liczba linków",
                impact: `Zwiększa wynik spam o ${linkScore} punktów`,
                fix: "Ogranicz liczbę linków do maksymalnie 2-3 najważniejszych. Każdy dodatkowy link zwiększa ryzyko oznaczenia jako spam.",
                scoreValue: linkScore
            });
        }

        if (details.imageCount > 5) {
            result.suggestions.push({
                problem: "Zbyt dużo obrazków",
                impact: "Zwiększa wynik spam o 6 punktów",
                fix: "Ogranicz liczbę obrazków do maksymalnie 4-5. Używaj tylko niezbędnych grafik.",
                scoreValue: 6
            });
        }

        if (details.foundSpamInBody.length > 0) {
            let spamBodyScore = 0;
            for (const s of details.foundSpamInBody) spamBodyScore += s.count * 3;
            spamBodyScore = Math.min(spamBodyScore, 30);
            result.suggestions.push({
                problem: "Znaleziono słowa kluczowe często występujące w spamie w treści wiadomości",
                impact: "Każde wystąpienie zwiększa wynik spam o 3 punkty (max 30)",
                fix: "Przejrzyj listę znalezionych słów i zastąp je alternatywnymi określeniami. Szczególnie uważaj na słowa związane z promocjami i pilnością oferty.",
                scoreValue: spamBodyScore
            });
        }

        if (!details.hasUnsubscribe) {
            result.suggestions.push({
                problem: "Brak linku do wypisania się z newslettera",
                impact: "Zwiększa wynik spam o 22 punkty",
                fix: "Dodaj wyraźny link do wypisania się z newslettera. To nie tylko zmniejszy wynik spam, ale jest też wymagane przez przepisy prawa.",
                scoreValue: 22
            });
        } else {
            result.suggestions.push({
                problem: "Link do wypisania się obecny",
                impact: "Zmniejsza wynik spam o 8 punktów",
                fix: "Obecność linku wypisania się jest zgodna z przepisami i zmniejsza wynik spam.",
                scoreValue: -8
            });
        }

        // Sugestia dotycząca linków (po utworzeniu result)
        if (linkValidationSuggestion) {
            result.suggestions.push(linkValidationSuggestion);
        }

        // Zapisz scoring i sugestie do bazy
        await campaign.update({
            scoring: result.score,
            suggestions: result.suggestions
        });
        res.send(new Response(result, true, 'Spam rating calculated successfully'));
    } catch (err) {
        res.send(new Response(null, false, `Failed to calculate spam rating: ${err.message}`));
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
            group:['active']
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
        const {page=1, limit=50, search='', status='', segment='', sortBy='id', sortOrder='asc'} = req.query; // status, segment przyszłościowo
        
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

        const message =  `Contact unsubscribed successfully in all databases.`;

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

        const message =  `Contact resubscribed successfully in all databases.`;

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
        if (phone!== undefined) updateData.phone = phone;

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
