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

    // Get monthly trend data (last 6 months) — optimized single query instead of N+1 loop
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const recentTransactions = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId, date: { gte: sixMonthsAgo } },
        _sum: { amount: true },
        // Prisma's groupBy doesn't natively support grouping by extracted month from Date directly in standard client
        // So we will fetch the raw data and aggregate in memory for the small dataset of 6 months
    });

    const allRecentTx = await prisma.transaction.findMany({
        where: { userId, date: { gte: sixMonthsAgo } },
        select: { amount: true, type: true, date: true }
    });

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Initialize array for the last 6 months
    const monthsData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
            name: monthNames[d.getMonth()],
            monthKey: `${d.getFullYear()}-${d.getMonth()}`,
            receitas: 0,
            despesas: 0
        };
    });

    // Aggregate in memory (O(N) operation, much faster than 12 isolated DB queries)
    allRecentTx.forEach(tx => {
        const txDate = new Date(tx.date);
        const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
        const monthObj = monthsData.find(m => m.monthKey === key);
        if (monthObj) {
            if (tx.type === 'income') monthObj.receitas += tx.amount;
            if (tx.type === 'expense') monthObj.despesas += tx.amount;
        }
    });

    // Clean up temporary keys before sending to chart
    const months = monthsData.map(({ name, receitas, despesas }) => ({ name, receitas, despesas }));

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
