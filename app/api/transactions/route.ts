import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';
import { getPlanLimits } from '@/lib/plans';
import { sanitize } from '@/lib/utils';
import { sendPushNotification } from '@/lib/firebase-admin';

const VALID_TYPES = ['income', 'expense'] as const;
const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];
const MAX_AMOUNT = 99_999_999;

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

    // SECURITY: Rate limit by user ID (not IP) for consistency
    try {
        const { success } = await ratelimit.limit(`post:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const planLimits = getPlanLimits(session.user.plan || 'free');

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
        const paymentMethod = String(body.paymentMethod || 'account');
        const installments = parseInt(body.installments || '1');
        const currency = String(body.currency || 'BRL');

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

        const txsToCreate = [];
        const baseDate = new Date();

        if (paymentMethod === 'credit_card' && installments > 1 && type === 'expense') {
            const installmentAmount = Number((amount / installments).toFixed(2));
            for (let i = 0; i < installments; i++) {
                const txDate = new Date(baseDate);
                txDate.setMonth(txDate.getMonth() + i);

                // Adjust name for installments: e.g. "iPhone 14 (1/12)"
                const installName = `${name} (${i + 1}/${installments})`;

                txsToCreate.push({
                    name: installName,
                    category,
                    amount: i === installments - 1
                        ? Number((amount - installmentAmount * (installments - 1)).toFixed(2)) // Fix rounding on last parcell
                        : installmentAmount,
                    type,
                    paymentMethod,
                    installments,
                    currency,
                    userId: session.user.id,
                    date: txDate,
                });
            }
        } else {
            txsToCreate.push({
                name,
                category,
                amount,
                type,
                paymentMethod,
                installments: 1,
                currency,
                userId: session.user.id,
                date: baseDate,
            });
        }

        const createdTxs = await prisma.$transaction(
            txsToCreate.map(tx => {
                // @ts-ignore: currency added in schema but might not be in client yet
                return prisma.transaction.create({ data: tx });
            })
        );

        if (type === 'expense') {
            // Check for notifications targets
            let userDeviceToken: string | null = null;

            // Update budgets for all created months
            for (const tx of createdTxs) {
                const currentMonth = tx.date.toISOString().slice(0, 7);

                // Find budget and update in one query batch
                const [categoryBudget] = await Promise.all([
                    prisma.budget.findFirst({
                        where: { userId: session.user.id, category: tx.category, month: currentMonth }
                    }),
                    prisma.budget.updateMany({
                        where: {
                            userId: session.user.id,
                            category: tx.category,
                            month: currentMonth,
                        },
                        data: {
                            spent: { increment: tx.amount },
                        },
                    }),
                ]);

                // Rule 1: Budget Exceeded Notification
                if (categoryBudget && (categoryBudget.spent + tx.amount) > categoryBudget.limit && categoryBudget.spent <= categoryBudget.limit) {
                    if (!userDeviceToken) {
                        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { fcmToken: true } });
                        userDeviceToken = user?.fcmToken || null;
                    }

                    if (userDeviceToken) {
                        // Fire and forget (don't await so we don't block the request)
                        sendPushNotification(
                            userDeviceToken,
                            '⚠️ Alerta de Orçamento: Limite Atingido!',
                            `Você acabou de exceder seu limite de ${categoryBudget.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para a categoria ${categoryBudget.category}.`
                        ).catch(e => console.error('Failed to send budget warning push:', e));
                    }
                }
            }

            // Rule 2: Unusual Expense Alert (Single large expense)
            // Check if this single amount is > 3x the average of this category in the last 30 days
            if (amount > 100) { // Only care if it's somewhat significant
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentTxs = await prisma.transaction.aggregate({
                    where: { userId: session.user.id, category, type: 'expense', date: { gte: thirtyDaysAgo } },
                    _avg: { amount: true }
                });

                const avgAmount = recentTxs._avg.amount || 0;
                if (avgAmount > 0 && amount > (avgAmount * 3)) {
                    if (!userDeviceToken) {
                        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { fcmToken: true } });
                        userDeviceToken = user?.fcmToken || null;
                    }

                    if (userDeviceToken) {
                        sendPushNotification(
                            userDeviceToken,
                            '🛡️ AI Coach: Gasto Incomum Detectado',
                            `Você registrou R$ ${amount.toFixed(2)} em ${category}. Isso é bem acima da sua média recente. Tudo certo?`
                        ).catch(e => console.error('Failed to send unusual expense push:', e));
                    }
                }
            }
        }

        return NextResponse.json(createdTxs[0], { status: 201 });
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
        const currency = String(body.currency || 'BRL');

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
            // @ts-ignore
            data: { name, category, amount, type, currency },
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
        const body = await request.json();
        const { id, ids } = body;

        const idsToDelete = ids && Array.isArray(ids) ? ids : (id ? [id] : []);

        if (idsToDelete.length === 0) {
            return NextResponse.json({ error: 'ID ou IDs são obrigatórios.' }, { status: 400 });
        }

        // SECURITY: Limit bulk delete to prevent expensive DB operations
        if (idsToDelete.length > 100) {
            return NextResponse.json({ error: 'Máximo de 100 transações por requisição.' }, { status: 400 });
        }

        // Verify ownership and get data for all requested transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                id: { in: idsToDelete },
                userId: session.user.id
            }
        });

        if (transactions.length === 0) {
            return NextResponse.json({ error: 'Nenhuma transação encontrada.' }, { status: 404 });
        }

        // Revert budget impact for each expense
        for (const transaction of transactions) {
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
        }

        // Finalize deletion
        const { count } = await prisma.transaction.deleteMany({
            where: {
                id: { in: transactions.map(t => t.id) }
            }
        });

        return NextResponse.json({ message: `${count} transações removidas.` });
    } catch (error) {
        console.error('Delete transaction error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
