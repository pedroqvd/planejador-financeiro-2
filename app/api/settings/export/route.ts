import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authRatelimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // SECURITY: Strict rate limit on data export (3 per 15 min) to prevent exfiltration
    try {
        const { success } = await authRatelimit.limit(`export:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Limite de exportações atingido. Aguarde 15 minutos.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                transactions: true,
                budgets: true,
                goals: true,
                investments: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Audit log for data export
        await logAudit({
            userId: session.user.id,
            action: 'DATA_EXPORTED',
            details: 'User exported their personal data',
        });

        // Remove sensitive info before exporting
        const { password, mercadoPagoId, mercadoPagoSubscriptionId, fcmToken, mfaSecret, ...safeUser } = user as any;

        const dataDump = {
            exportDate: new Date().toISOString(),
            app: 'WealthCash',
            data: safeUser,
        };

        // Create response with proper headers for file download
        const response = new NextResponse(JSON.stringify(dataDump, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="wealthcash-export-${new Date().toISOString().split('T')[0]}.json"`,
            },
        });

        return response;
    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Erro ao exportar dados.' }, { status: 500 });
    }
}
