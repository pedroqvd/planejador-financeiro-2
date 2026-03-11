'use client';

import { useState, useEffect } from 'react';
import { RefreshCcw, Landmark, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface PluggyItem {
    id: string;
    connectorName: string | null;
    status: string;
    lastSyncAt: string | null;
    error: string | null;
}

export function SyncStatus() {
    const [items, setItems] = useState<PluggyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/pluggy/items');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch (err) {
            console.error('Error fetching sync status', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for sync-complete to refresh status
        window.addEventListener('sync-complete', fetchData);
        return () => window.removeEventListener('sync-complete', fetchData);
    }, []);

    const handleSyncAll = async () => {
        if (syncing) return;
        setSyncing(true);

        try {
            // Sync each item
            for (const item of items) {
                await fetch('/api/pluggy/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId: item.id })
                });
            }
            fetchData();
            window.dispatchEvent(new CustomEvent('sync-complete'));
        } catch (err) {
            console.error('Sync failed', err);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return null;
    if (items.length === 0) return null;

    const allUpdated = items.every(i => i.status === 'UPDATED');
    const hasError = items.some(i => i.status === 'LOGIN_ERROR' || i.error);

    const lastSync = items.reduce((acc, item) => {
        if (!item.lastSyncAt) return acc;
        const date = new Date(item.lastSyncAt);
        return !acc || date > acc ? date : acc;
    }, null as Date | null);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className={clsx(
                        "w-10 h-10 flex items-center justify-center rounded-full border",
                        hasError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-editorial font-bold text-white">Sincronização Bancária</h3>
                            {allUpdated && !hasError ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : hasError ? (
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            ) : (
                                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                            )}
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                            {items.length} {items.length === 1 ? 'instituição conectada' : 'instituições conectadas'}
                            {lastSync && ` • Última carga: ${lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button
                        onClick={handleSyncAll}
                        disabled={syncing}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                        {syncing ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                        <span>{syncing ? 'Atualizando...' : 'Atualizar Tudo'}</span>
                    </button>

                    <a
                        href="/settings"
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all"
                    >
                        Configurar
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
