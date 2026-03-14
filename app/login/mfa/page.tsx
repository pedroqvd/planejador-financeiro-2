'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/Logo';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MfaPage() {
    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { update } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (res.ok) {
                // Refresh the session so JWT gets updated with mfaVerified: true
                await update();
                router.push('/');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Código inválido. Tente novamente.');
            }
        } catch (err) {
            setError('Erro ao verificar código. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-cream)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 rounded-3xl space-y-8"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)' }}
            >
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <Logo className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-editorial font-bold text-zinc-900 tracking-tight">Verificação em Duas Etapas</h1>
                    <p className="text-sm text-zinc-500">Insira o código de 6 dígitos do seu aplicativo autenticador.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                type="text"
                                maxLength={6}
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full px-5 py-4 rounded-2xl text-center text-3xl font-mono tracking-[0.5em] transition-all bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={token.length !== 6 || isLoading}
                        className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Verificar Código
                                <ArrowRight className="w-4 h-4 text-zinc-400" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Ambiente Seguro WealthCash
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
