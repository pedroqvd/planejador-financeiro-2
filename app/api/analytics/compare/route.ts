export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Define date ranges
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch Current Month Data
        const [currentIncome, currentExpense, currentByCategory] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId, type: 'income', date: { gte: currentMonthStart, lt: nextMonthStart } },
                _sum: { amount: true }
            }),
            prisma.transaction.aggregate({
                where: { userId, type: 'expense', date: { gte: currentMonthStart, lt: nextMonthStart } },
                _sum: { amount: true }
            }),
            prisma.transaction.groupBy({
                by: ['category'],
                where: { userId, type: 'expense', date: { gte: currentMonthStart, lt: nextMonthStart } },
                _sum: { amount: true },
            })
        ]);

        // Fetch Last Month Data
        const [lastIncome, lastExpense, lastByCategory] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId, type: 'income', date: { gte: lastMonthStart, lt: lastMonthEnd } },
                _sum: { amount: true }
            }),
            prisma.transaction.aggregate({
                where: { userId, type: 'expense', date: { gte: lastMonthStart, lt: lastMonthEnd } },
                _sum: { amount: true }
            }),
            prisma.transaction.groupBy({
                by: ['category'],
                where: { userId, type: 'expense', date: { gte: lastMonthStart, lt: lastMonthEnd } },
                _sum: { amount: true },
            })
        ]);

        const currentM = {
            income: currentIncome._sum.amount || 0,
            expense: currentExpense._sum.amount || 0,
            byCategory: currentByCategory.reduce((acc, cat) => {
                acc[cat.category] = cat._sum.amount || 0;
                return acc;
            }, {} as Record<string, number>),
        };

        const lastM = {
            income: lastIncome._sum.amount || 0,
            expense: lastExpense._sum.amount || 0,
            byCategory: lastByCategory.reduce((acc, cat) => {
                acc[cat.category] = cat._sum.amount || 0;
                return acc;
            }, {} as Record<string, number>),
        };

        return NextResponse.json({ current: currentM, last: lastM });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Erro ao analisar dados' }, { status: 500 });
    }
}
