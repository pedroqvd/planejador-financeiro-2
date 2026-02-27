import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        // Devido ao onDelete: Cascade configurado no schema.prisma,
        // excluir o User automaticamente exclui Transactions, Budgets, Goals, etc.
        await prisma.user.delete({
            where: { email: session.user.email },
        });

        return NextResponse.json({ success: true, message: 'Conta apagada com sucesso.' }, { status: 200 });
    } catch (error) {
        console.error('Account Delete Error:', error);
        return NextResponse.json({ error: 'Erro ao excluir conta.' }, { status: 500 });
    }
}
