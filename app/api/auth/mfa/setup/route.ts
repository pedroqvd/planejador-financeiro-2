import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMfaSecret, generateMfaUri, generateQrCodeDataUrl } from '@/lib/mfa';

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const secret = generateMfaSecret();
        const uri = generateMfaUri(session.user.email!, secret);
        const qrCode = await generateQrCodeDataUrl(uri);

        // Store the pending secret server-side instead of returning it to the client
        await prisma.user.update({
            where: { id: session.user.id },
            data: { mfaPendingSecret: secret },
        });

        // Only return the QR code — the secret stays on the server
        return NextResponse.json({ qrCode });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar MFA' }, { status: 500 });
    }
}
