import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { PluggyClient } from 'pluggy-sdk';

// Secret key from Pluggy Dashboard to verify webhook authenticity
const WEBHOOK_SECRET = process.env.PLUGGY_WEBHOOK_SECRET || '';

function verifySignature(payload: string, signature: string | null): boolean {
    if (!WEBHOOK_SECRET || !signature) return false;

    const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    return signature === expectedSignature;
}

export async function POST(req: Request) {
    try {
        const signature = req.headers.get('pluggy-signature');
        const bodyText = await req.text();

        // In production, enforce signature verification to prevent spoofing
        if (process.env.NODE_ENV === 'production' && WEBHOOK_SECRET && !verifySignature(bodyText, signature)) {
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
            case 'transaction/updated':
                console.log('[Pluggy Webhook] Triggering transaction sync worker for Item:', itemId);
                await syncTransactions(itemId);
                break;

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

async function syncTransactions(itemId: string) {
    if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
        console.error("[Pluggy Sync] Missing Pluggy credentials.");
        return;
    }

    try {
        const pluggyItem = await prisma.pluggyItem.findUnique({
            where: { pluggyItemId: itemId }
        });

        if (!pluggyItem) {
            console.error(`[Pluggy Sync] Local PluggyItem not found for ID: ${itemId}`);
            return;
        }

        const client = new PluggyClient({
            clientId: process.env.PLUGGY_CLIENT_ID,
            clientSecret: process.env.PLUGGY_CLIENT_SECRET,
        });

        // Fetch accounts first
        const accountsResponse = await client.fetchAccounts(itemId);

        for (const account of accountsResponse.results) {
            try {
                // Fetch transactions for each account
                const txResponse = await client.fetchTransactions(account.id);
                const transactions = txResponse.results;

                console.log(`[Pluggy Sync] Found ${transactions.length} transactions for account ${account.name}`);

                // Prepare ops for Prisma
                for (const tx of transactions) {
                    // Pluggy uses CREDIT for income, DEBIT for expense
                    const type = tx.type === 'CREDIT' ? 'income' : 'expense';
                    // We need amount to be purely positive since type dictates direction in our DB
                    const amount = Math.abs(tx.amount || 0);

                    if (amount === 0) continue;

                    await prisma.transaction.upsert({
                        where: { pluggyTransactionId: tx.id },
                        update: {
                            name: tx.description || 'Transação',
                            category: tx.category || 'Outros',
                            amount,
                            type,
                            date: new Date(tx.date),
                        },
                        create: {
                            pluggyTransactionId: tx.id,
                            userId: pluggyItem.userId,
                            name: tx.description || 'Transação',
                            category: tx.category || 'Outros',
                            amount,
                            type,
                            date: new Date(tx.date),
                        }
                    });
                }
            } catch (err: any) {
                console.error(`[Pluggy Sync] Error fetching transactions for account ${account.id}:`, err.message);
            }
        }

        // Update the lastSyncAt on the item
        await prisma.pluggyItem.update({
            where: { id: pluggyItem.id },
            data: { lastSyncAt: new Date(), status: 'UPDATED' }
        });

        console.log(`[Pluggy Sync] Finished syncing transactions for Item ${itemId}`);
    } catch (error: any) {
        console.error("[Pluggy Sync Error]:", error.message);
    }
}
