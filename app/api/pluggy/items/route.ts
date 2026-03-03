import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PluggyClient } from 'pluggy-sdk';

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

        // Initialize Pluggy Client to delete from upstream
        if (process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET) {
            const client = new PluggyClient({
                clientId: process.env.PLUGGY_CLIENT_ID,
                clientSecret: process.env.PLUGGY_CLIENT_SECRET,
            });
            try {
                await client.deleteItem(itemId);
            } catch (pluggyErr: any) {
                console.error("[Pluggy upstream delete error]:", pluggyErr.message);
                // We proceed to delete locally anyway
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
