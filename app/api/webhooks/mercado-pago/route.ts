import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import crypto from 'crypto';

// MercadoPago sends webhooks when payments succeed or subscriptions are created.
// We configure the MP Client to query the true status of the subscription ID provided in the webhook.

const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

/**
 * Verifies the x-signature header from Mercado Pago webhooks.
 * @see https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#editor_13
 */
function verifyMPSignature(xSignature: string | null, xRequestId: string | null, dataId: string): boolean {
    if (!MP_WEBHOOK_SECRET || !xSignature) return false;

    // Parse the x-signature header: "ts=...,v1=..."
    const parts: Record<string, string> = {};
    xSignature.split(',').forEach(part => {
        const [key, value] = part.split('=', 2);
        if (key && value) parts[key.trim()] = value.trim();
    });

    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;

    // Build the manifest string as documented by MercadoPago
    const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`;

    const expectedHmac = crypto
        .createHmac('sha256', MP_WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    if (v1.length !== expectedHmac.length) return false;
    try {
        return crypto.timingSafeEqual(
            Buffer.from(v1, 'hex'),
            Buffer.from(expectedHmac, 'hex')
        );
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

        // Signature verification (when secret is configured)
        const xSignature = req.headers.get('x-signature');
        const xRequestId = req.headers.get('x-request-id');

        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        const dataId = url.searchParams.get('data.id') || '';
        const type = url.searchParams.get('type');

        // SECURITY: Always require webhook secret. Reject if not configured or signature invalid.
        if (!MP_WEBHOOK_SECRET) {
            console.error('[MercadoPago Webhook] MERCADOPAGO_WEBHOOK_SECRET not configured. Rejecting webhook.');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
        }
        if (!verifyMPSignature(xSignature, xRequestId, dataId)) {
            console.warn('[MercadoPago Webhook] Invalid signature detected.');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const body = await req.json();
        const eventType = type || body.type;

        // Idempotency: skip already-processed events
        const eventId = `mp:${dataId}:${action || eventType}`;
        const existing = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
        if (existing) {
            return NextResponse.json({ received: true, duplicate: true });
        }
        await prisma.webhookEvent.create({ data: { id: eventId, source: 'mercadopago' } });

        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });

        // We only care about subscription events (Preapproval)
        if (eventType === 'subscription_preapproval') {
            const subscriptionId = body.data?.id || dataId;

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
            } else if (subscription && ['cancelled', 'paused', 'suspended'].includes(subscription.status || '')) {
                const userId = subscription.external_reference;
                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { plan: 'free' }
                    });
                    console.log(`[MercadoPago Webhook] User ${userId} subscription ${subscription.status}, downgraded to FREE`);
                }
            }
        }

        // Always return 200 OK to MercadoPago to confirm receipt
        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[MercadoPago Webhook Error]:', error.message || error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
