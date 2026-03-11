import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    
    // Protection: only Pro/Premium users (or a specific 'admin' role if it existed) can view logs
    // For this MVP, we'll allow the user to view their own logs as a security transparency feature
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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
