export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list all recurrences for the user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const [recurrences, user] = await Promise.all([
        prisma.recurrence.findMany({
            where: { userId: session.user.id },
            orderBy: { nextDueDate: 'asc' },
        }),
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { preferredCurrency: true }
        })
    ]);

    return NextResponse.json({
        recurrences,
        preferredCurrency: user?.preferredCurrency || 'BRL'
    });
}

// POST — create a recurrence manually or from detection
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];
    const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly', 'annual'];
    const MAX_AMOUNT = 99_999_999;

    try {
        const body = await request.json();
        const { name, category, amount, type, frequency, nextDueDate, icon, color } = body;

        if (!name || !amount || !type || !nextDueDate) {
            return NextResponse.json({ error: 'Campos obrigatórios: name, amount, type, nextDueDate' }, { status: 400 });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > MAX_AMOUNT) {
            return NextResponse.json({ error: 'Valor deve ser entre R$ 0,01 e R$ 99.999.999.' }, { status: 400 });
        }

        if (type !== 'income' && type !== 'expense') {
            return NextResponse.json({ error: 'Tipo deve ser "income" ou "expense".' }, { status: 400 });
        }

        if (frequency && !VALID_FREQUENCIES.includes(frequency)) {
            return NextResponse.json({ error: 'Frequência inválida. Use: daily, weekly, monthly, yearly.' }, { status: 400 });
        }

        const parsedDate = new Date(nextDueDate);
        if (isNaN(parsedDate.getTime())) {
            return NextResponse.json({ error: 'Data inválida.' }, { status: 400 });
        }

        const validCategory = VALID_CATEGORIES.includes(category) ? category : 'Outros';

        const recurrence = await prisma.recurrence.create({
            data: {
                userId: session.user.id,
                name: String(name).slice(0, 100),
                category: validCategory,
                amount: parsedAmount,
                type,
                frequency: (frequency === 'annual' ? 'yearly' : frequency) || 'monthly',
                nextDueDate: parsedDate,
                icon: icon ? String(icon).slice(0, 50) : 'RefreshCcw',
                color: color ? String(color).slice(0, 30) : 'violet',
            },
        });

        return NextResponse.json(recurrence);
    } catch (error) {
        console.error('Error creating recurrence:', error);
        return NextResponse.json({ error: 'Erro ao criar recorrência' }, { status: 500 });
    }
}

// DELETE — deactivate a recurrence
export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    }

    // Verify ownership
    const recurrence = await prisma.recurrence.findUnique({ where: { id } });
    if (!recurrence || recurrence.userId !== session.user.id) {
        return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    await prisma.recurrence.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
