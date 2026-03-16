import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { BILLING_CYCLES, type BillingCycleKey } from '@/lib/plans';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { billingCycle } = await req.json();

        if (!billingCycle || !BILLING_CYCLES[billingCycle as BillingCycleKey]) {
            return NextResponse.json({ error: 'Ciclo de cobrança inválido' }, { status: 400 });
        }

        if (!session.user.email) {
            return NextResponse.json({ error: 'Email do usuário é obrigatório para checkout.' }, { status: 400 });
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error("[MercadoPago API] Missing MERCADOPAGO_ACCESS_TOKEN");
            return NextResponse.json(
                { error: 'Gateway de Pagamento não configurado. Contate o suporte.' },
                { status: 503 }
            );
        }

        const cycle = BILLING_CYCLES[billingCycle as BillingCycleKey];
        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
        const preApproval = new PreApproval(client);

        const now = new Date();
        now.setHours(now.getHours() + 1);

        const baseDomain = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // For semiannual/annual, we charge the total upfront per cycle
        const transactionAmount = billingCycle === 'monthly'
            ? cycle.price
            : (cycle as any).totalPrice || cycle.price;

        const subscriptionData = {
            reason: `WealthCash ${cycle.label}`,
            external_reference: `${session.user.id}:${billingCycle}`,
            payer_email: session.user.email!,
            auto_recurring: {
                frequency: cycle.frequency,
                frequency_type: cycle.frequencyType,
                transaction_amount: transactionAmount,
                currency_id: 'BRL',
            },
            back_url: `${baseDomain}/settings?success=true`,
            status: 'pending',
        };

        const response = await preApproval.create({ body: subscriptionData });

        return NextResponse.json({ url: response.init_point });
    } catch (error: any) {
        console.error('[MercadoPago Checkout Error]:', error.message || error);
        return NextResponse.json(
            { error: 'Falha ao processar checkout' },
            { status: 500 }
        );
    }
}
