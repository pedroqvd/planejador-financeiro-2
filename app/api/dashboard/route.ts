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
    const [incomeResult, expenseResult, goalsResult, userRecord] = await Promise.all([
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
        prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true, referralsCount: true },
        }),
    ]);

    const income = incomeResult._sum.amount || 0;
    const expenses = expenseResult._sum.amount || 0;
    const investments = goalsResult._sum.current || 0;
    const netWorth = income - expenses + investments;

    // Get monthly trend data (last 6 months) — aggregated in the database for performance
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyAgg = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId, date: { gte: sixMonthsAgo } },
        _sum: { amount: true },
        // Prisma groupBy doesn't support grouping by date parts directly,
        // so we fetch per-type totals and also need date info.
        // Alternative: use a raw query. For now, we use a lighter findMany with only needed fields.
    });

    // Prisma groupBy can't group by date.month natively, so we still fetch rows but ONLY select minimal fields
    const recentTx = await prisma.transaction.findMany({
        where: { userId, date: { gte: sixMonthsAgo } },
        select: { amount: true, type: true, date: true }
    });

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Initialize map for O(1) lookups instead of Array.find
    const monthsMap = new Map<string, { name: string; receitas: number; despesas: number }>();
    const monthsOrder: string[] = [];

    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthsMap.set(key, { name: monthNames[d.getMonth()], receitas: 0, despesas: 0 });
        monthsOrder.push(key);
    }

    // Aggregate in memory with O(1) map lookups
    for (const tx of recentTx) {
        const txDate = new Date(tx.date);
        const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
        const monthObj = monthsMap.get(key);
        if (monthObj) {
            if (tx.type === 'income') monthObj.receitas += tx.amount;
            if (tx.type === 'expense') monthObj.despesas += tx.amount;
        }
    }

    const months = monthsOrder.map(key => monthsMap.get(key)!);

    // Get budgets
    const budgets = await prisma.budget.findMany({
        where: { userId, month: currentMonth },
    });

    return NextResponse.json({
        stats: { netWorth, income, expenses, investments },
        chartData: months,
        budgets,
        referral: userRecord,
    });
}
