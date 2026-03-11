'use client';

import { useEffect, useState } from 'react';
import { RefreshCcw, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSyncQueue, processSyncQueue } from '@/lib/sync';
import { clsx } from 'clsx';

export function SyncManager() {
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'none'>('none');

    const updateQueueInfo = () => {
        const queue = getSyncQueue();
        setPendingCount(queue.length);
    };

    const handleSync = async () => {
        if (syncing || !navigator.onLine) return;

        const queue = getSyncQueue();
        if (queue.length === 0) return;

        setSyncing(true);
        await processSyncQueue(() => {
            setLastSyncStatus('success');
            setTimeout(() => setLastSyncStatus('none'), 3000);
            // Refresh page data if on dashboard
            if (window.location.pathname === '/') {
                // We could trigger a more elegant refresh, but for now a simple event or reload works
                window.dispatchEvent(new CustomEvent('sync-complete'));
            }
        });
        setSyncing(false);
        updateQueueInfo();
    };

    useEffect(() => {
        updateQueueInfo();

        // Set up polling and listeners
        const interval = setInterval(() => {
            if (!syncing) {
                updateQueueInfo();
                if (navigator.onLine) handleSync();
            }
        }, 10000); // Check every 10s

        window.addEventListener('online', handleSync);
        window.addEventListener('storage', updateQueueInfo); // Listen for changes from other tabs

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleSync);
            window.removeEventListener('storage', updateQueueInfo);
        };
    }, []);

    if (pendingCount === 0 && lastSyncStatus === 'none') return null;

    return (
        <div className="fixed bottom-6 left-6 z-[60]">
            <AnimatePresence>
                {(pendingCount > 0 || lastSyncStatus === 'success') && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className={clsx(
                            "flex items-center space-x-3 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-md",
                            lastSyncStatus === 'success'
                                ? "bg-emerald-500/90 border-emerald-400 text-white"
                                : "bg-zinc-900/90 border-zinc-800 text-zinc-100"
                        )}
                    >
                        {lastSyncStatus === 'success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : syncing ? (
                            <RefreshCcw className="w-4 h-4 animate-spin text-indigo-400" />
                        ) : (
                            <Clock className="w-4 h-4 text-amber-400" />
                        )}

                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                                {lastSyncStatus === 'success' ? 'Sincronizado' : syncing ? 'Sincronizando' : 'Aguardando Conexão'}
                            </span>
                            {pendingCount > 0 && (
                                <span className="text-[9px] opacity-70 leading-tight mt-0.5">
                                    {pendingCount} {pendingCount === 1 ? 'item pendente' : 'itens pendentes'}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
