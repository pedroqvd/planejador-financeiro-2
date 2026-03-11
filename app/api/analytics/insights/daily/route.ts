import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';
import { startOfDay, endOfDay } from 'date-fns';

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Fetch today's transactions
        const today = new Date();
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: startOfDay(today),
                    lte: endOfDay(today)
                },
                type: 'expense'
            }
        });

        const totalSpent = transactions.reduce((acc, tx) => acc + tx.amount, 0);

        // 2. Find top category
        const categoryMap: Record<string, number> = {};
        transactions.forEach(tx => {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        });

        let topCategory = '—';
        let topAmount = 0;
        for (const [cat, amt] of Object.entries(categoryMap)) {
            if (amt > topAmount) {
                topAmount = amt;
                topCategory = cat;
            }
        }

        // 3. Calculate remaining monthly budget
        const currentMonth = today.toISOString().slice(0, 7);
        const budgets = await prisma.budget.findMany({
            where: { userId, month: currentMonth }
        });

        const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
        const totalMonthlySpent = budgets.reduce((acc, b) => acc + b.spent, 0);
        const remainingBudget = Math.max(0, totalLimit - totalMonthlySpent);

        // 4. Create Notification
        const title = 'Resumo do Dia 🌙';
        const message = totalSpent > 0
            ? `Hoje você gastou R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Principal categoria: ${topCategory}. Restam R$ ${remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no orçamento do mês.`
            : `Dia tranquilo! Você não registrou gastos hoje. Restam R$ ${remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no orçamento do mês.`;

        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: 'success'
            }
        });

        // 5. Send Push
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmToken: true }
        });

        if (user?.fcmToken) {
            await sendPushNotification(user.fcmToken, title, message);
        }

        return NextResponse.json({ success: true, summary: message });
    } catch (error) {
        console.error('Daily Insight Error:', error);
        return NextResponse.json({ error: 'Erro ao gerar resumo diário' }, { status: 500 });
    }
}
