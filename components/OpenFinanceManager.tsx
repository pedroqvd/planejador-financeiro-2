'use client';

import { useState } from 'react';
import { Loader2, Landmark, Check, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Next.js dynamic import for Pluggy Connect to prevent SSR issues (Window is not defined)
const PluggyConnect = dynamic(
    () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
    { ssr: false }
);

export function OpenFinanceManager() {
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);

    // Function to initialize connection by asking the backend for a token
    const handleConnectBank = async () => {
        setLoading(true);
        setError('');

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

    const onSuccess = (itemData: any) => {
        console.log('Successfully connected bank item:', itemData);
        setIsWidgetOpen(false);
        setSuccess('Conta bancária conectada com sucesso! Os dados começarão a sincronizar em breve.');
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
                    <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                        Sincronização Bancária <span className="px-1.5 py-0.5 bg-black text-white text-[9px] uppercase tracking-widest font-bold font-editorial">Pro</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Conecte seus bancos via Open Finance para automação.</p>
                </div>

                <button
                    onClick={handleConnectBank}
                    disabled={loading || isWidgetOpen}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-50"
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

            {/* Renders the Pluggy UI overlay only when the token is ready and state is open */}
            {isWidgetOpen && connectToken && (
                <div className="fixed inset-0 z-[9999]">
                    {/* The Pluggy webview uses absolute positioning, so we containerize it */}
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
