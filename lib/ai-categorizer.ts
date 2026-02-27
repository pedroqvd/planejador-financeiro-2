import { GoogleGenAI } from '@google/genai';

let _ai: GoogleGenAI | null = null;
function getAI() {
    if (!_ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return _ai;
}

const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];

export async function categorizeTransactionsBatch(transactions: { id: string, name: string }[]): Promise<Record<string, string>> {
    if (!process.env.GEMINI_API_KEY) {
        // Fallback to 'Outros' if no AI
        return transactions.reduce((acc, t) => {
            acc[t.id] = 'Outros';
            return acc;
        }, {} as Record<string, string>);
    }

    if (transactions.length === 0) return {};

    const ai = getAI();
    const prompt = `
Você é um assistente financeiro no Brasil. Sua tarefa é analisar a lista de nomes de transações financeiras (geralmente extraídas de cartão de crédito ou extrato bancário) e classificá-las em EXATAMENTE UMA das seguintes categorias válidas:
${VALID_CATEGORIES.join(', ')}

Retorne um JSON válido contendo um objeto onde a chave é o ID da transação e o valor é a categoria.
APENAS retorne o JSON, sem markdown blocks (\`\`\`json) e sem explicações adicionais.

Transações a classificar:
${JSON.stringify(transactions)}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        let text = response.text || '{}';
        // Clean up possible markdown code blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(text) as Record<string, string>;

        // Validate categories
        for (const [key, value] of Object.entries(parsed)) {
            if (!VALID_CATEGORIES.includes(value)) {
                parsed[key] = 'Outros';
            }
        }

        // Ensure all sent IDs are present in the response
        const finalResult = transactions.reduce((acc, t) => {
            acc[t.id] = parsed[t.id] || 'Outros';
            return acc;
        }, {} as Record<string, string>);

        return finalResult;
    } catch (error) {
        console.error('Error categorizing transactions with AI:', error);
        // Fallback
        return transactions.reduce((acc, t) => {
            acc[t.id] = 'Outros';
            return acc;
        }, {} as Record<string, string>);
    }
}
