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

        // If it's a setup call, we use the secret provided in the request
        // If it's a login verification, we'd fetch the secret from the user (omitted for brevity in this MVP step)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { mfaSecret: true, mfaEnabled: true }
        });

        const actualSecret = setup ? secret : user?.mfaSecret;

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
                    mfaEnabled: true
                }
            });

            await logAudit({
                userId: session.user.id,
                action: 'MFA_ENABLED',
                details: 'User successfully enabled MFA'
            });
        } else {
            // Here we would mark the session/JWT as "mfaAuthenticated: true"
            // For now, we'll just log the success
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
