'use client';

import { useState, useEffect } from 'react';
import { Loader2, Landmark, Check, AlertCircle, Trash2, RefreshCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const PluggyConnect = dynamic(
    () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
    { ssr: false }
);

interface PluggyItem {
    id: string;
    pluggyItemId: string;
    connectorId: number;
    connectorName: string | null;
    status: string;
    error: string | null;
    lastSyncAt: string | null;
}

export function OpenFinanceManager() {
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingItems, setFetchingItems] = useState(true);
    const [items, setItems] = useState<PluggyItem[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);

    const fetchItems = async () => {
        setFetchingItems(true);
        try {
            const res = await fetch('/api/pluggy/items');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch (err) {
            console.error('Error fetching Pluggy items', err);
        } finally {
            setFetchingItems(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleConnectBank = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/pluggy/token');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao gerar token');
            }

            setConnectToken(data.accessToken);
            setIsWidgetOpen(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Falha de comunicação com o Open Finance.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Tem certeza que deseja desconectar este banco? Suas transações importadas não serão apagadas, mas novas transações não entrarão automaticamente.')) return;

        try {
            const res = await fetch(`/api/pluggy/items?itemId=${itemId}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccess('Conexão removida com sucesso.');
                fetchItems();
            } else {
                const data = await res.json();
                setError(data.error || 'Erro ao remover conexão.');
            }
        } catch (err) {
            setError('Erro de comunicação.');
        }
    };

    const onSuccess = (itemData: any) => {
        console.log('Successfully connected bank item:', itemData);
        setIsWidgetOpen(false);
        setSuccess('Conta bancária conectada com sucesso! Os dados começarão a sincronizar em breve.');
        fetchItems(); // Refresh the list
    };

    const onError = (err: any) => {
        console.error('Pluggy Connect Error:', err);
        setIsWidgetOpen(false);
        setError('A conexão com o banco não pôde ser completada.');
    };

    const onClose = () => {
        setIsWidgetOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        Sincronização Bancária <span className="px-1.5 py-0.5 bg-black text-white text-[9px] uppercase tracking-widest font-bold border border-zinc-700 font-editorial">Pro</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Conecte seus bancos via Open Finance para automação.</p>
                </div>

                <button
                    onClick={handleConnectBank}
                    disabled={loading || isWidgetOpen}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-zinc-900 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4" />}
                    <span className="hidden sm:inline">Conectar Banco</span>
                    <span className="sm:hidden">Conectar</span>
                </button>
            </div>

            {success && (
                <div className="flex items-start space-x-2 text-sm text-green-700 bg-green-50 p-3 border border-green-200">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="flex items-start space-x-2 text-sm text-red-700 bg-red-50 p-3 border border-red-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* List connected items */}
            {fetchingItems ? (
                <div className="flex items-center space-x-2 text-zinc-500 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Carregando conexões...</span>
                </div>
            ) : items.length > 0 ? (
                <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Contas Conectadas</h4>
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-zinc-700 flex items-center justify-center rounded-full text-white font-bold">
                                    {item.connectorName ? item.connectorName[0] : 'B'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white">{item.connectorName || 'Banco Desconhecido'}</h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 ${item.status === 'UPDATED' ? 'bg-green-500/10 text-green-400' :
                                                item.status === 'UPDATING' ? 'bg-blue-500/10 text-blue-400' :
                                                    item.status === 'WAITING_USER_INPUT' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                            }`}>
                                            {item.status === 'UPDATED' ? 'Sincronizado' :
                                                item.status === 'UPDATING' ? 'Sincronizando...' :
                                                    item.status === 'WAITING_USER_INPUT' ? 'Ação Necessária' :
                                                        'Erro'}
                                        </span>
                                        {item.lastSyncAt && (
                                            <span className="text-[10px] text-zinc-500">
                                                Última sync: {new Date(item.lastSyncAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                    </div>
                                    {item.error && <p className="text-[10px] text-red-400 mt-1 max-w-[200px] truncate">{item.error}</p>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteItem(item.pluggyItemId)}
                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                                title="Desconectar Banco"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}

            {isWidgetOpen && connectToken && (
                <div className="fixed inset-0 z-[9999]">
                    <PluggyConnect
                        connectToken={connectToken}
                        includeSandbox={true}
                        onSuccess={onSuccess}
                        onError={onError}
                        onClose={onClose}
                    />
                </div>
            )}
        </div>
    );
}
