import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authRatelimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
    // SECURITY: Rate limit password reset attempts
    try {
        const ip = getClientIp(request);
        const { success } = await authRatelimit.limit(`reset:${ip}`);
        if (!success) {
            return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429 });
        }
    } catch { /* dev fallback */ }

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const token = String(body.token || '').trim();
        const password = String(body.password || '');

        if (!token) {
            return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
        }

        if (password.length < 8 || password.length > 128) {
            return NextResponse.json({ error: 'A senha deve ter entre 8 e 128 caracteres.' }, { status: 400 });
        }

        // Find valid token
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: { select: { id: true } } },
        });

        if (!resetRecord) {
            return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
        }

        if (new Date() > resetRecord.expiresAt) {
            await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
            return NextResponse.json({ error: 'Token expirado. Solicite um novo.' }, { status: 400 });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: resetRecord.user.id },
            data: { password: hashedPassword },
        });

        // Delete the used token
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } });

        return NextResponse.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
