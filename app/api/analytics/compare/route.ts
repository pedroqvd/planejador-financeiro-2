export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const monthCount = Math.min(parseInt(url.searchParams.get('months') || '6'), 12);

    try {
        const userId = session.user.id;
        const now = new Date();

        // Build month ranges for the last N months
        const months: { label: string; key: string; start: Date; end: Date }[] = [];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (let i = monthCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            months.push({
                label: `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`,
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                start,
                end,
            });
        }

        // Fetch all transactions in the full range at once (single query)
        const allTransactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: months[0].start, lte: months[months.length - 1].end },
            },
            select: { amount: true, type: true, category: true, date: true, name: true },
        });

        // Aggregate per month
        const timeline = months.map(m => {
            const txs = allTransactions.filter(t => {
                const d = new Date(t.date);
                return d >= m.start && d <= m.end;
            });
            const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

            return {
                label: m.label,
                key: m.key,
                income,
                expenses,
                balance: income - expenses,
            };
        });

        // Current month breakdown by category
        const currentMonth = months[months.length - 1];
        const currentTxs = allTransactions.filter(t => {
            const d = new Date(t.date);
            return d >= currentMonth.start && d <= currentMonth.end;
        });

        const expensesByCategory: Record<string, number> = {};
        currentTxs.filter(t => t.type === 'expense').forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });

        const totalExpenses = Object.values(expensesByCategory).reduce((s, v) => s + v, 0);

        const categoryBreakdown = Object.entries(expensesByCategory)
            .map(([category, total]) => ({
                category,
                total,
                percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
            }))
            .sort((a, b) => b.total - a.total);

        // Current vs previous month KPI comparison
        const currentIdx = months.length - 1;
        const prevIdx = months.length - 2;
        const current = timeline[currentIdx];
        const previous = currentIdx > 0 ? timeline[prevIdx] : null;

        const calcVariation = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };

        const kpis = {
            income: {
                value: current.income,
                variation: previous ? calcVariation(current.income, previous.income) : 0,
            },
            expenses: {
                value: current.expenses,
                variation: previous ? calcVariation(current.expenses, previous.expenses) : 0,
            },
            balance: {
                value: current.balance,
                variation: previous ? calcVariation(current.balance, previous.balance) : 0,
            },
            savingsRate: {
                value: current.income > 0 ? Math.round(((current.income - current.expenses) / current.income) * 100) : 0,
                variation: 0, // calculated below
            },
        };

        if (previous && previous.income > 0) {
            const prevSavingsRate = Math.round(((previous.income - previous.expenses) / previous.income) * 100);
            kpis.savingsRate.variation = kpis.savingsRate.value - prevSavingsRate;
        }

        // Top 5 expenses this month
        const topExpenses = currentTxs
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(t => ({ name: t.name, category: t.category, amount: t.amount }));

        return NextResponse.json({
            timeline,
            categoryBreakdown,
            kpis,
            topExpenses,
            currentMonth: currentMonth.label,
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Erro ao analisar dados' }, { status: 500 });
    }
}
