import axios from 'axios';

/**
 * Serwis AI do generowania treści marketingowych
 * Wykorzystuje backendowe endpointy HuggingFace
 */
export class AiService {
  static async generateText(prompt, options = {}) {
    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      ...options
    });
    const result = response.data;
    if (result?.response?.success === false) {
      throw new Error(result?.response?.message || 'Nie udało się wygenerować treści.');
    }
    if (typeof result.data !== 'string' || !result.data.trim()) {
      throw new Error('Usługa AI zwróciła pustą treść.');
    }
    return result.data;
  }

  /**
   * Generuj treść emaila na podstawie promptu
   * @param {string} prompt - Opis co ma być wygenerowane
   * @param {Object} options - Dodatkowe opcje
   * @returns {Promise<string>} Wygenerowana treść
   */
  static async generateContent(prompt, options = {}) {
    return this.generateText(this._buildPrompt(prompt, options), options);
  }

  /**
   * Generuj temat emaila
   * @param {string} context - Kontekst kampanii
   * @returns {Promise<string>} Sugerowany temat
   */
  static async generateSubject(context) {
    const prompt = `Zaproponuj temat wiadomości dotyczącej: ${context}. Temat ma mieć maksymalnie 60 znaków, jasno odnosić się do podanej oferty i nie może obiecywać niczego, czego nie ma w kontekście. Zwróć wyłącznie temat, bez komentarza.`;
    
    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      maxTokens: 50
    });
    return response.data.data;
  }

  /**
   * Popraw/ulepsz istniejący tekst
   * @param {string} text - Tekst do poprawy
   * @param {string} style - Styl (professional, casual, persuasive, urgent)
   * @returns {Promise<string>} Poprawiony tekst
   */
  static async improveText(text, style = 'professional') {
    const stylePrompts = {
      professional: 'Nadaj mu bardziej formalny i dopracowany ton',
      casual: 'Napisz go swobodniej i bardziej przystępnie',
      persuasive: 'Przedstaw argumenty jasno i przekonująco, bez dodawania niepotwierdzonych obietnic',
      urgent: 'Podkreśl pilność wyłącznie wtedy, gdy wynika ona z podanych informacji'
    };

    const prompt = `Zredaguj poniższy tekst wiadomości. ${stylePrompts[style] || stylePrompts.professional}. Zachowaj sens, fakty, ceny, warunki, linki i język oryginału. Nie dodawaj informacji ani obietnic. Zwróć wyłącznie poprawiony tekst.\n\nTekst źródłowy:\n${text}`;

    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      maxTokens: 300
    });
    return response.data.data;
  }

  /**
   * Generuj warianty A/B dla tekstu
   * @param {string} text - Bazowy tekst
   * @param {number} count - Liczba wariantów
   * @returns {Promise<string[]>} Warianty tekstu
   */
  static async generateVariants(text, count = 3) {
    const prompt = `Przygotuj ${count} różne wersje poniższego tekstu. Mogą różnić się tonem i sposobem ujęcia, ale zachowaj te same fakty, ceny, warunki i sens. Nie dodawaj nowych twierdzeń. Ponumeruj wersje od 1 do ${count}.\n\nTekst źródłowy:\n${text}`;

    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      maxTokens: 400
    });
    
    const result = response.data.data;
    // Parse numbered variants
    const variants = [];
    const lines = result.split('\n');
    let currentVariant = '';
    for (const line of lines) {
      if (/^\d+[\.\)]\s*/.test(line)) {
        if (currentVariant) variants.push(currentVariant.trim());
        currentVariant = line.replace(/^\d+[\.\)]\s*/, '');
      } else {
        currentVariant += ' ' + line;
      }
    }
    if (currentVariant) variants.push(currentVariant.trim());
    
    return variants.length > 0 ? variants : [result];
  }

  /**
   * Generuj CTA (Call to Action)
   * @param {string} context - Kontekst oferty
   * @returns {Promise<string[]>} Sugerowane CTA
   */
  static async generateCTA(context) {
    const prompt = `Zaproponuj 5 krótkich etykiet przycisku lub linku zachęcających do działania w wiadomości na temat: ${context}. Każda propozycja ma mieć od 2 do 5 słów, być konkretna i zgodna z podaną ofertą. Zwróć każdą propozycję w osobnym wierszu, bez numerowania.`;

    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      maxTokens: 100
    });
    
    return response.data.data.split('\n').filter(line => line.trim());
  }

  /**
   * Sprawdź spam score dla treści
   * @param {number} campaignId - ID kampanii
   * @returns {Promise<Object>} Wynik scoringu
   */
  static async checkSpamScore(campaignId) {
    const response = await axios.post('/mailing/computeSpamRating', {
      id: campaignId
    });
    return response.data.data;
  }

  /**
   * Generuj preheader tekst
   * @param {string} subject - Temat emaila
   * @param {string} content - Treść emaila
   * @returns {Promise<string>} Sugerowany preheader
   */
  static async generatePreheader(subject, content) {
    const prompt = `Napisz krótki preheader o długości 40–100 znaków, który uzupełnia temat: "${subject}". Oprzyj go na treści wiadomości, bez dodawania nowych obietnic.\nKontekst: ${content.substring(0, 200)}\nZwróć wyłącznie preheader.`;

    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      maxTokens: 50
    });
    return response.data.data;
  }

  /**
   * Tłumacz treść na inny język
   * @param {string} text - Tekst do tłumaczenia
   * @param {string} targetLang - Język docelowy
   * @returns {Promise<string>} Przetłumaczony tekst
   */
  static async translate(text, targetLang = 'en') {
    const targetLanguage = targetLang === 'pl' ? 'polski' : targetLang === 'en' ? 'angielski' : targetLang
    const prompt = `Przetłumacz poniższy tekst na język ${targetLanguage}. Zachowaj jego sens, fakty, ceny, warunki, linki i odpowiedni ton. Nie dodawaj nowych informacji. Zwróć wyłącznie tłumaczenie.\n\nTekst:\n${text}`;

    const response = await axios.post('/mailing/generateMailContent', {
      prompt,
      maxTokens: 400
    });
    return response.data.data;
  }

  /**
   * Buduje pełny prompt z opcjami
   */
  static _buildPrompt(prompt, options = {}) {
    let fullPrompt = prompt;
    const toneNames = {
      professional: 'formalnym i profesjonalnym',
      casual: 'swobodnym i przystępnym',
      persuasive: 'przekonującym, ale rzeczowym',
      urgent: 'pilnym, wyłącznie jeśli wynika to z faktów'
    }

    if (options.tone) {
      fullPrompt = `Użyj tonu ${toneNames[options.tone] || options.tone}. ${fullPrompt}`;
    }
    if (options.targetAudience) {
      fullPrompt = `Odbiorcy: ${options.targetAudience}. ${fullPrompt}`;
    }
    if (options.industry) {
      fullPrompt = `Branża: ${options.industry}. ${fullPrompt}`;
    }
    if (options.length === 'short') {
      fullPrompt += ' Napisz zwięźle, w około 50–100 słowach.';
    } else if (options.length === 'long') {
      fullPrompt += ' Rozwiń tekst do około 200–400 słów.';
    }
    if (options.includeCTA) {
      fullPrompt += ' Dodaj jasne wezwanie do działania, zgodne z podaną ofertą.';
    }

    fullPrompt += ' Zwróć czysty HTML odpowiedni do wiadomości email (używaj znaczników <p>, <h2>, <h3>, bez <html> i <body>). Zachowaj placeholdery personalizacyjne, takie jak {{first_name}}, jeśli występują w tekście źródłowym. Nie wymyślaj faktów, cen ani obietnic.';

    return fullPrompt;
  }
}
