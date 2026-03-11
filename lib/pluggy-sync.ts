import { prisma } from '@/lib/prisma';
import { PluggyClient } from 'pluggy-sdk';
import { categorizeTransactionsBatch } from '@/lib/ai-categorizer';

/**
 * Centralized Pluggy transaction sync worker.
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
                // Fetch history
                const from = new Date();
                from.setDate(from.getDate() - 365);
                const fromStr = from.toISOString().split('T')[0];

                const txResponse = await client.fetchTransactions(account.id, { from: fromStr });
                const transactions = txResponse.results.filter(tx => Math.abs(tx.amount || 0) > 0);

                console.log(`[Pluggy Sync] Found ${transactions.length} valid transactions for account ${account.name}`);

                if (transactions.length === 0) continue;

                // 1. Identify which transactions are truly NEW by checking existing IDs
                const existingTxIds = await prisma.transaction.findMany({
                    where: {
                        pluggyTransactionId: { in: transactions.map(t => t.id) }
                    },
                    select: { pluggyTransactionId: true }
                }).then(res => new Set(res.map(r => r.pluggyTransactionId)));

                const newTransactions = transactions.filter(t => !existingTxIds.has(t.id));
                console.log(`[Pluggy Sync] ${newTransactions.length} items are new and need AI categorization.`);

                // 2. Categorize new transactions in batches (AI is expensive, let's be smart)
                let aiCategories: Record<string, string> = {};
                if (newTransactions.length > 0) {
                    // Collect names for batch categorization
                    const toCategorize = newTransactions.map(t => ({ id: t.id, name: t.description || 'Transação' }));
                    // Categorize in chunks if necessary (batch helper handles usual limits)
                    aiCategories = await categorizeTransactionsBatch(toCategorize);
                }

                // 3. Prepare upsert operations
                const upsertOps = transactions.map(tx => {
                    const type = tx.type === 'CREDIT' ? 'income' : 'expense';
                    const amount = Math.abs(tx.amount || 0);
                    const paymentMethod = account.type === 'CREDIT' ? 'credit_card' : 'account';

                    // Use AI category for new items, or fallback to Pluggy's / existing
                    const category = aiCategories[tx.id] || tx.category || 'Outros';

                    return prisma.transaction.upsert({
                        where: { pluggyTransactionId: tx.id },
                        update: {
                            name: tx.description || 'Transação',
                            amount,
                            type,
                            paymentMethod,
                            date: new Date(tx.date),
                            // We don't overwrite category on update to preserve manual user changes
                        },
                        create: {
                            pluggyTransactionId: tx.id,
                            userId,
                            name: tx.description || 'Transação',
                            category,
                            amount,
                            type,
                            paymentMethod,
                            installments: 1,
                            date: new Date(tx.date),
                        }
                    });
                });

                if (upsertOps.length > 0) {
                    // Process in chunks to avoid large transaction limits
                    for (let i = 0; i < upsertOps.length; i += 50) {
                        await prisma.$transaction(upsertOps.slice(i, i + 50));
                    }
                }

                totalSynced += transactions.length;
            } catch (err: any) {
                const accountLabel = account.name || account.id;
                console.error(`[Pluggy Sync] Error processing account "${accountLabel}":`, err.message);
                failedAccounts.push(accountLabel);
            }
        }

        await prisma.pluggyItem.update({
            where: { pluggyItemId: itemId },
            data: {
                lastSyncAt: new Date(),
                status: 'UPDATED',
                error: failedAccounts.length > 0 ? `Erro em: ${failedAccounts.join(', ')}` : null,
            }
        });

        console.log(`[Pluggy Sync] Finished. Synced ${totalSynced} items.`);
    } catch (error: any) {
        console.error('[Pluggy Sync Critical Error]:', error.message);
        await prisma.pluggyItem.update({
            where: { pluggyItemId: itemId },
            data: { status: 'UPDATED', error: `Erro Fatal: ${error.message?.slice(0, 50)}` }
        }).catch(() => { });
    }
}
