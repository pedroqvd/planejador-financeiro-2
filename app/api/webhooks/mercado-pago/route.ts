import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// MercadoPago sends webhooks when payments succeed or subscriptions are created.
// We configure the MP Client to query the true status of the subscription ID provided in the webhook.
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        const type = url.searchParams.get('type') || (await req.clone().json()).type;
        const body = await req.json();

        console.log(`[MercadoPago Webhook] Received action: ${action}, type: ${type}`);

        // We only care about subscription events (Preapproval)
        if (type === 'subscription_preapproval') {
            const subscriptionId = body.data?.id;

            if (!subscriptionId) {
                return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 });
            }

            // Verify the subscription actually exists and is paid in MP servers to prevent spoofing
            const preApproval = new PreApproval(client);
            const subscription = await preApproval.get({ id: subscriptionId });

            if (subscription && subscription.status === 'authorized') {
                const userId = subscription.external_reference; // This is the user.id we passed in checkout
                const reason = subscription.reason || ''; // E.g., "WealthCash PRO"

                let plan = 'free';
                if (reason.toUpperCase().includes('PRO')) plan = 'pro';
                if (reason.toUpperCase().includes('PREMIUM')) plan = 'premium';

                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan: plan,
                            mercadoPagoSubscriptionId: subscriptionId,
                        }
                    });
                    console.log(`[MercadoPago Webhook] User ${userId} upgraded to ${plan.toUpperCase()}`);
                }
            } else if (subscription && subscription.status === 'cancelled') {
                const userId = subscription.external_reference;
                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { plan: 'free' } // Downgraded
                    });
                    console.log(`[MercadoPago Webhook] User ${userId} subscription cancelled, downgraded to FREE`);
                }
            }
        }

        // Always return 200 OM to MercadoPago to confirm receipt
        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[MercadoPago Webhook Error]:', error.message || error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
