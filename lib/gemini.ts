import { GoogleGenAI } from '@google/genai';

let _ai: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
    if (!_ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return _ai;
}
