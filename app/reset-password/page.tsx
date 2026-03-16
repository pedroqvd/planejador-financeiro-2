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
            <div className="p-6 text-center" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Token de recuperação não encontrado.</p>
                <Link href="/forgot-password" className="text-xs underline mt-2 inline-block" style={{ color: 'var(--accent-ink)' }}>
                    Solicitar novo link
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>Nova Senha</h1>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Defina sua nova senha</p>
                </div>
            </div>

            {success ? (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#10b981' }} />
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Senha alterada com sucesso!</p>
                    </div>
                    <Link
                        href="/login"
                        className="block text-center w-full py-3 text-xs font-medium uppercase tracking-wider transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                    >
                        Ir para Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b text-sm transition-all bg-transparent"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Confirmar Senha</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b text-sm transition-all bg-transparent"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            placeholder="Repita a nova senha"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-center" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-xs font-medium uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-cream)' }}>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                <div className="mb-8">
                    <Link
                        href="/login"
                        className="flex items-center space-x-2 text-xs uppercase tracking-wider transition-colors hover:opacity-70"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar ao login</span>
                    </Link>
                </div>
                <Suspense fallback={<div className="h-64 animate-pulse" style={{ backgroundColor: 'var(--bg-input)' }} />}>
                    <ResetForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
