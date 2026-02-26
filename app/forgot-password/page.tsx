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

                <div className="bg-white border border-zinc-200 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-editorial font-bold text-zinc-900">Recuperar Senha</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Enviaremos instruções por email</p>
                        </div>
                    </div>

                    {success ? (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 border border-zinc-200 bg-zinc-50">
                                <Check className="w-5 h-5 text-zinc-700 flex-shrink-0" />
                                <p className="text-sm text-zinc-700">
                                    Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.
                                </p>
                            </div>
                            {devUrl && (
                                <div className="p-4 border border-zinc-300 bg-zinc-900 text-white">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">DEV MODE — Link de Reset</p>
                                    <Link
                                        href={devUrl.replace(/^https?:\/\/[^/]+/, '')}
                                        className="text-sm underline break-all hover:text-zinc-300"
                                    >
                                        Clique aqui para redefinir
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                                    placeholder="seu@email.com"
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
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Instruções'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
