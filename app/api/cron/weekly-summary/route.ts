import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

export const maxDuration = 60; // Allows up to 60s for Vercel Hobby

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        // SECURITY: Always require CRON_SECRET. If not configured, deny access.
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get all users who have an FCM token
        const usersWithPush = await prisma.user.findMany({
            where: {
                fcmToken: { not: null },
                plan: { not: 'free' } // Keep premium feature walled
            },
            select: {
                id: true,
                name: true,
                fcmToken: true,
            }
        });

        if (usersWithPush.length === 0) {
            return NextResponse.json({ success: true, message: 'Nenhum usuário com Push configurado.' });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        let sentCount = 0;

        for (const user of usersWithPush) {
            if (!user.fcmToken) continue;

            const [incomeAgg, expenseAgg] = await Promise.all([
                prisma.transaction.aggregate({
                    where: { userId: user.id, type: 'income', date: { gte: sevenDaysAgo } },
                    _sum: { amount: true }
                }),
                prisma.transaction.aggregate({
                    where: { userId: user.id, type: 'expense', date: { gte: sevenDaysAgo } },
                    _sum: { amount: true }
                })
            ]);

            const weeklyIncome = incomeAgg._sum.amount || 0;
            const weeklyExpense = expenseAgg._sum.amount || 0;

            if (weeklyIncome === 0 && weeklyExpense === 0) {
                continue; // Skip inactive users to avoid spam
            }

            const format = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            let emoji = '📊';
            if (weeklyIncome > weeklyExpense) emoji = '💰';
            if (weeklyExpense > (weeklyIncome * 1.5)) emoji = '⚠️';

            const message = `Entradas: ${format(weeklyIncome)} | Saídas: ${format(weeklyExpense)}.\nAbra o app para os detalhes!`;

            try {
                await sendPushNotification(
                    user.fcmToken,
                    `${emoji} Resumo da Semana - WealthCash`,
                    message
                );
                sentCount++;
            } catch (error) {
                console.error(`Falha ao enviar resumo para user ${user.id}:`, error);
                // Optionally clear invalid tokens here
            }
        }

        return NextResponse.json({
            success: true,
            message: `Resumo semanal processado. Enviado para ${sentCount} de ${usersWithPush.length} usuários Premium/Pro elegíveis.`
        });

    } catch (error) {
        console.error('Erro no cron job do resumo semanal:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
