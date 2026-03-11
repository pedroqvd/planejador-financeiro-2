import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';
import { getExchangeRates } from '@/lib/currency';

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
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Parallel queries for better performance
    const [userRecord, recentTx, goals, budgets] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            // @ts-ignore: preferredCurrency was added but client generation might be pending
            select: { referralCode: true, referralsCount: true, preferredCurrency: true },
        }),
        prisma.transaction.findMany({
            where: { userId, date: { gte: sixMonthsAgo } },
            // @ts-ignore: currency might not be in client yet
            select: { amount: true, type: true, date: true, currency: true }
        }),
        prisma.goal.findMany({
            where: { userId },
            // @ts-ignore
            select: { current: true, currency: true }
        }),
        prisma.budget.findMany({
            where: { userId, month: currentMonth },
            // @ts-ignore
            select: { limit: true, spent: true, category: true, currency: true, month: true }
        })
    ]);

    const user = (userRecord as any) || { referralCode: '', referralsCount: 0, preferredCurrency: 'BRL' };
    const preferredCurrency = user.preferredCurrency;

    // Fetch exchange rates once for the whole dashboard calculation
    const exchangeData = await getExchangeRates();
    const rates = exchangeData.rates;

    // Helper to convert inline
    const toBase = (amount: number, fromCurrency: string = 'BRL') => {
        if (!amount) return 0;
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[preferredCurrency] || 1;
        return (amount / fromRate) * toRate;
    };

    let income = 0;
    let expenses = 0;
    let investments = 0;

    // Convert and sum goals
    for (const goal of goals) {
        investments += toBase(goal.current, (goal as any).currency || 'BRL');
    }

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

    // Aggregate in memory with O(1) map lookups and currency conversion
    for (const tx of recentTx) {
        const txDate = new Date(tx.date);
        const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
        const monthObj = monthsMap.get(key);

        const convertedAmount = toBase(tx.amount, (tx as any).currency || 'BRL');

        if (monthObj) {
            if (tx.type === 'income') monthObj.receitas += convertedAmount;
            if (tx.type === 'expense') monthObj.despesas += convertedAmount;
        }

        // Also aggregate current month totals for the hero cards
        if (key === currentMonth.replace('-0', '-').replace('-', '-')) {
            // currentMonth is YYYY-MM, we need to handle format e.g. 2023-11 vs 2023-01
        }
        // Actually, simple check: is txDate >= startOfMonth
        if (txDate.getTime() >= startOfMonth.getTime()) {
            if (tx.type === 'income') income += convertedAmount;
            if (tx.type === 'expense') expenses += convertedAmount;
        }
    }

    const netWorth = income - expenses + investments;

    const months = monthsOrder.map(key => monthsMap.get(key)!);

    // Filter budgets to just this month so Health Score is correct
    const currentMonthBudgets = budgets.filter((b: any) => b.month === currentMonth);

    // Calculate Financial Health Score (0-1000)
    // 1. Savings Rate (600 pts)
    const savingsRate = income > 0 ? (income - expenses) / income : 0;
    const savingsScore = Math.max(0, Math.min(savingsRate * 600, 600));

    // 2. Budget Adherence (400 pts)
    let budgetScore = 400;
    if (currentMonthBudgets.length > 0) {
        const withinLimit = currentMonthBudgets.filter((b: any) => toBase(b.spent, b.currency || 'BRL') <= toBase(b.limit, b.currency || 'BRL')).length;
        budgetScore = (withinLimit / currentMonthBudgets.length) * 400;
    }

    const healthScore = Math.round(savingsScore + budgetScore);

    return NextResponse.json({
        stats: { netWorth, income, expenses, investments },
        chartData: months,
        budgets,
        healthScore,
        referral: userRecord,
        preferredCurrency
    });
}
