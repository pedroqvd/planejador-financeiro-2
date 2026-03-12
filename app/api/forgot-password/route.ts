import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { authRatelimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
    // Rate limit: 5 requests per 15 minutes per IP
    try {
        const ip = getClientIp(request);
        const { success } = await authRatelimit.limit(`forgot:${ip}`);
        if (!success) {
            return NextResponse.json(
                { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' },
                { status: 200 } // Always 200 to prevent enumeration
            );
        }
    } catch { /* dev fallback */ }

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

        // Build reset link (for email sending in the future)
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        // Only log in development — NEVER in production
        if (process.env.NODE_ENV === 'development') {
            console.log(`\n🔑 [DEV] Password reset link for ${email}:\n${resetUrl}\n`);
        }

        // TODO: Integrate email service (Resend, SendGrid, etc.) for production

        return NextResponse.json({
            message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.',
            // DEV ONLY:
            ...(process.env.NODE_ENV === 'development' ? { resetUrl } : {}),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
