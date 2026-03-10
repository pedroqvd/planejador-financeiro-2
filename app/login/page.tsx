'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email ou senha incorretos.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-cream)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center space-x-3 mb-10">
                    <img src="/icon.png" alt="WealthCash Logo" className="w-10 h-10 rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-color)' }} />
                    <span className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">WealthCash</span>
                </div>

                {/* Card */}
                <div className="bg-white border border-zinc-200 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-editorial font-bold text-zinc-900 mb-2">Bem-vindo de volta</h1>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider">Acesse sua conta para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border-0 border-b border-zinc-200 rounded-none text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-zinc-900 transition-all duration-200"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border-0 border-b border-zinc-200 rounded-none text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-zinc-900 transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="text-right">
                                <a href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-900 uppercase tracking-wider transition-colors">
                                    Esqueci minha senha
                                </a>
                            </div>
                        </div>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 border border-zinc-200 text-sm text-zinc-700 text-center bg-zinc-50"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all duration-200 disabled:opacity-60 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Entrar</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-zinc-500">
                            Não tem uma conta?{' '}
                            <Link href="/register" className="text-zinc-900 font-semibold hover:underline transition-colors">
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
