import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PluggyClient } from 'pluggy-sdk';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure env variables exist to avoid SDK crashes
    if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
        console.error("[Pluggy API] Missing PLUGGY_CLIENT_ID or PLUGGY_CLIENT_SECRET in .env");
        return NextResponse.json(
            { error: 'Configuração do Gateway de Pagamento/Open Finance ausente. Contate o suporte.' },
            { status: 503 }
        );
    }

    try {
        // Initialize the Pluggy Client inside the function
        const pluggy = new PluggyClient({
            clientId: process.env.PLUGGY_CLIENT_ID,
            clientSecret: process.env.PLUGGY_CLIENT_SECRET,
        });

        // We attach the user.id as the `clientUserId` to track this widget session
        const data = await pluggy.createConnectToken(undefined, {
            clientUserId: session.user.id,
            webhookUrl: process.env.PLUGGY_WEBHOOK_URL || undefined, // Optional: useful if setting it dynamically instead of Dashboard
        });

        return NextResponse.json({ accessToken: data.accessToken });
    } catch (error: any) {
        console.error('[Pluggy Token Generation Error]:', error.message || error);
        return NextResponse.json(
            { error: 'Falha ao conectar com o serviço Open Finance' },
            { status: 500 }
        );
    }
}
