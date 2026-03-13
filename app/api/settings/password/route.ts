import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authRatelimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Stricter rate limit for password changes (5 per 15min)
    try {
        const { success } = await authRatelimit.limit(`pwd:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const { currentPassword, newPassword } = body;

        if (!currentPassword || typeof currentPassword !== 'string') {
            return NextResponse.json({ error: 'Senha atual é obrigatória.' }, { status: 400 });
        }

        if (!newPassword || typeof newPassword !== 'string') {
            return NextResponse.json({ error: 'Nova senha é obrigatória.' }, { status: 400 });
        }

        if (newPassword.length < 8 || newPassword.length > 128) {
            return NextResponse.json({ error: 'Nova senha deve ter entre 8 e 128 caracteres.' }, { status: 400 });
        }

        if (currentPassword === newPassword) {
            return NextResponse.json({ error: 'Nova senha deve ser diferente da atual.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 403 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        await logAudit({
            userId: session.user.id,
            action: 'PASSWORD_CHANGED',
            details: 'User changed their password',
        });

        return NextResponse.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
