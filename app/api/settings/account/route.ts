import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authRatelimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // SECURITY: Rate limit account deletion attempts
    try {
        const { success } = await authRatelimit.limit(`delete-account:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        // SECURITY: Require password confirmation for account deletion
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Senha de confirmação é obrigatória.' }, { status: 400 }); }

        const { password } = body;
        if (!password || typeof password !== 'string') {
            return NextResponse.json({ error: 'Senha de confirmação é obrigatória.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true, email: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Senha incorreta.' }, { status: 403 });
        }

        // Audit log before deletion
        await logAudit({
            userId: session.user.id,
            action: 'ACCOUNT_DELETED',
            details: `User ${user.email} deleted their account`
        });

        // Devido ao onDelete: Cascade configurado no schema.prisma,
        // excluir o User automaticamente exclui Transactions, Budgets, Goals, etc.
        await prisma.user.delete({
            where: { id: session.user.id },
        });

        return NextResponse.json({ success: true, message: 'Conta apagada com sucesso.' }, { status: 200 });
    } catch (error) {
        console.error('Account Delete Error:', error);
        return NextResponse.json({ error: 'Erro ao excluir conta.' }, { status: 500 });
    }
}
