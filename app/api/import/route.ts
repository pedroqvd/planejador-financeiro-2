import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit, getClientIp } from '@/lib/rate-limit';
import { geminiGenerateWithRetry } from '@/lib/gemini';

const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Saúde', 'Educação', 'Compras', 'Outros'];

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userPlan = session.user.plan || 'free';
    if (userPlan === 'free') {
        return NextResponse.json(
            { error: 'Importação automática é exclusiva do plano Pro. Faça upgrade!' },
            { status: 403 }
        );
    }

    try {
        const ip = getClientIp(request);
        const { success } = await ratelimit.limit(`import:${ip}`);
        if (!success) return NextResponse.json({ error: 'Muitas importações. Tente novamente depois.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const formData = await request.formData() as any;
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB).' }, { status: 400 });
        }

        // SECURITY: Validate MIME type against whitelist
        const ALLOWED_MIME_TYPES: Record<string, string> = {
            'application/pdf': 'application/pdf',
            'text/csv': 'text/plain',
            'text/plain': 'text/plain',
            'application/vnd.ms-excel': 'text/plain',
            'application/x-ofx': 'text/plain',
        };
        const ALLOWED_EXTENSIONS = ['.pdf', '.csv', '.txt', '.ofx', '.qfx'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
        const fileMime = file.type || '';
        if (!hasValidExtension && !ALLOWED_MIME_TYPES[fileMime]) {
            return NextResponse.json({ error: 'Formato não suportado. Use PDF, CSV, OFX ou TXT.' }, { status: 400 });
        }

        let mimeType = ALLOWED_MIME_TYPES[fileMime] || 'text/plain';
        if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const prompt = `Você é um extrator de dados financeiros do aplicativo WealthCash.
Abaixo está um documento (que pode ser uma fatura de cartão de crédito em PDF, um OFX bancário ou CSV).
Sua missão é extrair todas as TRANSAÇÕES DE DESPESAS e RECEITAS encontradas neste arquivo.

REGRAS:
1. Ignore transferências de pagamento da própria fatura (ex: "Pagamento de fatura", "Pagamento recebido").
2. Devolva APENAS um Array JSON puro e perfeitamente formatado. Sem marcações Markdown (sem crases).
3. Para cada transação, crie um objeto com este exato formato e NADA MAIS:
{
  "name": "Nome curto e limpo do local (Ex: Uber, MercadoLivre, iFood)",
  "amount": VALOR_NUMERICO_POSITIVO_AQUI_PONTO_FLUTUANTE (ex: 29.90),
  "category": "Uma das seguintes: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Compras, Salário, Outros",
  "type": "expense" ou "income",
  "date": "Data no formato ISO-8601 ex: 2025-02-28T12:00:00.000Z"
}

Se você não identificar o ano no documento, presuma o ano atual.
Execute agora. Retorne o [ ... ] JSON.`;

        const response = await geminiGenerateWithRetry({
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { data: buffer.toString('base64'), mimeType } }
                    ]
                }
            ],
            config: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const reply = response.text || '';
        const cleanJSON = reply.replace(/```json/g, '').replace(/```/g, '').trim();

        let transactionsData = [];
        try {
            transactionsData = JSON.parse(cleanJSON);
            if (!Array.isArray(transactionsData)) {
                transactionsData = [transactionsData];
            }
        } catch (parseError) {
            console.error('Failed to parse AI JSON:', reply);
            return NextResponse.json({ error: 'A IA não conseguiu interpretar este arquivo de forma estruturada. Verifique o formato.' }, { status: 400 });
        }

        if (transactionsData.length === 0) {
            return NextResponse.json({ error: 'Nenhuma transação financeira encontrada no documento.' }, { status: 400 });
        }

        // Safety cap
        const toImport = transactionsData.slice(0, 500);

        const mappedData = toImport
            .map((t: any) => ({
                name: String(t.name).slice(0, 50) || 'Transação Importada',
                category: VALID_CATEGORIES.includes(String(t.category)) ? String(t.category) : 'Outros',
                amount: Number(t.amount) || 0,
                type: t.type === 'income' ? 'income' : 'expense',
                date: t.date ? new Date(t.date) : new Date(),
                userId: session.user.id
            }))
            .filter((t: any) => t.amount > 0); // Filter out zero/negative amounts

        const created = await prisma.transaction.createMany({
            data: mappedData
        });

        // Update budget spent for expenses
        const expensesByMonthCategory = mappedData
            .filter((t: any) => t.type === 'expense')
            .reduce((acc: any, t: any) => {
                const month = new Date(t.date).toISOString().slice(0, 7);
                const key = `${month}:${t.category}`;
                acc[key] = { month, category: t.category, total: (acc[key]?.total || 0) + t.amount };
                return acc;
            }, {});

        for (const { month, category, total } of Object.values(expensesByMonthCategory) as any) {
            await (prisma as any).budget.updateMany({
                where: { userId: session.user.id, category, month },
                data: { spent: { increment: total } },
            });
        }

        return NextResponse.json({
            message: `${created.count} transações magicamente importadas!`,
            count: created.count,
        }, { status: 201 });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: 'Erro ao processar importação via IA.' }, { status: 500 });
    }
}
