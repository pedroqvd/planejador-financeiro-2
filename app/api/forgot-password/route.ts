import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const email = String(body.email || '').trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
        }

        // Delete any existing tokens for this user
        await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordReset.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // In production: send email with reset link
        // For now: log the token (dev mode)
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log(`\n🔑 Password reset link for ${email}:\n${resetUrl}\n`);

        return NextResponse.json({
            message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.',
            // DEV ONLY — remove in production:
            ...(process.env.NODE_ENV === 'development' ? { resetUrl } : {}),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
