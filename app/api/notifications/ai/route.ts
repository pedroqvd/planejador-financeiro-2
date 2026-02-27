import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 }); }

        const { title, message, type } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 });
        }

        const notification = await (prisma as any).notification.create({
            data: {
                title: String(title).slice(0, 100),
                message: String(message).slice(0, 500),
                type: ['info', 'warning', 'success'].includes(type) ? type : 'info',
                userId: session.user.id,
                read: false,
            }
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (err) {
        console.error('Save AI Notification err:', err);
        return NextResponse.json({ error: 'Erro ao salvar notificação da IA.' }, { status: 500 });
    }
}
