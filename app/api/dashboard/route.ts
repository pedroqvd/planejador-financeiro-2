import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`dash:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    const userId = session.user.id;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for better performance
    const [incomeResult, expenseResult, goalsResult] = await Promise.all([
        prisma.transaction.aggregate({
            where: { userId, type: 'income', date: { gte: startOfMonth } },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { userId, type: 'expense', date: { gte: startOfMonth } },
            _sum: { amount: true },
        }),
        prisma.goal.aggregate({
            where: { userId },
            _sum: { current: true },
        }),
    ]);

    const income = incomeResult._sum.amount || 0;
    const expenses = expenseResult._sum.amount || 0;
    const investments = goalsResult._sum.current || 0;
    const netWorth = income - expenses + investments;

    // Get monthly trend data (last 6 months) — parallel queries
    const monthPromises = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        monthPromises.push(
            Promise.all([
                prisma.transaction.aggregate({
                    where: { userId, type: 'income', date: { gte: monthStart, lte: monthEnd } },
                    _sum: { amount: true },
                }),
                prisma.transaction.aggregate({
                    where: { userId, type: 'expense', date: { gte: monthStart, lte: monthEnd } },
                    _sum: { amount: true },
                }),
            ]).then(([inc, exp]) => ({
                name: monthNames[d.getMonth()],
                receitas: inc._sum.amount || 0,
                despesas: exp._sum.amount || 0,
            }))
        );
    }

    const months = await Promise.all(monthPromises);

    // Get budgets
    const budgets = await prisma.budget.findMany({
        where: { userId, month: currentMonth },
    });

    return NextResponse.json({
        stats: { netWorth, income, expenses, investments },
        chartData: months,
        budgets,
    });
}
