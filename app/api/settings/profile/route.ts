import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`profile:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const { name, preferredCurrency } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
        }

        if (name.length > 100) {
            return NextResponse.json({ error: 'Nome deve ter no máximo 100 caracteres.' }, { status: 400 });
        }

        const sanitized = name.replace(/[<>&"'/\\]/g, '').trim();

        if (sanitized.length < 2) {
            return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres.' }, { status: 400 });
        }

        const dataToUpdate: any = { name: sanitized };

        if (preferredCurrency && ['BRL', 'USD', 'EUR', 'GBP', 'CAD'].includes(preferredCurrency)) {
            dataToUpdate.preferredCurrency = preferredCurrency;
        }

        // @ts-ignore
        await prisma.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
        });

        return NextResponse.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
