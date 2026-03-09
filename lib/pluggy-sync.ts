import { prisma } from '@/lib/prisma';
import { PluggyClient } from 'pluggy-sdk';

/**
 * Centralized Pluggy transaction sync worker.
 * Used by both the Pluggy webhook handler and the manual sync triggered by POST /api/pluggy/items.
 */
export async function syncPluggyTransactions(
    itemId: string,
    userId: string,
    client?: PluggyClient
) {
    if (!client) {
        if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
            console.error('[Pluggy Sync] Missing Pluggy credentials.');
            return;
        }
        client = new PluggyClient({
            clientId: process.env.PLUGGY_CLIENT_ID,
            clientSecret: process.env.PLUGGY_CLIENT_SECRET,
        });
    }

    try {
        console.log(`[Pluggy Sync] Starting sync for item ${itemId}`);
        const accountsResponse = await client.fetchAccounts(itemId);

        for (const account of accountsResponse.results) {
            try {
                const txResponse = await client.fetchTransactions(account.id);
                const transactions = txResponse.results;
                console.log(`[Pluggy Sync] Found ${transactions.length} transactions for account ${account.name}`);

                // Batch upserts inside a single transaction to avoid N+1 round-trips
                const upsertOps = transactions
                    .filter(tx => Math.abs(tx.amount || 0) > 0)
                    .map(tx => {
                        const type = tx.type === 'CREDIT' ? 'income' : 'expense';
                        const amount = Math.abs(tx.amount || 0);
                        return prisma.transaction.upsert({
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
                                userId,
                                name: tx.description || 'Transação',
                                category: tx.category || 'Outros',
                                amount,
                                type,
                                date: new Date(tx.date),
                            }
                        });
                    });

                if (upsertOps.length > 0) {
                    await prisma.$transaction(upsertOps);
                }
            } catch (err: any) {
                console.error(`[Pluggy Sync] Error fetching transactions for account ${account.id}:`, err.message);
            }
        }

        await prisma.pluggyItem.update({
            where: { pluggyItemId: itemId },
            data: { lastSyncAt: new Date(), status: 'UPDATED' }
        });

        console.log(`[Pluggy Sync] Finished syncing transactions for Item ${itemId}`);
    } catch (error: any) {
        console.error('[Pluggy Sync Error]:', error.message);
        try {
            await prisma.pluggyItem.update({
                where: { pluggyItemId: itemId },
                data: { status: 'UPDATED', error: 'Falha leve ao sincronizar.' }
            });
        } catch { /* item may not exist yet */ }
    }
}
