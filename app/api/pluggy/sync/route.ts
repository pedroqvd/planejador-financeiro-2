import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncPluggyTransactions } from '@/lib/pluggy-sync';

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { itemId } = await req.json();

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const pluggyItem = await prisma.pluggyItem.findUnique({
            where: { pluggyItemId: itemId }
        });

        if (!pluggyItem || pluggyItem.userId !== session.user.id) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        // Trigger manual sync and wait for it
        await prisma.pluggyItem.update({
            where: { pluggyItemId: itemId },
            data: { status: 'UPDATING' }
        });

        await syncPluggyTransactions(itemId, session.user.id);

        return NextResponse.json({ success: true, message: 'Sync complete' });

    } catch (error: any) {
        console.error('[Manual Sync Error]:', error);

        // Revert status to error if something failed
        const { itemId } = await req.json().catch(() => ({ itemId: null }));
        if (itemId) {
            await prisma.pluggyItem.update({
                where: { pluggyItemId: itemId },
                data: { status: 'ERROR', error: error.message }
            }).catch(() => { });
        }

        return NextResponse.json({ error: 'Erro ao sincronizar manualmente' }, { status: 500 });
    }
}
