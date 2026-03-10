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

        const failedAccounts: string[] = [];
        let totalSynced = 0;

        for (const account of accountsResponse.results) {
            try {
                const txResponse = await client.fetchTransactions(account.id);
                const transactions = txResponse.results;
                console.log(`[Pluggy Sync] Found ${transactions.length} transactions for account ${account.name}`);

                const upsertOps = transactions
                    .filter(tx => Math.abs(tx.amount || 0) > 0)
                    .map(tx => {
                        const type = tx.type === 'CREDIT' ? 'income' : 'expense';
                        const amount = Math.abs(tx.amount || 0);
                        const paymentMethod = account.type === 'CREDIT' ? 'credit_card' : 'account';

                        return prisma.transaction.upsert({
                            where: { pluggyTransactionId: tx.id },
                            update: {
                                name: tx.description || 'Transação',
                                category: tx.category || 'Outros',
                                amount,
                                type,
                                paymentMethod,
                                date: new Date(tx.date),
                            },
                            create: {
                                pluggyTransactionId: tx.id,
                                userId,
                                name: tx.description || 'Transação',
                                category: tx.category || 'Outros',
                                amount,
                                type,
                                paymentMethod,
                                installments: 1,
                                date: new Date(tx.date),
                            }
                        });
                    });

                if (upsertOps.length > 0) {
                    await prisma.$transaction(upsertOps);
                }
                totalSynced += transactions.length;
            } catch (err: any) {
                const accountLabel = account.name || account.id;
                console.error(`[Pluggy Sync] Error fetching transactions for account "${accountLabel}":`, err.message);
                failedAccounts.push(accountLabel);
            }
        }

        // Build a descriptive error message if some accounts failed, otherwise clear the error
        const errorMsg = failedAccounts.length > 0
            ? `Não foi possível sincronizar: ${failedAccounts.join(', ')}`
            : null;

        await prisma.pluggyItem.update({
            where: { pluggyItemId: itemId },
            data: {
                lastSyncAt: new Date(),
                status: 'UPDATED',
                error: errorMsg, // null clears the error field
            }
        });

        console.log(`[Pluggy Sync] Finished. Synced ${totalSynced} transactions. Failed accounts: ${failedAccounts.length}`);
    } catch (error: any) {
        console.error('[Pluggy Sync Error]:', error.message);
        try {
            await prisma.pluggyItem.update({
                where: { pluggyItemId: itemId },
                data: { status: 'UPDATED', error: `Erro ao sincronizar: ${error.message?.slice(0, 80) || 'desconhecido'}` }
            });
        } catch { /* item may not exist yet */ }
    }
}
