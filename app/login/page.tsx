'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

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
                // Check if user needs MFA verification
                const session = await getSession();
                if (session?.user && session.user.mfaVerified === false) {
                    router.push('/login/mfa');
                } else {
                    router.push('/');
                }
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
                        <h1 className="text-2xl font-editorial font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Bem-vindo de volta</h1>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Acesse sua conta para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="text-right">
                                <a href="/forgot-password" className="text-xs uppercase tracking-wider transition-colors hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                    Esqueci minha senha
                                </a>
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
                                    <span>Entrar</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Não tem uma conta?{' '}
                            <Link href="/register" className="font-semibold hover:underline transition-colors" style={{ color: 'var(--accent-ink)' }}>
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
