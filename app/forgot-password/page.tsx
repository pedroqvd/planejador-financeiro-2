'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [devUrl, setDevUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erro ao enviar.');
                return;
            }

            setSuccess(true);
            if (data.resetUrl) setDevUrl(data.resetUrl);
        } catch {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

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

                <div className="p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>Recuperar Senha</h1>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Enviaremos instruções por email</p>
                        </div>
                    </div>

                    {success ? (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                                <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#10b981' }} />
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.
                                </p>
                            </div>
                            {devUrl && (
                                <div className="p-4" style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)', border: '1px solid var(--border-color)' }}>
                                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ opacity: 0.6 }}>DEV MODE — Link de Reset</p>
                                    <Link
                                        href={devUrl.replace(/^https?:\/\/[^/]+/, '')}
                                        className="text-sm underline break-all hover:opacity-70"
                                    >
                                        Clique aqui para redefinir
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 border-0 border-b text-sm transition-all bg-transparent"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    placeholder="seu@email.com"
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
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Instruções'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
