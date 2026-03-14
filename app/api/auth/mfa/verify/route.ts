import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyMfaToken } from '@/lib/mfa';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { token, secret, setup } = await req.json();

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { mfaSecret: true, mfaEnabled: true, mfaPendingSecret: true }
        });

        // For setup: use server-stored pending secret (never trust client-provided secret)
        const actualSecret = setup ? user?.mfaPendingSecret : user?.mfaSecret;

        if (!actualSecret) {
            return NextResponse.json({ error: 'Configuração de MFA não encontrada.' }, { status: 400 });
        }

        const isValid = await verifyMfaToken(token, actualSecret);

        if (!isValid) {
            await logAudit({
                userId: session.user.id,
                action: 'MFA_VERIFY_FAILURE',
                details: setup ? 'Failed setup attempt' : 'Failed login attempt'
            });
            return NextResponse.json({ error: 'Código inválido.' }, { status: 400 });
        }

        if (setup) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    mfaSecret: actualSecret,
                    mfaEnabled: true,
                    mfaVerifiedAt: new Date(),
                    mfaPendingSecret: null, // Clear pending secret after successful setup
                }
            });

            await logAudit({
                userId: session.user.id,
                action: 'MFA_ENABLED',
                details: 'User successfully enabled MFA'
            });
        } else {
            // Mark MFA as verified for this session
            await prisma.user.update({
                where: { id: session.user.id },
                data: { mfaVerifiedAt: new Date() },
            });

            await logAudit({
                userId: session.user.id,
                action: 'MFA_VERIFY_SUCCESS'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao verificar MFA' }, { status: 500 });
    }
}
