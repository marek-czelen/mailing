import fs from 'fs';
import Path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = Path.dirname(fileURLToPath(import.meta.url));
const aiConfigPath = Path.resolve(__dirname, '../config/ai.config.json');
const aiConfig = JSON.parse(fs.readFileSync(aiConfigPath, 'utf-8'));

const providers = {
    deepseek: {
        apiKeyEnv: 'DEEPSEEK_API_KEY',
        modelEnv: 'DEEPSEEK_MODEL',
        defaultModel: 'deepseek-flash',
        endpoint: 'https://api.deepseek.com/v1/chat/completions'
    },
    huggingface: {
        apiKeyEnv: 'HF_API_KEY',
        modelEnv: 'HF_MODEL',
        defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
        endpoint: 'https://api-inference.huggingface.co/models'
    }
};

export function getDefaultProvider() {
    return process.env.AI_PROVIDER || aiConfig.defaults?.provider || 'deepseek';
}

function getProviderSettings(provider) {
    const definition = providers[provider];
    if (!definition) throw new Error(`Unsupported AI provider: ${provider}`);

    return {
        ...definition,
        apiKey: process.env[definition.apiKeyEnv] || aiConfig[provider]?.apiKey || '',
        model: process.env[definition.modelEnv] || aiConfig[provider]?.model || definition.defaultModel
    };
}

export async function generateText({
    prompt,
    systemPrompt = 'Jesteś profesjonalnym redaktorem wiadomości email. Zwróć wyłącznie żądaną treść.',
    provider = getDefaultProvider(),
    model,
    maxTokens,
    temperature
}) {
    if (typeof prompt !== 'string' || !prompt.trim()) {
        throw new Error('A non-empty AI prompt is required.');
    }

    const settings = getProviderSettings(provider);
    if (!settings.apiKey) {
        throw new Error(`Missing API key. Configure ${settings.apiKeyEnv} on the backend.`);
    }

    const selectedModel = model || settings.model;
    const requestedMaxTokens = Number(maxTokens || process.env.AI_MAX_TOKENS || 500);
    const requestedTemperature = Number(temperature ?? process.env.AI_TEMPERATURE ?? 0.7);
    const selectedMaxTokens = Number.isFinite(requestedMaxTokens)
        ? Math.min(10000, Math.max(1, Math.floor(requestedMaxTokens)))
        : 500;
    const selectedTemperature = Number.isFinite(requestedTemperature)
        ? Math.min(2, Math.max(0, requestedTemperature))
        : 0.7;
    const timeout = Number(process.env.AI_TIMEOUT_MS) || 30000;

    if (provider === 'huggingface') {
        const response = await fetch(`${settings.endpoint}/${selectedModel}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: `${systemPrompt}\n\n${prompt}`,
                parameters: { max_new_tokens: selectedMaxTokens, temperature: selectedTemperature }
            }),
            timeout
        });

        if (!response.ok) throw new Error(`Hugging Face HTTP ${response.status}.`);
        const result = await response.json();
        const text = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
        if (!text) throw new Error('The AI provider returned no generated text.');
        return text;
    }

    const response = await fetch(settings.endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: selectedModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            thinking: { type: 'disabled' },
            max_tokens: selectedMaxTokens,
            temperature: selectedTemperature
        }),
        timeout
    });

    if (!response.ok) throw new Error(`${provider} HTTP ${response.status}.`);
    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;
    if (!text) throw new Error('The AI provider returned no generated text.');
    return text;
}

export async function listModels(provider = 'huggingface') {
    const settings = getProviderSettings(provider);
    if (!settings.apiKey) throw new Error(`Missing API key. Configure ${settings.apiKeyEnv} on the backend.`);

    const response = await fetch('https://router.huggingface.co/v1/models', {
        headers: { Authorization: `Bearer ${settings.apiKey}` },
        timeout: Number(process.env.AI_TIMEOUT_MS) || 30000
    });

    if (!response.ok) throw new Error(`Hugging Face HTTP ${response.status}.`);
    const result = await response.json();
    return result.data;
}