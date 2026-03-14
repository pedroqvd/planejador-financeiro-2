import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGeminiClient } from '@/lib/gemini';
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userPlan = session.user.plan || 'free';
    if (userPlan === 'free') {
        return NextResponse.json({ error: 'OCR de recibos disponível apenas para planos Pro/Premium.' }, { status: 403 });
    }

    // SECURITY: Rate limiting per user
    try {
        const { success } = await ratelimit.limit(`scan:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const { image } = await request.json(); // base64 image data
        if (!image) {
            return NextResponse.json({ error: 'Imagem é obrigatória.' }, { status: 400 });
        }

        // SECURITY: Validate image size (max ~5MB base64 string)
        if (typeof image !== 'string' || image.length > 7_000_000) {
            return NextResponse.json({ error: 'Imagem muito grande. Máximo 5MB.' }, { status: 400 });
        }

        // Clean base64 string
        const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

        const systemPrompt = `
            Você é um especialista em extração de dados de recibos e notas fiscais (OCR).
            Analise a imagem da nota fiscal e extraia as seguintes informações em formato JSON rigoroso:
            - name: Nome do local (ex: "Starbucks", "Supermercado Extra") ou uma descrição curta.
            - amount: Valor total da compra como número decimal.
            - category: Categorize em um destes: 'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'.
            - date: Data da compra no formato YYYY-MM-DD (se não houver, use a data atual).

            REGRAS RÍGIDAS:
            1. Retorne APENAS o JSON, sem markdown.
            2. Se o valor for ilegível, use 0.
            3. Use 'Outros' se a categoria for incerta.
            4. Se o nome não estiver claro, use "Compra Scanned".
        `;

        const scanAbort = new AbortController();
        const scanTimeout = setTimeout(() => scanAbort.abort(), 30_000);
        let response;
        try {
            response = await getGeminiClient().models.generateContent({
                model: 'models/gemini-2.0-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: systemPrompt },
                            {
                                inlineData: {
                                    mimeType: 'image/jpeg',
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ],
                config: {
                    maxOutputTokens: 500,
                    temperature: 0.1,
                }
            });
        } finally {
            clearTimeout(scanTimeout);
        }

        const reply = response.text || '';

        try {
            const clearJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const insightJson = JSON.parse(clearJson);
            return NextResponse.json(insightJson);
        } catch (err) {
            console.error('Scan JSON Parse Error:', err, reply);
            return NextResponse.json({ error: 'Falha ao processar o formato da nota pela IA.' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Scan API error:', error);
        
        // SECURITY: Never leak internal error.message to client
        if (error.status === 400 || error.status === 403) {
            return NextResponse.json({
                error: 'Erro ao processar imagem. Verifique o formato e tente novamente.'
            }, { status: error.status });
        }

        return NextResponse.json({ error: 'Erro interno no scanner IA.' }, { status: 500 });
    }
}
