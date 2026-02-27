import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
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

        // Remove sensitive info before exporting
        const { password, stripeCustomerId, stripeSubscriptionId, fcmToken, ...safeUser } = user;

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
