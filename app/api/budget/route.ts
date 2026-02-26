import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';
import { getPlanLimits } from '@/lib/stripe';

const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];
const MAX_LIMIT = 99_999_999;

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`budget:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgets = await prisma.budget.findMany({
        where: { userId: session.user.id, month: currentMonth },
    });

    return NextResponse.json(budgets);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`budget:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        // Plan gating: limit budgets for free users
        const userPlan = session.user.plan || 'free';
        const planLimits = getPlanLimits(userPlan);

        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const category = String(body.category || '').trim();
        const limit = parseFloat(body.limit);

        if (!VALID_CATEGORIES.includes(category)) {
            return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 });
        }

        if (isNaN(limit) || limit <= 0 || limit > MAX_LIMIT) {
            return NextResponse.json({ error: 'Limite deve ser um valor positivo.' }, { status: 400 });
        }

        // Check if it's a new budget (not update)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const existing = await prisma.budget.findUnique({
            where: {
                userId_category_month: {
                    userId: session.user.id,
                    category,
                    month: currentMonth,
                },
            },
        });

        if (!existing && planLimits.maxBudgets !== Infinity) {
            const budgetCount = await prisma.budget.count({
                where: { userId: session.user.id, month: currentMonth },
            });
            if (budgetCount >= planLimits.maxBudgets) {
                return NextResponse.json(
                    { error: `Limite de ${planLimits.maxBudgets} orçamento(s) no plano Free. Faça upgrade para o Pro!` },
                    { status: 403 }
                );
            }
        }

        const budget = await prisma.budget.upsert({
            where: {
                userId_category_month: {
                    userId: session.user.id,
                    category,
                    month: currentMonth,
                },
            },
            update: { limit },
            create: {
                category,
                limit,
                spent: 0,
                month: currentMonth,
                userId: session.user.id,
            },
        });

        return NextResponse.json(budget);
    } catch (error) {
        console.error('Budget error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
