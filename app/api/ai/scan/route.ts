import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userPlan = session.user.plan || 'free';
    if (userPlan === 'free') {
        return NextResponse.json({ error: 'OCR de recibos disponível apenas para planos Pro/Premium.' }, { status: 403 });
    }

    try {
        const { image } = await request.json(); // base64 image data
        if (!image) {
            return NextResponse.json({ error: 'Imagem é obrigatória.' }, { status: 400 });
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

        const response = await getGeminiClient().models.generateContent({
            model: 'gemini-2.0-flash',
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
                maxOutputTokens: 300,
                temperature: 0.2, // Low temperature for higher accuracy in extraction
            }
        });

        const reply = response.text || '';

        try {
            const clearJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const insightJson = JSON.parse(clearJson);
            return NextResponse.json(insightJson);
        } catch (err) {
            console.error('Scan JSON Parse Error:', err, reply);
            return NextResponse.json({ error: 'Falha ao processar o formato da nota.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Scan API error:', error);
        return NextResponse.json({ error: 'Erro interno no scanner IA.' }, { status: 500 });
    }
}
