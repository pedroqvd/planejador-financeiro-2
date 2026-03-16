import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitize } from '@/lib/utils';

const VALID_TYPES = ['income', 'expense'] as const;
const VALID_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];
const MAX_AMOUNT = 99_999_999;

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { messageId } = await request.json();
        if (!messageId) {
            return NextResponse.json({ error: 'ID da mensagem é obrigatório.' }, { status: 400 });
        }

        // Find the message and verify ownership
        const message = await prisma.aIMessage.findUnique({
            where: { id: messageId },
            include: { conversation: { select: { userId: true } } },
        });

        if (!message || message.conversation.userId !== session.user.id) {
            return NextResponse.json({ error: 'Mensagem não encontrada.' }, { status: 404 });
        }

        if (!message.metadata) {
            return NextResponse.json({ error: 'Nenhuma transação pendente nesta mensagem.' }, { status: 400 });
        }

        const { pendingTransaction } = JSON.parse(message.metadata);
        if (!pendingTransaction) {
            return NextResponse.json({ error: 'Nenhuma transação pendente.' }, { status: 400 });
        }

        const { name, category, amount, type } = pendingTransaction;

        // Validate
        const txName = sanitize(String(name || ''), 200);
        const isValid = (
            VALID_CATEGORIES.includes(category) &&
            VALID_TYPES.includes(type as typeof VALID_TYPES[number]) &&
            !isNaN(amount) && amount > 0 && amount <= MAX_AMOUNT
        );

        if (!isValid) {
            return NextResponse.json({ error: 'Dados da transação inválidos.' }, { status: 400 });
        }

        // Create transaction
        await prisma.transaction.create({
            data: {
                name: txName,
                category,
                amount,
                type,
                date: new Date(),
                userId: session.user.id,
            },
        });

        // Update budget if expense
        if (type === 'expense') {
            const month = new Date().toISOString().slice(0, 7);
            await prisma.budget.updateMany({
                where: { userId: session.user.id, category, month },
                data: { spent: { increment: amount } },
            });
        }

        // Clear metadata so it can't be confirmed twice
        await prisma.aIMessage.update({
            where: { id: messageId },
            data: { metadata: null },
        });

        return NextResponse.json({ success: true, message: `Transação de R$ ${amount.toFixed(2)} registrada!` });
    } catch (error) {
        console.error('[AI Confirm] Error:', error);
        return NextResponse.json({ error: 'Erro ao confirmar transação.' }, { status: 500 });
    }
}
