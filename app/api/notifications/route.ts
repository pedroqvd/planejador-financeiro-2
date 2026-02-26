import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Generate smart notifications based on user data
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const notifications: { id: string; title: string; message: string; type: string; time: string }[] = [];

    try {
        // Check budgets for overspending
        const budgets = await prisma.budget.findMany({
            where: { userId: session.user.id, month: currentMonth },
        });

        for (const b of budgets) {
            const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            if (pct >= 100) {
                notifications.push({
                    id: `budget-over-${b.category}`,
                    title: 'Orçamento estourado',
                    message: `Você ultrapassou o limite de ${b.category} em R$ ${(b.spent - b.limit).toFixed(2)}`,
                    type: 'warning',
                    time: 'Agora',
                });
            } else if (pct >= 80) {
                notifications.push({
                    id: `budget-warn-${b.category}`,
                    title: 'Orçamento quase no limite',
                    message: `${b.category}: ${pct.toFixed(0)}% do limite utilizado`,
                    type: 'info',
                    time: 'Agora',
                });
            }
        }

        // Check recent transactions
        const recentCount = await prisma.transaction.count({
            where: {
                userId: session.user.id,
                date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) },
            },
        });

        if (recentCount === 0) {
            notifications.push({
                id: 'no-recent',
                title: 'Sem registros recentes',
                message: 'Você não registrou transações nos últimos 7 dias.',
                type: 'info',
                time: 'Hoje',
            });
        }

        // Goals progress
        const goals = await prisma.goal.findMany({
            where: { userId: session.user.id },
        });

        for (const g of goals) {
            const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
            if (pct >= 100) {
                notifications.push({
                    id: `goal-done-${g.id}`,
                    title: 'Meta atingida! 🎉',
                    message: `Você completou a meta "${g.name}"!`,
                    type: 'success',
                    time: 'Recente',
                });
            } else if (pct >= 75) {
                notifications.push({
                    id: `goal-close-${g.id}`,
                    title: 'Meta quase lá',
                    message: `"${g.name}": ${pct.toFixed(0)}% concluída`,
                    type: 'info',
                    time: 'Recente',
                });
            }
        }
    } catch (error) {
        console.error('Notifications error:', error);
    }

    return NextResponse.json({ notifications });
}
