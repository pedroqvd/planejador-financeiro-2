import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { plan: 'pro' }
        });

        return NextResponse.json({ success: true, message: 'Plano atualizado para Pro com sucesso!' });
    } catch (error) {
        console.error('Upgrade error:', error);
        return NextResponse.json({ error: 'Erro ao processar assinatura.' }, { status: 500 });
    }
}
