import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';
import { ratelimit } from '@/lib/rate-limit';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`notif:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const userId = session.user.id;

        // Fetch user to get FCM token
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmToken: true }
        });

        const fcmToken = user?.fcmToken;

        // 1. Generate smart notifications dynamically if we haven't generated them today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingToday = await prisma.notification.findFirst({
            where: { userId, createdAt: { gte: startOfDay } }
        });

        if (!existingToday) {
            const now = new Date();
            const currentMonth = now.toISOString().slice(0, 7);

            // Generate Budget alerts
            const budgets = await prisma.budget.findMany({ where: { userId, month: currentMonth } });
            for (const b of budgets) {
                const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                let title = '';
                let message = '';
                let type = '';

                if (pct >= 100) {
                    title = 'Orçamento estourado';
                    message = `Você ultrapassou o limite de ${b.category}.`;
                    type = 'warning';
                } else if (pct >= 80) {
                    title = 'Orçamento no limite';
                    message = `${b.category}: ${pct.toFixed(0)}% utilizado.`;
                    type = 'info';
                }

                if (title) {
                    await prisma.notification.create({
                        data: { userId, title, message, type }
                    });

                    // Send Real Push if token exists
                    if (fcmToken) {
                        await sendPushNotification(fcmToken, title, message);
                    }
                }
            }

            // Generate Goals alerts
            const goals = await prisma.goal.findMany({ where: { userId } });
            for (const g of goals) {
                const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
                let title = '';
                let message = '';
                let type = '';

                if (pct >= 100) {
                    title = 'Meta atingida! 🎉';
                    message = `Você completou a meta "${g.name}"!`;
                    type = 'success';
                } else if (pct >= 75) {
                    title = 'Meta quase lá';
                    message = `"${g.name}": ${pct.toFixed(0)}% concluída.`;
                    type = 'info';
                }

                if (title) {
                    await prisma.notification.create({
                        data: { userId, title, message, type }
                    });

                    // Send Real Push if token exists
                    if (fcmToken) {
                        await sendPushNotification(fcmToken, title, message);
                    }
                }
            }
        }

        // 2. Fetch all unread notifications
        const notifications = await prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Map them to the UI format
        const formatted = notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(n.createdAt)
        }));

        return NextResponse.json({ notifications: formatted });
    } catch (error) {
        console.error('Notifications error:', error);
        return NextResponse.json({ notifications: [] });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { userId: session.user.id, read: false },
                data: { read: true }
            });
        } else if (id) {
            // IDOR fix: use updateMany with userId filter instead of update with PK only
            await prisma.notification.updateMany({
                where: { id, userId: session.user.id },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notification read error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
