import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// In production, you would fetch these from a database or use MercadoPago PreApprovalPlan API
const PLAN_PRICES = {
    pro: 14.90,
    premium: 29.90,
};

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await req.json();

        if (planId !== 'pro' && planId !== 'premium') {
            return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error("[MercadoPago API] Missing MERCADOPAGO_ACCESS_TOKEN");
            return NextResponse.json(
                { error: 'Gateway de Pagamento não configurado. Contate o suporte.' },
                { status: 503 }
            );
        }

        // Initialize the SDK
        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
        const preApproval = new PreApproval(client);

        // Calculate dynamic dates for the subscription
        const now = new Date();
        // Start date must be in ISO 8601 format and offset to future to allow processing
        // Let's add 1 hour
        now.setHours(now.getHours() + 1);

        // In a real scenario, you'd create a PreApprovalPlan first and just subscribe the user to it, 
        // but the generic PreApproval endpoint allows creating ad-hoc subscriptions:
        const baseDomain = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // We attach our internal userId as the external_reference so the webhook knows who paid
        const subscriptionData = {
            reason: `WealthCash ${planId.toUpperCase()}`,
            external_reference: session.user.id,
            payer_email: session.user.email || 'test_user@testuser.com', // Must be an email, ideally from session
            auto_recurring: {
                frequency: 1,
                frequency_type: 'months',
                transaction_amount: PLAN_PRICES[planId as 'pro' | 'premium'],
                currency_id: 'BRL',
            },
            back_url: `${baseDomain}/settings?success=true`,
            status: 'pending' // will activate when they pay
        };

        const response = await preApproval.create({ body: subscriptionData });

        // The init_point is the URL where the user will securely pay on MercadoPago's servers
        return NextResponse.json({ url: response.init_point });
    } catch (error: any) {
        console.error('[MercadoPago Checkout Error]:', error.message || error);
        return NextResponse.json(
            { error: 'Falha ao processar checkout' },
            { status: 500 }
        );
    }
}
