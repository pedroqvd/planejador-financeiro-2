import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PluggyClient } from 'pluggy-sdk';
import { syncPluggyTransactions } from '@/lib/pluggy-sync';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const items = await prisma.pluggyItem.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ items });
    } catch (error: any) {
        console.error('[Pluggy Items Fetch Error]:', error);
        return NextResponse.json({ error: 'Erro ao buscar conexões' }, { status: 500 });
    }
}

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

        if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
            return NextResponse.json({ error: 'Missing Pluggy credentials' }, { status: 500 });
        }

        const client = new PluggyClient({
            clientId: process.env.PLUGGY_CLIENT_ID,
            clientSecret: process.env.PLUGGY_CLIENT_SECRET,
        });

        // Verify the item with Pluggy
        let itemData;
        try {
            itemData = await client.fetchItem(itemId);
        } catch (e: any) {
            console.error("[Pluggy Fetch Item Error]:", e.message);
            return NextResponse.json({ error: 'Item not found in Pluggy' }, { status: 404 });
        }

        // Make sure it belongs to the user
        if (itemData.clientUserId !== session.user.id) {
            return NextResponse.json({ error: 'Item does not belong to standard user' }, { status: 403 });
        }

        // Save to Database immediately (Webhook fallback)
        const savedItem = await prisma.pluggyItem.upsert({
            where: { pluggyItemId: itemId },
            update: {
                status: 'UPDATING', // Start as updating since we will fetch txs now
                connectorName: itemData.connector?.name || 'Unknown Bank',
            },
            create: {
                pluggyItemId: itemId,
                userId: session.user.id,
                connectorId: itemData.connector?.id || 0,
                connectorName: itemData.connector?.name || 'Unknown Bank',
                status: 'UPDATING',
            }
        });

        // Trigger manual sync in background (fire and forget to not block UI)
        syncPluggyTransactions(itemId, session.user.id, client).catch(console.error);

        return NextResponse.json({ success: true, item: savedItem });
    } catch (error: any) {
        console.error('[Pluggy Items POST Error]:', error);
        return NextResponse.json({ error: 'Erro ao salvar conexão' }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const pluggyItem = await prisma.pluggyItem.findFirst({
            where: { pluggyItemId: itemId, userId: session.user.id }
        });

        if (!pluggyItem) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        if (process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET) {
            const client = new PluggyClient({
                clientId: process.env.PLUGGY_CLIENT_ID,
                clientSecret: process.env.PLUGGY_CLIENT_SECRET,
            });
            try {
                await client.deleteItem(itemId);
            } catch (pluggyErr: any) {
                console.error("[Pluggy upstream delete error]:", pluggyErr.message);
            }
        }

        await prisma.pluggyItem.delete({
            where: { id: pluggyItem.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Pluggy Items Delete Error]:', error);
        return NextResponse.json({ error: 'Erro ao deletar conexão' }, { status: 500 });
    }
}
