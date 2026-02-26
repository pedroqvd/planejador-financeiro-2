'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'motion/react';
import { User, Lock, Check, AlertCircle, Loader2, Crown, Sparkles, ExternalLink } from 'lucide-react';

function SettingsSkeleton() {
    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="animate-pulse">
                    <div className="h-7 bg-zinc-100 w-40" />
                    <div className="h-3 bg-zinc-50 w-64 mt-2" />
                </div>
                {/* Plan skeleton */}
                <div className="bg-zinc-900 p-6 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-zinc-800" />
                            <div className="space-y-1.5">
                                <div className="h-4 bg-zinc-800 w-24" />
                                <div className="h-3 bg-zinc-800 w-32" />
                            </div>
                        </div>
                        <div className="h-6 w-16 bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="h-12 bg-zinc-800" />
                        <div className="h-12 bg-zinc-800" />
                    </div>
                </div>
                {/* Profile skeleton */}
                <div className="bg-white border border-zinc-200 p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 bg-zinc-100" />
                        <div className="space-y-1.5">
                            <div className="h-4 bg-zinc-100 w-16" />
                            <div className="h-3 bg-zinc-50 w-40" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-3 bg-zinc-50 w-12" />
                        <div className="h-8 bg-zinc-100 w-full" />
                        <div className="h-3 bg-zinc-50 w-12" />
                        <div className="h-8 bg-zinc-100 w-full" />
                    </div>
                </div>
                {/* Password skeleton */}
                <div className="bg-white border border-zinc-200 p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 bg-zinc-100" />
                        <div className="space-y-1.5">
                            <div className="h-4 bg-zinc-100 w-24" />
                            <div className="h-3 bg-zinc-50 w-28" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-3 bg-zinc-50 w-20" />
                        <div className="h-8 bg-zinc-100 w-full" />
                        <div className="h-3 bg-zinc-50 w-20" />
                        <div className="h-8 bg-zinc-100 w-full" />
                        <div className="h-3 bg-zinc-50 w-32" />
                        <div className="h-8 bg-zinc-100 w-full" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function SettingsPage() {
    const { data: session, update, status } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileMsg, setProfileMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [planLoading, setPlanLoading] = useState('');

    if (status === 'loading') return <SettingsSkeleton />;

    const saveProfile = async () => {
        if (!name.trim()) { setProfileError('Nome é obrigatório.'); return; }
        setProfileLoading(true);
        setProfileError('');
        setProfileMsg('');
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                setProfileMsg('Perfil atualizado!');
                update({ name: name.trim() });
            } else {
                setProfileError(data.error || 'Erro ao salvar.');
            }
        } catch { setProfileError('Erro de conexão.'); }
        finally { setProfileLoading(false); }
    };

    const changePassword = async () => {
        if (!currentPassword || !newPassword) { setPasswordError('Preencha todos os campos.'); return; }
        if (newPassword.length < 6) { setPasswordError('Nova senha deve ter no mínimo 6 caracteres.'); return; }
        if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem.'); return; }
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordMsg('');
        try {
            const res = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setPasswordMsg('Senha alterada com sucesso!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(data.error || 'Erro ao alterar senha.');
            }
        } catch { setPasswordError('Erro de conexão.'); }
        finally { setPasswordLoading(false); }
    };



    const handleUpgrade = async (plan: string) => {
        setPlanLoading(plan);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            }
        } catch { /* ignore */ }
        finally { setPlanLoading(''); }
    };

    const handlePortal = async () => {
        setPlanLoading('portal');
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (res.ok && data.url) window.location.href = data.url;
        } catch { /* ignore */ }
        finally { setPlanLoading(''); }
    };

    const userPlan = (session?.user as { plan?: string })?.plan || 'free';
    const planNames: Record<string, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Configurações</h1>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Gerencie seu perfil, segurança e assinatura</p>
                </motion.div>

                {/* Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-zinc-900 p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center">
                                <Crown className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-editorial font-semibold">Plano Atual</h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Gerencie sua assinatura</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 border border-zinc-700 text-xs font-bold uppercase tracking-wider">
                            {planNames[userPlan] || 'Free'}
                        </span>
                    </div>

                    {userPlan === 'free' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={() => handleUpgrade('pro')}
                                disabled={!!planLoading}
                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-white text-zinc-900 text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 transition-all disabled:opacity-50"
                            >
                                {planLoading === 'pro' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>Upgrade Pro — R$ 14,90/mês</span>
                            </button>
                            <button
                                onClick={() => handleUpgrade('premium')}
                                disabled={!!planLoading}
                                className="flex items-center justify-center space-x-2 px-4 py-3 border border-zinc-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-50"
                            >
                                {planLoading === 'premium' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                <span>Premium — R$ 29,90/mês</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handlePortal}
                            disabled={!!planLoading}
                            className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-zinc-700 text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-50 mt-2"
                        >
                            {planLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                            <span>Gerenciar Assinatura</span>
                        </button>
                    )}
                </motion.div>

                {/* Profile */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <h2 className="font-editorial font-semibold text-zinc-900">Perfil</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Altere seu nome de exibição</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                value={session?.user?.email || ''}
                                disabled
                                className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-400 cursor-not-allowed bg-transparent"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">O email não pode ser alterado</p>
                        </div>

                        {profileMsg && (
                            <div className="flex items-center space-x-2 text-zinc-700 text-sm">
                                <Check className="w-4 h-4" /> <span>{profileMsg}</span>
                            </div>
                        )}
                        {profileError && (
                            <div className="flex items-center space-x-2 text-zinc-700 text-sm">
                                <AlertCircle className="w-4 h-4" /> <span>{profileError}</span>
                            </div>
                        )}

                        <button
                            onClick={saveProfile}
                            disabled={profileLoading}
                            className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center space-x-2"
                        >
                            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            <span>Salvar</span>
                        </button>
                    </div>
                </motion.div>

                {/* Password */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <h2 className="font-editorial font-semibold text-zinc-900">Segurança</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Altere sua senha</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Senha atual</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Nova senha</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Confirmar nova senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                            />
                        </div>

                        {passwordMsg && (
                            <div className="flex items-center space-x-2 text-zinc-700 text-sm">
                                <Check className="w-4 h-4" /> <span>{passwordMsg}</span>
                            </div>
                        )}
                        {passwordError && (
                            <div className="flex items-center space-x-2 text-zinc-700 text-sm">
                                <AlertCircle className="w-4 h-4" /> <span>{passwordError}</span>
                            </div>
                        )}

                        <button
                            onClick={changePassword}
                            disabled={passwordLoading}
                            className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center space-x-2"
                        >
                            {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            <span>Alterar Senha</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
