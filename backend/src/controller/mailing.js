import MarketingCampanies from '../models/marketingCampanies.model.js';
import { Response } from '../include/response.js';
import XLSX from 'xlsx';
import MailAddress from '../models/mailAddress.model.js';
import UPLOAD_DIR from '../config/upload.config.js';
import Path from 'path';
import MarketingCampaniesMailing from '../models/marketingCampaniesMailing.model.js';
import sequelize from '../include/db.js';
import axios from 'axios';
import OPENAI_API_KEY from '../config/openai.config.js';
import OpenAI from "openai";
import fetch from "node-fetch";
// Pobierz wszystkie kampanie
export async function getCampaigns(req, res) {
    try {
        const campaigns = await MarketingCampanies.findAll();
        res.send(new Response(campaigns, true, "Data received successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to fetch campaigns. ${error.message}`, ));
    }
}

// Pobierz jedną kampanię po ID
export async function getCampaignById(req, res) {
    try {
        const campaign = await MarketingCampanies.findByPk(req.params.id);
        if (!campaign) {
            return res.send(new Response(null, false, "Campaign not found."));
        }
        res.send(new Response(campaign, true, "Data received successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to fetch campaign. ${error.message}`));
    }
}

// Utwórz nową kampanię i zaimportuj adresy e-mail z pliku
export async function createCampaign(req, res) {
    try {
        let data = req.body;
        console.log(data);
        data.active = data.active ? true : false;
        data.progress = data.progress ? data.progress : 0;
        data.customerId = data.customerId ? data.customerId : 1;


        // Utwórz kampanię
        const newCampaign = await MarketingCampanies.create(data);

        // Obsługa pliku z adresami e-mail (zakładamy, że plik jest w req.file)
        let importedAddresses = [];
        if (data.file) {
            const workbook = XLSX.readFile(Path.join(UPLOAD_DIR,data.file));
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            const t = await sequelize.transaction();
            let errorList = [];
            for (const row of rows) {
                try{
                    if (row.email) {
                        // Dodaj adres e-mail do bazy
                        const newMailRecord = await MailAddress.create(
                            { 
                                mailAddress: row.email, 
                                miasto: row.miasto || null,
                                rodzaj: row.rodzaj || null,
                                active: 1,
                                customerId: 1 
                            }, { transaction: t });

                        const record = await MarketingCampaniesMailing.create({
                            marketingCampaniesId: newCampaign.id,
                            mailAddressesId: newMailRecord.id,}, 
                            { transaction: t });

                        importedAddresses.push(record);
                    }
                }catch(err){
                    await t.rollback();
                    errorList.push(`Failed to import email ${row.email}: ${err.message}`);
                }

            }
            await t.commit();
        }

        res.send(new Response(
            { campaign: newCampaign, importedAddresses },
            true,
            "Campaign created and mail addresses imported successfully."
        ));
    } catch (error) {
        res.send(new Response(null, false, `Failed to create campaign. ${error.message}`));
    }
}

// Aktualizuj kampanię po ID
export async function updateCampaign(req, res) {
    try {
        const [updated] = await MarketingCampanies.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) {
            return res.send(new Response(null, false, "Campaign not found."));
        }
        const updatedCampaign = await MarketingCampanies.findByPk(req.params.id);
        res.send(new Response(updatedCampaign, true, "Campaign updated successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to update campaign. ${error.message}`));
    }
}

// Usuń kampanię po ID
export async function deleteCampaign(req, res) {
    try {
        const deleted = await MarketingCampanies.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.send(new Response(null, false, "Campaign not found."));
        }
        res.send(new Response(null, true, "Campaign deleted successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to delete campaign. ${error.message}`));
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
 * - subject: string - temat wiadomości
 * - html: string - treść w formacie HTML (opcjonalnie)
 * - text: string - treść w formacie tekstowym (opcjonalnie, używana gdy brak html)
 * - from: string - adres nadawcy (np. "noreply@example.com")
 * - links: array<string> | null - opcjonalna lista linków (opcjonalnie). Jeśli nie podane, lista linków i obrazów zostanie zawsze wyliczona z treści wiadomości.
 * - images: number | null - opcjonalna liczba obrazków (opcjonalnie). Jeśli nie podane, obrazki zostaną wyekstrahowane z HTML i zwrócone w details.imageList.
 * - unsubscribe: string|boolean|null - opcjonalny url lub flaga oznaczająca obecność linku wypisania
 *
 * Zwracana wartość (Response JSON - pole `data`):
 * {
 *   score: number,        // 0-100 - wyliczona punktacja spamowa (im wyższa, tym bardziej "spam")
 *   rating: 'low'|'medium'|'high',
 *   details: {            // szczegółowe składowe oceny
 *     subjectUppercase?: boolean,
 *     subjectExclaim?: number,
 *     foundSpamInSubject: string[],
 *     linkCount: number,
 *     imageCount: number,
 *     foundSpamInBody: Array<{word: string, count: number}>,
 *     hasUnsubscribe: boolean,
 *     fromPenalty: number,
 *     textLength: number,
 *     positiveElements: {   // elementy obniżające scoring spam
 *       personalization?: boolean,    // użycie znaczników personalizacji (-10)
 *       optimalLength?: boolean,      // optymalna długość treści 100-2000 znaków (-5)
 *       hasFooter?: boolean,          // stopka z danymi kontaktowymi (-8)
 *       cleanHtml?: boolean,          // poprawne semantyczne HTML (-7)
 *       hasAltTexts?: boolean,        // alt teksty przy obrazkach (-5)
 *       validFromHeader?: boolean,     // poprawny spersonalizowany nadawca (-8)
 *       optimalSubjectLength?: boolean // optymalna długość tematu 20-60 znaków (-7)
 *     },
 *     positiveScore: number           // suma punktów za pozytywne elementy (max -50)
 *   },
 *   suggestions: Array<{              // sugestie poprawy dla elementów zwiększających spam
 *     problem: string,                // opis problemu
 *     impact: string,                 // wpływ na wynik
 *     fix: string                     // sugerowane rozwiązanie
 *   }>,
 *   positiveElements: Array<{         // lista pozytywnych elementów
 *     feature: string,                // nazwa cechy
 *     impact: string,                 // wpływ na wynik
 *     details: string                 // szczegółowy opis
 *   }>
 * }
 *
 * Reguły negatywnego scoringu:
 * - duża proporcja wielkich liter w temacie -> +12
 * - nadmiar wykrzykników w temacie -> +6
 * - słowa kluczowe spamowe w temacie -> +8 za wystąpienie
 * - więcej niż 2 linki -> +(linkCount-2)*6 (maks. +30)
 * - dużo obrazków (>5) -> +6
 * - słowa spamowe w treści -> +3 za wystąpienie (maks. +30)
 * - brak linku wypisania -> +22
 * - podejrzany nagłówek from -> +4..+8
 * - bardzo krótka treść (<50 znaków) -> +10
 *
 * Reguły pozytywnego scoringu (maksymalnie -50 punktów łącznie):
 * - personalizacja treści (znaczniki typu [imię], {{nazwa}}) -> -10
 * - optymalna długość treści (100-2000 znaków) -> -5
 * - profesjonalna stopka z danymi firmy -> -8
 * - poprawne semantyczne znaczniki HTML -> -7
 * - alt teksty przy wszystkich obrazkach -> -5
 * - spersonalizowany adres nadawcy -> -8
 * - optymalna długość tematu (20-60 znaków) -> -7
 *
 * Końcowy wynik:
 * 1. Obliczany jest scoring negatywny (punkty karne)
 * 2. Odejmowane są punkty za pozytywne elementy (max -50)
 * 3. Wynik normalizowany do zakresu 0-100
 * 4. Rating przydzielany według progów: 0-30 low, 31-60 medium, 61-100 high
 *
 * Przykład wywołania:
 * POST /mailing/spamRating
 * Body: { "subject": "FREE Offer!", "html": "<p>Buy now <a href=\"http://...\">click</a></p>", "from": "promo@example.com" }
 */
// Oblicza spam-rating dla kampanii na podstawie dostarczonych parametrów
export async function computeSpamRating(req, res) {
    try {
        const {
            subject = '',
            html = '',
            text = '',
            from = '',
            links = null, // opcjonalnie można podać listę linków (ale funkcja zawsze wylicza linki z treści)
            images = null, // opcjonalnie liczba obrazków (funkcja zawsze wylicza obrazki z treści)
            unsubscribe = null // opcjonalnie flaga lub url
        } = req.body || {};

        const content = (html || text || '').toString();

        // Punkty za dobre praktyki
        let positiveScore = 0;
        const positiveDetails = {};

        // Sprawdź personalizację (użycie imienia/nazwiska/nazwy firmy)
        const personalizationRegex = /%[A-Za-z_]+%|\{\{[A-Za-z_]+\}\}|\[imię\]|\[nazwisko\]|\[firma\]/g;
        const hasPersonalization = personalizationRegex.test(content);
        if (hasPersonalization) {
            positiveScore += 10;
            positiveDetails.personalization = true;
        }

        // Sprawdź długość treści (optymalna długość)
        const contentLength = content.replace(/<[^>]*>/g, '').trim().length;
        if (contentLength >= 100 && contentLength <= 2000) {
            positiveScore += 5;
            positiveDetails.optimalLength = true;
        }

        // Sprawdź obecność stopki z danymi firmy
        const footerRegex = /(?:stopka|footer|kontakt|contact|tel|phone|address|adres|nip|regon|krs)/i;
        if (footerRegex.test(content)) {
            positiveScore += 8;
            positiveDetails.hasFooter = true;
        }

        // Sprawdź formatowanie HTML (czyste, semantyczne)
        const hasCleanHtml = !/<font|<center|<marquee|style=/i.test(content) && 
                           /<(p|div|header|footer|section|article|h[1-6]|ul|ol|li|table)[^>]*>/i.test(content);
        if (hasCleanHtml) {
            positiveScore += 7;
            positiveDetails.cleanHtml = true;
        }

        // Sprawdź obecność alt tekstów przy obrazkach
        const imgTags = content.match(/<img[^>]+>/g) || [];
        const altTexts = imgTags.filter(tag => /alt=["'][^"']+["']/i.test(tag));
        if (imgTags.length > 0 && altTexts.length === imgTags.length) {
            positiveScore += 5;
            positiveDetails.hasAltTexts = true;
        }

        // Sprawdź poprawną konfigurację nagłówka From
        if (from) {
            const validFromRegex = /^[^@]+@[^.]+\.[a-z]{2,}$/i;
            const isValidFrom = validFromRegex.test(from) && !from.includes('noreply') && !from.includes('no-reply');
            if (isValidFrom) {
                positiveScore += 8;
                positiveDetails.validFromHeader = true;
            }
        }

        // Sprawdź czy temat nie jest zbyt krótki ani zbyt długi
        if (subject && subject.length >= 20 && subject.length <= 60) {
            positiveScore += 7;
            positiveDetails.optimalSubjectLength = true;
        }

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

        let score = 0;
        const details = {};

        // 1) analiza tematu
        const subj = subject.toString();
        const subjLength = subj.length;
        const upperCount = (subj.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g) || []).length;
        const upperRatio = subjLength > 0 ? upperCount / subjLength : 0;
        if (upperRatio > 0.6 && subjLength > 5) {
            score += 12;
            details.subjectUppercase = true;
        }
        const exclam = (subj.match(/!/g) || []).length;
        if (exclam >= 3) { score += 6; details.subjectExclaim = exclam; }

        // spam words in subject
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
        if (!hasUnsubscribe) score += 22;

        // from header analysis (suspicious sender)
        let fromPenalty = 0;
        if (from && typeof from === 'string') {
            const domainMatch = from.match(/@([\w.-]+)/);
            const domain = domainMatch ? domainMatch[1].toLowerCase() : '';
            // free providers moderately reduce trust (increase score slightly)
            const freeProviders = ['gmail.com','yahoo.com','hotmail.com','onet.pl','wp.pl','o2.pl'];
            if (freeProviders.includes(domain)) { fromPenalty = 4; }
            // missing @ or invalid from
            if (!domain) fromPenalty += 8;
        } else {
            fromPenalty += 8;
        }
        score += fromPenalty;
        details.fromPenalty = fromPenalty;

        // length heuristics: very short content is suspicious
        const textLen = (content.replace(/<[^>]*>/g, '') || '').trim().length;
        details.textLength = textLen;
        if (textLen < 50) score += 10;

        // Odejmij punkty za dobre praktyki
        const finalPositiveScore = Math.min(50, positiveScore); // Maksymalnie można odjąć 50 punktów
        score = Math.max(0, score - finalPositiveScore);

        // normalize to 0-100
        let finalScore = Math.max(0, Math.min(100, Math.round(score)));

        let rating = 'low';
        if (finalScore >= 61) rating = 'high';
        else if (finalScore >= 31) rating = 'medium';

        // Dodaj informacje o pozytywnych elementach do details
        details.positiveElements = positiveDetails;
        details.positiveScore = finalPositiveScore;

        const result = {
            score: finalScore,
            rating,
            details,
            suggestions: []
        };

        // Dodajemy konkretne sugestie dla marketerów na podstawie wykrytych problemów
        if (details.subjectUppercase) {
            result.suggestions.push({
                problem: "Zbyt wiele wielkich liter w temacie",
                impact: "Zwiększa wynik spam o 12 punktów",
                fix: "Użyj wielkich liter tylko na początku zdań i w nazwach własnych. Unikaj pisania całych słów wielkimi literami."
            });
        }

        if (details.subjectExclaim) {
            result.suggestions.push({
                problem: "Zbyt wiele wykrzykników w temacie",
                impact: "Zwiększa wynik spam o 6 punktów",
                fix: "Ogranicz liczbę wykrzykników do maksymalnie jednego lub dwóch. Używaj ich tylko gdy są naprawdę potrzebne."
            });
        }

        if (details.foundSpamInSubject.length > 0) {
            result.suggestions.push({
                problem: `Znaleziono słowa kluczowe często występujące w spamie: ${details.foundSpamInSubject.join(", ")}`,
                impact: "Każde słowo zwiększa wynik spam o 8 punktów",
                fix: "Unikaj używania tych słów w temacie lub zastąp je synonimami. Szczególnie unikaj słów związanych z promocjami i nagłymi okazjami."
            });
        }

        if (details.linkCount > 2) {
            result.suggestions.push({
                problem: "Zbyt duża liczba linków",
                impact: `Zwiększa wynik spam o ${Math.min((details.linkCount - 2) * 6, 30)} punktów`,
                fix: "Ogranicz liczbę linków do maksymalnie 2-3 najważniejszych. Każdy dodatkowy link zwiększa ryzyko oznaczenia jako spam."
            });
        }

        if (details.imageCount > 5) {
            result.suggestions.push({
                problem: "Zbyt dużo obrazków",
                impact: "Zwiększa wynik spam o 6 punktów",
                fix: "Ogranicz liczbę obrazków do maksymalnie 4-5. Używaj tylko niezbędnych grafik."
            });
        }

        if (details.foundSpamInBody.length > 0) {
            result.suggestions.push({
                problem: "Znaleziono słowa kluczowe często występujące w spamie w treści wiadomości",
                impact: "Każde wystąpienie zwiększa wynik spam o 3 punkty (max 30)",
                fix: "Przejrzyj listę znalezionych słów i zastąp je alternatywnymi określeniami. Szczególnie uważaj na słowa związane z promocjami i pilnością oferty."
            });
        }

        if (!details.hasUnsubscribe) {
            result.suggestions.push({
                problem: "Brak linku do wypisania się z newslettera",
                impact: "Zwiększa wynik spam o 22 punkty",
                fix: "Dodaj wyraźny link do wypisania się z newslettera. To nie tylko zmniejszy wynik spam, ale jest też wymagane przez przepisy prawa."
            });
        }

        if (details.fromPenalty > 0) {
            result.suggestions.push({
                problem: "Problematyczny adres nadawcy",
                impact: `Zwiększa wynik spam o ${details.fromPenalty} punktów`,
                fix: "Używaj profesjonalnego adresu email z własnej domeny zamiast darmowych providerów. Upewnij się, że adres jest prawidłowo skonfigurowany."
            });
        }

        if (details.textLength < 50) {
            result.suggestions.push({
                problem: "Zbyt krótka treść wiadomości",
                impact: "Zwiększa wynik spam o 10 punktów",
                fix: "Rozbuduj treść wiadomości. Zbyt krótkie wiadomości często są oznaczane jako spam. Dodaj więcej wartościowej treści dla odbiorcy."
            });
        }

        // Dodaj informacje o pozytywnych elementach
        result.positiveElements = [];
        
        if (positiveDetails.personalization) {
            result.positiveElements.push({
                feature: "Personalizacja treści",
                impact: "Zmniejsza wynik spam o 10 punktów",
                details: "Użycie znaczników personalizacji (np. imię, nazwisko, nazwa firmy) zwiększa wiarygodność wiadomości"
            });
        }

        if (positiveDetails.optimalLength) {
            result.positiveElements.push({
                feature: "Optymalna długość treści",
                impact: "Zmniejsza wynik spam o 5 punktów",
                details: "Treść między 100 a 2000 znaków jest uznawana za optymalną"
            });
        }

        if (positiveDetails.hasFooter) {
            result.positiveElements.push({
                feature: "Profesjonalna stopka",
                impact: "Zmniejsza wynik spam o 8 punktów",
                details: "Obecność stopki z danymi kontaktowymi zwiększa wiarygodność"
            });
        }

        if (positiveDetails.cleanHtml) {
            result.positiveElements.push({
                feature: "Poprawne formatowanie HTML",
                impact: "Zmniejsza wynik spam o 7 punktów",
                details: "Używanie semantycznego HTML bez przestarzałych znaczników"
            });
        }

        if (positiveDetails.hasAltTexts) {
            result.positiveElements.push({
                feature: "Opisy alternatywne obrazków",
                impact: "Zmniejsza wynik spam o 5 punktów",
                details: "Wszystkie obrazki mają poprawne opisy alt"
            });
        }

        if (positiveDetails.validFromHeader) {
            result.positiveElements.push({
                feature: "Poprawny adres nadawcy",
                impact: "Zmniejsza wynik spam o 8 punktów",
                details: "Użycie spersonalizowanego adresu email zamiast noreply"
            });
        }

        if (positiveDetails.optimalSubjectLength) {
            result.positiveElements.push({
                feature: "Optymalna długość tematu",
                impact: "Zmniejsza wynik spam o 7 punktów",
                details: "Temat ma odpowiednią długość (20-60 znaków)"
            });
        }

        res.send(new Response(result, true, 'Spam rating calculated successfully'));
    } catch (err) {
        res.send(new Response(null, false, `Failed to calculate spam rating: ${err.message}`));
    }
}