// config/openai.config.js
import EnvironmentConfig from './environment.config.js';

// UWAGA: Nie commituj prawdziwych kluczy API do repozytorium!
// Użyj zmiennej środowiskowej OPENAI_API_KEY

const OPENAI_API_KEY = EnvironmentConfig.get('OPENAI_API_KEY');
const OPENAI_MODEL = EnvironmentConfig.get('OPENAI_MODEL', 'gpt-3.5-turbo');

if (!OPENAI_API_KEY && EnvironmentConfig.isProduction()) {
    console.error('❌ BŁĄD: Brak klucza OpenAI API w środowisku produkcyjnym!');
    console.error('Ustaw zmienną OPENAI_API_KEY w pliku .env.production');
    process.exit(1);
}

if (!OPENAI_API_KEY) {
    console.warn('⚠️  UWAGA: Brak klucza OpenAI API. Funkcje AI będą wyłączone.');
}

export const openaiConfig = {
    apiKey: OPENAI_API_KEY,
    model: OPENAI_MODEL,
    enabled: !!OPENAI_API_KEY
};

export default OPENAI_API_KEY;
