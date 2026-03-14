import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`audit:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const logs = await prisma.auditLog.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 });
    }
}
