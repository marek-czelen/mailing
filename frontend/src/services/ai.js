import axios from 'axios';

/**
 * Serwis AI do generowania treści marketingowych
 * Wykorzystuje backendowe endpointy HuggingFace
 */
export class AiService {
  /**
   * Generuj treść emaila na podstawie promptu
   * @param {string} prompt - Opis co ma być wygenerowane
   * @param {Object} options - Dodatkowe opcje
   * @returns {Promise<string>} Wygenerowana treść
   */
  static async generateContent(prompt, options = {}) {
    const response = await axios.post('/mailing/generateMailContent', {
      prompt: this._buildPrompt(prompt, options),
      ...options
    });
    return response.data.data;
  }

  /**
   * Generuj temat emaila
   * @param {string} context - Kontekst kampanii
   * @returns {Promise<string>} Sugerowany temat
   */
  static async generateSubject(context) {
    const prompt = `Generate a compelling email subject line for a marketing campaign about: ${context}. 
    Requirements: maximum 60 characters, engaging, no spam words, personalized tone.
    Return ONLY the subject line, nothing else.`;
    
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
      professional: 'Make it more professional and polished',
      casual: 'Make it more casual and friendly',
      persuasive: 'Make it more persuasive and compelling',
      urgent: 'Make it more urgent and action-driving'
    };

    const prompt = `Improve the following marketing email text. ${stylePrompts[style] || stylePrompts.professional}.
    Keep the same core message but enhance the language. Return ONLY the improved text.
    
    Original text: "${text}"`;

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
    const prompt = `Create ${count} different variations of the following marketing text. 
    Each variation should have a different tone or angle. Number them 1-${count}.
    
    Original: "${text}"`;

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
    const prompt = `Generate 5 compelling call-to-action button texts for a marketing email about: ${context}.
    Each CTA should be short (2-5 words), action-oriented, and persuasive.
    Return each CTA on a new line, no numbering.`;

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
    const prompt = `Generate a short email preheader (40-100 characters) that complements this subject line: "${subject}".
    The preheader should entice the reader to open the email.
    Context: ${content.substring(0, 200)}
    Return ONLY the preheader text.`;

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
    const prompt = `Translate the following marketing text to ${targetLang === 'pl' ? 'Polish' : 'English'}. 
    Keep the marketing tone and persuasion. Return ONLY the translation.
    
    Text: "${text}"`;

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

    if (options.tone) {
      fullPrompt = `Use a ${options.tone} tone. ${fullPrompt}`;
    }
    if (options.targetAudience) {
      fullPrompt = `Target audience: ${options.targetAudience}. ${fullPrompt}`;
    }
    if (options.industry) {
      fullPrompt = `Industry: ${options.industry}. ${fullPrompt}`;
    }
    if (options.length === 'short') {
      fullPrompt += ' Keep it concise, around 50-100 words.';
    } else if (options.length === 'long') {
      fullPrompt += ' Make it detailed, around 200-400 words.';
    }
    if (options.includeCTA) {
      fullPrompt += ' Include a clear call-to-action.';
    }

    fullPrompt += ' Format the output as clean HTML suitable for email (use <p>, <h2>, <h3> tags, no <html> or <body> tags). Include personalization placeholders like {{first_name}} where appropriate.';

    return fullPrompt;
  }
}
