import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';
import { addDays, format, isSameDay } from 'date-fns';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        try {
            const { success } = await ratelimit.limit(`forecast:${session.user.id}`);
            if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
        } catch { /* dev fallback */ }

        const userId = session.user.id;

        // 1. Get current balance (sum of all transactions)
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            select: { amount: true, type: true }
        });

        let currentBalance = transactions.reduce((acc, tx) => {
            return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
        }, 0);

        // 2. Fetch active recurrences
        const recurrences = await prisma.recurrence.findMany({
            where: { userId, active: true }
        });

        // 3. Project daily balances for the next 90 days
        const projection = [];
        let runningBalance = currentBalance;
        const startDate = new Date();

        for (let i = 0; i <= 90; i++) {
            const currentDate = addDays(startDate, i);
            const dayRecurrences = recurrences.filter(r => {
                const dueDate = new Date(r.nextDueDate);

                if (isSameDay(currentDate, dueDate)) return true;

                if (r.frequency === 'monthly' && currentDate > dueDate) {
                    return currentDate.getDate() === dueDate.getDate();
                }

                if (r.frequency === 'weekly' && currentDate > dueDate) {
                    return currentDate.getDay() === dueDate.getDay();
                }

                return false;
            });

            const dayChange = dayRecurrences.reduce((acc, r) => {
                return r.type === 'income' ? acc + r.amount : acc - r.amount;
            }, 0);

            runningBalance += dayChange;

            projection.push({
                date: format(currentDate, 'yyyy-MM-dd'),
                displayDate: format(currentDate, 'dd/MM'),
                balance: parseFloat(runningBalance.toFixed(2)),
                isCurrent: i === 0,
                events: dayRecurrences.map(r => ({ name: r.name, amount: r.amount, type: r.type }))
            });
        }

        return NextResponse.json({
            currentBalance,
            projection
        });
    } catch (error) {
        console.error('Forecast Error:', error);
        return NextResponse.json({ error: 'Erro ao gerar projeção' }, { status: 500 });
    }
}
