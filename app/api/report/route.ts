import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit
    try {
        const { success } = await ratelimit.limit(`report:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    const url = new URL(request.url);
    const monthParam = url.searchParams.get('month'); // format: YYYY-MM

    // Validate month format
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    const now = new Date();
    const month = (monthParam && monthRegex.test(monthParam)) ? monthParam : now.toISOString().slice(0, 7);

    const [year, mon] = month.split('-').map(Number);

    // Prevent future months or unreasonable past
    if (year < 2020 || year > now.getFullYear() + 1) {
        return NextResponse.json({ error: 'Período inválido.' }, { status: 400 });
    }

    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59);
    const userId = session.user.id;

    const [transactions, budgets, goals, user] = await Promise.all([
        prisma.transaction.findMany({
            where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
            orderBy: { date: 'desc' },
            select: { name: true, category: true, amount: true, type: true, date: true },
        }),
        prisma.budget.findMany({
            where: { userId, month },
            select: { category: true, limit: true, spent: true },
        }),
        prisma.goal.findMany({
            where: { userId },
            select: { name: true, target: true, current: true, deadline: true },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        }),
    ]);

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Group expenses by category
    const byCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    return NextResponse.json({
        user: { name: user?.name || 'Usuário' },
        month: monthNames[mon - 1],
        year,
        summary: { income, expenses, balance: income - expenses, transactionCount: transactions.length },
        transactions: transactions.map(t => ({
            ...t,
            date: new Date(t.date).toLocaleDateString('pt-BR'),
        })),
        expensesByCategory: Object.entries(byCategory)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total),
        budgets: budgets.map(b => ({
            ...b,
            percentage: b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0,
        })),
        goals,
    });
}
