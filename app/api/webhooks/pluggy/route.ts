import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { syncPluggyTransactions } from '@/lib/pluggy-sync';

// Secret key from Pluggy Dashboard to verify webhook authenticity
const WEBHOOK_SECRET = process.env.PLUGGY_WEBHOOK_SECRET || '';

function verifySignature(payload: string, signature: string | null): boolean {
    if (!WEBHOOK_SECRET || !signature) return false;

    const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    if (signature.length !== expectedSignature.length) return false;
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}

export async function POST(req: Request) {
    try {
        const signature = req.headers.get('pluggy-signature');
        const bodyText = await req.text();

        // Enforce signature verification when WEBHOOK_SECRET is configured
        // This prevents spoofed webhooks in ALL environments (not just production)
        if (WEBHOOK_SECRET && !verifySignature(bodyText, signature)) {
            console.warn('[Pluggy Webhook] Invalid signature detected.');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(bodyText);
        const { event, id, itemId } = payload;

        console.log(`[Pluggy Webhook] Received event: ${event} for Item: ${itemId || id}`);

        switch (event) {
            case 'item/created':
            case 'item/updated':
            case 'item/waiting_user_input':
            case 'item/login_error':
                // The webhook payload contains the item state
                await handleItemUpdate(payload);
                break;

            case 'transactions/sync':
            case 'transaction/created':
            case 'transaction/updated': {
                console.log('[Pluggy Webhook] Triggering transaction sync worker for Item:', itemId);
                // Look up the userId from the stored item
                const storedItem = await prisma.pluggyItem.findUnique({ where: { pluggyItemId: itemId } });
                if (storedItem) {
                    await syncPluggyTransactions(itemId, storedItem.userId);
                } else {
                    console.warn(`[Pluggy Webhook] No stored item for ${itemId}, cannot sync.`);
                }
                break;
            }

            case 'item/deleted':
                // User revoked access or item was deleted from Pluggy dashboard
                if (itemId) {
                    await prisma.pluggyItem.deleteMany({
                        where: { pluggyItemId: itemId }
                    });
                }
                break;

            default:
                console.log('[Pluggy Webhook] Unhandled event type:', event);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[Pluggy Webhook Error]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function handleItemUpdate(payload: any) {
    const { event, id: itemId, data } = payload;

    if (!data || !data.user || !data.user.clientUserId) {
        console.warn('[Pluggy Webhook] Missing clientUserId in payload. Cannot map to local user.');
        return;
    }

    const clientUserId = data.user.clientUserId; // This is the user.id we passed when creating the Connect Token

    // Clean up Pluggy's status format
    let status = "UPDATED";
    if (event === 'item/waiting_user_input') status = "WAITING_USER_INPUT";
    if (event === 'item/login_error') status = "LOGIN_ERROR";
    if (event === 'item/created') status = "UPDATING";

    // Upsert the item in our database
    await prisma.pluggyItem.upsert({
        where: { pluggyItemId: itemId },
        update: {
            status,
            error: data.error?.message || null,
        },
        create: {
            pluggyItemId: itemId,
            userId: clientUserId,
            connectorId: data.connector?.id || 0,
            connectorName: data.connector?.name || 'Unknown Bank',
            status,
        }
    });

    console.log(`[Pluggy Webhook] Item ${itemId} mapped to user ${clientUserId}. Status: ${status}`);
}

