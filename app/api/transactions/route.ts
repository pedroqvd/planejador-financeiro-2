import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit, getClientIp } from '@/lib/rate-limit';
import { getPlanLimits } from '@/lib/stripe';

const VALID_TYPES = ['income', 'expense'] as const;
const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];
const MAX_AMOUNT = 99_999_999;

function sanitize(str: string): string {
    return str.replace(/[<>&"'/\\]/g, '').trim().slice(0, 200);
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit
    try {
        const { success } = await ratelimit.limit(`get:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    // Pagination
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
            take: limit,
            skip,
        }),
        prisma.transaction.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({ transactions, total, page, limit });
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit
    try {
        const ip = getClientIp(request);
        const { success } = await ratelimit.limit(`post:${ip}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        // Plan gating: check transaction count for free users
        const userPlan = session.user.plan || 'free';
        const planLimits = getPlanLimits(userPlan);

        if (planLimits.transactionsPerMonth !== Infinity) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthCount = await prisma.transaction.count({
                where: { userId: session.user.id, date: { gte: startOfMonth } },
            });

            if (monthCount >= planLimits.transactionsPerMonth) {
                return NextResponse.json(
                    { error: `Limite de ${planLimits.transactionsPerMonth} transações/mês atingido. Faça upgrade para o Pro!` },
                    { status: 403 }
                );
            }
        }

        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const name = sanitize(String(body.name || ''));
        const category = sanitize(String(body.category || ''));
        const amount = parseFloat(body.amount);
        const type = String(body.type || '');

        if (!name || !category) {
            return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 });
        }

        if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
            return NextResponse.json({ error: 'Tipo deve ser "income" ou "expense".' }, { status: 400 });
        }

        if (!VALID_CATEGORIES.includes(category)) {
            return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 });
        }

        if (isNaN(amount) || amount <= 0 || amount > MAX_AMOUNT) {
            return NextResponse.json({ error: 'Valor deve ser entre R$ 0,01 e R$ 99.999.999.' }, { status: 400 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                name,
                category,
                amount,
                type,
                userId: session.user.id,
            },
        });

        if (type === 'expense') {
            const currentMonth = new Date().toISOString().slice(0, 7);
            await prisma.budget.updateMany({
                where: {
                    userId: session.user.id,
                    category,
                    month: currentMonth,
                },
                data: {
                    spent: { increment: amount },
                },
            });
        }

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Transaction error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const { id } = body;
        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
        }

        // IDOR protection
        const existing = await prisma.transaction.findFirst({
            where: { id, userId: session.user.id },
        });
        if (!existing) {
            return NextResponse.json({ error: 'Transação não encontrada.' }, { status: 404 });
        }

        const name = sanitize(String(body.name || ''));
        const category = sanitize(String(body.category || ''));
        const amount = parseFloat(body.amount);
        const type = String(body.type || '');

        if (!name || !category) {
            return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 });
        }
        if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
            return NextResponse.json({ error: 'Tipo deve ser "income" ou "expense".' }, { status: 400 });
        }
        if (!VALID_CATEGORIES.includes(category)) {
            return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 });
        }
        if (isNaN(amount) || amount <= 0 || amount > MAX_AMOUNT) {
            return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 });
        }

        // Revert old budget impact
        if (existing.type === 'expense') {
            const oldMonth = new Date(existing.date).toISOString().slice(0, 7);
            await prisma.budget.updateMany({
                where: { userId: session.user.id, category: existing.category, month: oldMonth },
                data: { spent: { decrement: existing.amount } },
            });
        }

        const updated = await prisma.transaction.update({
            where: { id },
            data: { name, category, amount, type },
        });

        // Apply new budget impact
        if (type === 'expense') {
            const newMonth = new Date(updated.date).toISOString().slice(0, 7);
            await prisma.budget.updateMany({
                where: { userId: session.user.id, category, month: newMonth },
                data: { spent: { increment: amount } },
            });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update transaction error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
        }

        // IDOR protection: verify ownership
        const transaction = await prisma.transaction.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transação não encontrada.' }, { status: 404 });
        }

        // Decrement budget if expense
        if (transaction.type === 'expense') {
            const txMonth = new Date(transaction.date).toISOString().slice(0, 7);
            await prisma.budget.updateMany({
                where: {
                    userId: session.user.id,
                    category: transaction.category,
                    month: txMonth,
                },
                data: {
                    spent: { decrement: transaction.amount },
                },
            });
        }

        await prisma.transaction.delete({ where: { id } });

        return NextResponse.json({ message: 'Transação removida.' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
