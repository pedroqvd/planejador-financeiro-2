'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [referredByCode, setReferredByCode] = useState('');

    useEffect(() => {
        // Safe way to get search params without triggering Suspense requirement on the entire page
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const ref = urlParams.get('ref');
            if (ref) setReferredByCode(ref);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, referredByCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setLoading(false);
                return;
            }

            // Auto-login after registration
            await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            router.push('/');
            router.refresh();
        } catch {
            setError('Erro ao criar conta. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#FCFCFA]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center space-x-3 mb-10">
                    <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center bg-white">
                        <span className="font-editorial text-xl text-zinc-900 leading-none font-bold">W</span>
                    </div>
                    <span className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">WealthCash</span>
                </div>

                {/* Card */}
                <div className="bg-white border border-zinc-200 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-editorial font-bold text-zinc-900 mb-2">Criar sua conta</h1>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider">Comece a controlar suas finanças hoje</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Nome completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border-0 border-b border-zinc-200 rounded-none text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-zinc-900 transition-all duration-200"
                                    placeholder="João Silva"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    required
                                />
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
                                    <span>Criar conta</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-zinc-500">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-zinc-900 font-semibold hover:underline transition-colors">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
