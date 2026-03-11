import { GoogleGenAI } from '@google/genai';

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
