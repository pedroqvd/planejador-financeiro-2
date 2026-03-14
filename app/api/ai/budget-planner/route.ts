import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';
import { getGeminiClient } from '@/lib/gemini';

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`budget-ai:${session.user.id}`);
        if (!success) {
            return NextResponse.json({ error: 'Muitas requisições. Tente mais tarde.' }, { status: 429 });
        }
    } catch { /* dev fallback */ }

    try {
        // Fetch expenses from the last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                type: 'expense',
                date: { gte: ninetyDaysAgo }
            },
            select: { amount: true, category: true, date: true }
        });

        if (transactions.length < 5) {
            return NextResponse.json({
                error: 'Você não tem despesas o suficiente no histórico para a IA analisar de forma eficaz.'
            }, { status: 400 });
        }

        // Group by category to find average monthly spend
        const sums: Record<string, number> = {};
        for (const tx of transactions) {
            sums[tx.category] = (sums[tx.category] || 0) + tx.amount;
        }

        // Divide by 3 (assume 90 days ~ 3 months average)
        const averages = Object.entries(sums).map(([cat, total]) => ({
            category: cat,
            monthlyAverage: Number((total / 3).toFixed(2))
        }));

        const ai = getGeminiClient();

        const prompt = `Atue como um planejador financeiro rigoroso mas realista. 
Aqui está a média mensal de gastos de um usuário real baseada nos últimos 3 meses:
${JSON.stringify(averages, null, 2)}

Sua tarefa é sugerir um teto de gastos ideal (budget) para o próximo mês por categoria. 
- Tente aplicar uma regra de redução suave (5% a 10%) nas despesas não essenciais (ex: Lazer, Outros) para incentivar economia.
- Para despesas essenciais (ex: Moradia, Alimentação), mantenha o valor próximo da média a não ser que pareça muito inflado.
- Se o gasto médio for pífio, você pode arredondar ou dar um limite seguro.
- Você deve SEMPRE retornar um JSON estrito obedecendo este schema perfeitamente:
{
  "suggestions": [
     {
        "category": "NomeDaCategoria",
        "currentAverage": 1200.50,
        "suggestedLimit": 1100.00,
        "reasoning": "Texto curto (max 100 caracteres) explicando a redução de 8% para incentivar poupança."
     }
  ]
}
Não inclua nenhum texto Markdown ou backticks \`\`\`json na resposta, APENAS O JSON PURO.`;

        const response = await ai.models.generateContent({
            model: 'models/gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.2, // Low temp for more deterministic parsing
            }
        });

        const rawText = response.text || '';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(cleanedText);

        return NextResponse.json(parsed);
    } catch (error: any) {
        console.error('[AI Budget Planner Error]:', error);
        return NextResponse.json({ error: 'Erro ao gerar orçamento inteligente. Revise a chave API ou tente novamente.' }, { status: 500 });
    }
}
