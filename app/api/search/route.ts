import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 100);

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            userId: session.user.id,
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
            ],
        },
        orderBy: { date: 'desc' },
        take: 8,
        select: { id: true, name: true, category: true, amount: true, type: true, date: true },
    });

    // Static pages for navigation
    const pages = [
        { name: 'Dashboard', path: '/' },
        { name: 'Transações', path: '/transactions' },
        { name: 'Orçamento', path: '/budget' },
        { name: 'Metas', path: '/goals' },
        { name: 'Investimentos', path: '/investments' },
        { name: 'IA Advisor', path: '/ai' },
        { name: 'Configurações', path: '/settings' },
    ].filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

    return NextResponse.json({ transactions, pages });
}
