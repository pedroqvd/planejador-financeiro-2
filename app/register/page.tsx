'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

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
            if (ref) {
                // Defer state update to avoid 'synchronous setState in effect' lint error
                setTimeout(() => setReferredByCode(ref), 0);
            }
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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-cream)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <Link
                    href="/landing"
                    className="flex items-center justify-center space-x-3 mb-10 group transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <Logo className="w-10 h-10 transition-transform group-hover:rotate-12" style={{ color: 'var(--text-primary)' }} />
                    <span className="text-2xl font-editorial font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>WealthCash</span>
                </Link>

                {/* Card */}
                <div className="p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-editorial font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Criar sua conta</h1>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Comece a controlar suas finanças hoje</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Nome completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-0 border-b text-sm transition-all duration-200"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    placeholder="João Silva"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-0 border-b text-sm transition-all duration-200"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-0 border-b text-sm transition-all duration-200"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 text-sm text-center"
                                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-xs font-medium uppercase tracking-wider transition-all duration-200 disabled:opacity-60 flex items-center justify-center space-x-2 hover:opacity-90"
                            style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
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
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Já tem uma conta?{' '}
                            <Link href="/login" className="font-semibold hover:underline transition-colors" style={{ color: 'var(--accent-ink)' }}>
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
