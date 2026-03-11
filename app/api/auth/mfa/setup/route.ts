import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMfaSecret, generateMfaUri, generateQrCodeDataUrl } from '@/lib/mfa';
import { logAudit } from '@/lib/audit';

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const secret = generateMfaSecret();
        const uri = generateMfaUri(session.user.email!, secret);
        const qrCode = await generateQrCodeDataUrl(uri);

        // We don't save to DB yet, we only return it for the user to scan.
        // We'll save it only after successful verification of the first code.
        return NextResponse.json({ secret, qrCode });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar MFA' }, { status: 500 });
    }
}
