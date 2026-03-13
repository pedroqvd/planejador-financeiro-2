import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { token } = await request.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'FCM Token inválido.' }, { status: 400 });
        }

        // SECURITY: Validate FCM token format (Firebase tokens are long alphanumeric strings with hyphens/underscores)
        if (token.length < 100 || token.length > 512 || !/^[A-Za-z0-9\-_:]+$/.test(token)) {
            return NextResponse.json({ error: 'FCM Token inválido.' }, { status: 400 });
        }

        // Salvar token no banco
        await prisma.user.update({
            where: { id: session.user.id },
            data: { fcmToken: token }
        });

        return NextResponse.json({ success: true, message: 'FCM Token registrado com sucesso.' });
    } catch (error) {
        console.error('Update FCM Token Error:', error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}
