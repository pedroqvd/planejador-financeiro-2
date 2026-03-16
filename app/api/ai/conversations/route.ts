import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Get active conversation (most recent) with messages
    const conversation = await prisma.aIConversation.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                take: 50,
            },
        },
    });

    return NextResponse.json({ conversation });
}
