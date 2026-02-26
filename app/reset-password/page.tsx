'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, Check, Loader2 } from 'lucide-react';

function ResetForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erro ao redefinir.');
                return;
            }

            setSuccess(true);
        } catch {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="p-6 border border-zinc-200 bg-zinc-50 text-center">
                <p className="text-sm text-zinc-600">Token de recuperação não encontrado.</p>
                <Link href="/forgot-password" className="text-xs text-zinc-900 underline mt-2 inline-block">
                    Solicitar novo link
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white border border-zinc-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                    <h1 className="text-lg font-editorial font-bold text-zinc-900">Nova Senha</h1>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Defina sua nova senha</p>
                </div>
            </div>

            {success ? (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border border-zinc-200 bg-zinc-50">
                        <Check className="w-5 h-5 text-zinc-700 flex-shrink-0" />
                        <p className="text-sm text-zinc-700">Senha alterada com sucesso!</p>
                    </div>
                    <Link
                        href="/login"
                        className="block text-center w-full py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
                    >
                        Ir para Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Confirmar Senha</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                            placeholder="Repita a nova senha"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 border border-zinc-200 text-sm text-zinc-700 text-center bg-zinc-50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-60 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redefinir Senha'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#FCFCFA] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                <div className="mb-8">
                    <Link
                        href="/login"
                        className="flex items-center space-x-2 text-xs text-zinc-500 uppercase tracking-wider hover:text-zinc-900 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar ao login</span>
                    </Link>
                </div>
                <Suspense fallback={<div className="h-64 animate-pulse bg-zinc-100" />}>
                    <ResetForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
