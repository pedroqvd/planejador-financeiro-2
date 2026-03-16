import { GoogleGenAI } from '@google/genai';
import { logger } from '@/lib/logger';

let _ai: GoogleGenAI | null = null;
let _lastKey: string | null = null;

export function getGeminiClient(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    // Rebuild client if the key changed (e.g. after rotation via env)
    if (!_ai || _lastKey !== key) {
        _ai = new GoogleGenAI({ apiKey: key });
        _lastKey = key;
    }
    return _ai;
}

/**
 * Wrapper around Gemini generateContent with automatic retry on 429 (rate limit).
 * Uses exponential backoff: 2s, 4s, 8s (3 retries max).
 */
export async function geminiGenerateWithRetry(
    params: {
        model?: string;
        contents: any[];
        config?: {
            maxOutputTokens?: number;
            temperature?: number;
            responseMimeType?: string;
        };
    },
    maxRetries = 3
) {
    const model = params.model || 'gemini-2.0-flash';
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await getGeminiClient().models.generateContent({
                model,
                contents: params.contents,
                config: params.config,
            });
            return response;
        } catch (error: any) {
            lastError = error;

            // Only retry on 429 (rate limit) or 503 (service unavailable)
            if (error.status === 429 || error.status === 503) {
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
                    logger.warn(`[Gemini] Rate limited (${error.status}), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            // Non-retryable error or max retries exceeded
            throw error;
        }
    }

    // Should not reach here, but just in case
    throw lastError;
}
