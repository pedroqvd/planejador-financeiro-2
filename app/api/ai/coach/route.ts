export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGeminiClient } from '@/lib/gemini';
import { sendPushNotification } from '@/lib/firebase-admin';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const userPlan = session.user.plan || 'free';

    // Gate: Pro/Premium only
    if (userPlan === 'free') {
        return NextResponse.json({ error: 'Plano incompatível para o Coach.' }, { status: 403 });
    }

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const monthProgress = currentDay / daysInMonth;

        // 1. Fetch relevant financial data context for the Coach
        const [recentTransactions, budgets, goals, incomeAgg, expenseAgg, userRecord] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId, date: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }, // Last 7 days
                orderBy: { date: 'desc' },
                take: 15,
                select: { name: true, category: true, amount: true, type: true, date: true },
            }),
            prisma.budget.findMany({
                where: { userId, month: now.toISOString().slice(0, 7) },
                select: { category: true, limit: true, spent: true },
            }),
            prisma.goal.findMany({
                where: { userId },
                select: { name: true, target: true, current: true, deadline: true },
            }),
            prisma.transaction.aggregate({
                where: { userId, type: 'income', date: { gte: startOfMonth } },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: { userId, type: 'expense', date: { gte: startOfMonth } },
                _sum: { amount: true },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            })
        ]);

        const income = incomeAgg._sum.amount || 0;
        const expenses = expenseAgg._sum.amount || 0;

        // Pre-processing: Burn Rate & Anomalies
        let burnRateContext = `Progresso do mês: ${(monthProgress * 100).toFixed(0)}%. `;
        let budgetWarnings = [];

        for (const b of budgets) {
            if (b.limit > 0) {
                const percentSpent = b.spent / b.limit;
                if (percentSpent > monthProgress + 0.15) {
                    budgetWarnings.push(`⚠️ Risco em ${b.category}: Gastou ${(percentSpent * 100).toFixed(0)}% do limite, mas o mês está apenas ${(monthProgress * 100).toFixed(0)}% completo.`);
                }
            }
        }

        const context = `
📋 DADOS FINANCEIROS DO USUÁRIO PARA ANÁLISE:
- Receitas do mês: R$ ${income.toFixed(2)}
- Despesas do mês: R$ ${expenses.toFixed(2)}
- Tempo: ${burnRateContext}
${budgetWarnings.length > 0 ? '\\n🚨 ALERTAS DE BURN RATE PRÉ-COMPUTADOS:\\n' + budgetWarnings.join('\\n') : '\\n✅ Sem alertas críticos de orçamento no momento.'}

💰 ÚLTIMAS TRANSAÇÕES (7 dias):
${recentTransactions.length > 0
                ? recentTransactions.map(t => `- ${t.type === 'income' ? '➕' : '➖'} ${t.name}: R$ ${t.amount.toFixed(2)} (${t.category})`).join('\n')
                : '- Nenhuma transação recente.'
            }

🎯 METAS ATIVAS:
${goals.length > 0
                ? goals.map(g => `- ${g.name}: R$ ${g.current.toFixed(2)} de R$ ${g.target.toFixed(2)} (prazo: ${g.deadline})`).join('\n')
                : '- Nenhuma meta definida.'
            }
`.trim();

        const systemPrompt = `Você é o "Treinador Financeiro Ativo" do WealthCash. 
Sua função é gerar 1 ÚNICO INSIGHT PRÓ-ATIVO para ser exibido como push notification surpresa para o usuário.

REGRAS RÍGIDAS DE SAÍDA:
1. Você DEVE retornar EXCLUSIVAMENTE um JSON válido (sem marcadores de markdown como \`\`\`json).
2. O Insight deve ser curto, impactante e parecer um SMS de um assessor financeiro de elite.
3. Foque em apenas 1 assunto (uma anomalia nas últimas transações, um alerta sobre o ritmo de gasto (burn rate), ou um incentivo forte sobre uma meta).
4. Evite saudações como "Olá!". Vá direto ao ponto.

FORMATO JSON OBRIGATÓRIO DA RESPOSTA:
{
   "title": "Alerta de Ritmo de Gasto ⚠️" ou "Dica da Inteligência 💡" ou "Parabéns! 🎯",
   "message": "Mensagem curta de 2 linhas focado no problema ou oportunidade encontrada.",
   "actionableAdvice": "Comando imperativo de como consertar (ex: Congele gastos com Lazer no final de semana).",
   "type": "warning" | "success" | "info",
   "urgency": "high" | "medium" | "low"
}

Analise os dados abaixo e gere o insight:
${context}`;

        const response = await getGeminiClient().models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: {
                maxOutputTokens: 250, // Strict cost constraint for automated notifications
                temperature: 0.6,    // Less hallucination, more analytical
            }
        });

        const reply = response.text || '';

        let insightJson;
        try {
            const clearJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            insightJson = JSON.parse(clearJson);
        } catch (err) {
            console.error('Coach JSON Parse Error:', err);
            return NextResponse.json({ error: 'Falha ao processar análise da IA.' }, { status: 500 });
        }

        if (insightJson && userRecord?.fcmToken) {
            // FIREBASE DISPATCH: Acorda a tela bloqueada do celular do usuário
            await sendPushNotification(
                userRecord.fcmToken,
                insightJson.title,
                insightJson.message,
                { type: insightJson.type, urgency: insightJson.urgency }
            );
        }

        return NextResponse.json(insightJson);
    } catch (error) {
        console.error('Coach API error:', error);
        return NextResponse.json({ error: 'Erro interno do Treinador IA.' }, { status: 500 });
    }
}
