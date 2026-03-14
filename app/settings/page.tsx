'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'motion/react';
import { User, Lock, Check, AlertCircle, Loader2, Crown, Sparkles, ExternalLink, Camera, Bell, Moon, Sun, Download, Trash2, AlertTriangle, ShieldCheck, History, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { PushNotificationManager } from '@/components/PushNotificationManager'; // <-- NEW
import { OpenFinanceManager } from '@/components/OpenFinanceManager';
import { ReferralManager } from '@/components/ReferralManager';
import { useTheme } from '@/components/ThemeProvider';

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
    const [preferredCurrency, setPreferredCurrency] = useState((session?.user as any)?.preferredCurrency || 'BRL');
    const [photo, setPhoto] = useState<string | null>(null);
    const [profileMsg, setProfileMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [planLoading, setPlanLoading] = useState('');
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mfaStatus, setMfaStatus] = useState((session?.user as any)?.mfaEnabled || false);
    const [mfaSetupLoading, setMfaSetupLoading] = useState(false);
    const [mfaQrCode, setMfaQrCode] = useState('');
    const [mfaSecret, setMfaSecret] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [mfaError, setMfaError] = useState('');
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (session?.user?.image) setPhoto(session.user.image);
        fetchLogs();
    }, [session]);

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const res = await fetch('/api/audit');
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data);
            }
        } catch (err) { console.error('Error fetching logs', err); }
        finally { setLogsLoading(false); }
    };

    const setupMfa = async () => {
        setMfaSetupLoading(true);
        setMfaError('');
        try {
            const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setMfaQrCode(data.qrCode);
            } else { setMfaError('Erro ao iniciar configuração de MFA.'); }
        } catch { setMfaError('Erro de conexão.'); }
        finally { setMfaSetupLoading(false); }
    };

    const verifyAndEnableMfa = async () => {
        setMfaSetupLoading(true);
        setMfaError('');
        try {
            const res = await fetch('/api/auth/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: mfaToken, setup: true }),
            });
            if (res.ok) {
                setMfaStatus(true);
                setMfaQrCode('');
                setMfaSecret('');
                setMfaToken('');
                update(); // Refresh session
                fetchLogs();
            } else {
                const data = await res.json();
                setMfaError(data.error || 'Código inválido.');
            }
        } catch { setMfaError('Erro de conexão.'); }
        finally { setMfaSetupLoading(false); }
    };

    const disableMfa = async () => {
        if (!confirm('Tem certeza que deseja desativar o MFA? Isso reduz a segurança da sua conta.')) return;
        setMfaSetupLoading(true);
        try {
            // Placeholder: we'd need a route to disable MFA
            alert('Funcionalidade de desativar MFA em implementação!');
        } finally { setMfaSetupLoading(false); }
    };

    if (status === 'loading') return <SettingsSkeleton />;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            setProfileError('A imagem deve ter no máximo 4MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const saveProfile = async () => {
        if (!name.trim()) { setProfileError('Nome é obrigatório.'); return; }
        setProfileLoading(true);
        setProfileError('');
        setProfileMsg('');
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), preferredCurrency }),
            });
            const data = await res.json();

            if (photo && photo !== session?.user?.image) {
                await fetch('/api/user/profile-photo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: photo }),
                });
            }

            if (res.ok) {
                setProfileMsg('Perfil e moeda atualizados! As mudanças visuais podem demorar um pouco devido ao cache.');
                update({ name: name.trim(), image: photo }); // Session context might not have currency but next session fetch will
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

    const handleDownloadData = async () => {
        setDownloadLoading(true);
        try {
            const res = await fetch('/api/settings/export');
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `wealthcash-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Erro ao exportar dados.');
            }
        } catch {
            alert('Erro de conexão ao exportar.');
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch('/api/settings/account', { method: 'DELETE' });
            if (res.ok) {
                // Redirect or signout
                window.location.href = '/api/auth/signout';
            } else {
                alert('Erro ao excluir conta.');
                setDeleteLoading(false);
            }
        } catch {
            alert('Erro de conexão.');
            setDeleteLoading(false);
        }
    };



    const handleUpgrade = async (plan: string) => {
        setPlanLoading(plan);
        try {
            const res = await fetch('/api/checkout/mercado-pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan })
            });
            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao comunicar com Mercado Pago.');
                setPlanLoading('');
            }
        } catch (err) {
            console.error(err);
            setPlanLoading('');
        }
    };

    const handlePortal = async () => {
        setPlanLoading('portal');
        alert('Portal do Mercado Pago em desenvolvimento!');
        setTimeout(() => setPlanLoading(''), 1000);
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
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 border border-zinc-200 flex items-center justify-center bg-zinc-50 relative overflow-hidden group/avatar">
                            {photo ? (
                                <Image src={photo} alt={name || 'Avatar'} fill className="object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-zinc-600" />
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] uppercase font-bold tracking-wider">
                                <Camera className="w-4 h-4 mb-0.5" />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <div>
                            <h2 className="font-editorial font-semibold text-zinc-900">Perfil</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Altere seu nome e foto</p>
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
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Moeda Principal (Dashboard)</label>
                            <select
                                value={preferredCurrency}
                                onChange={(e) => setPreferredCurrency(e.target.value)}
                                className="w-full px-4 py-2.5 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-white cursor-pointer"
                            >
                                <option value="BRL">BRL - Real Brasileiro (R$)</option>
                                <option value="USD">USD - Dólar Americano ($)</option>
                                <option value="EUR">EUR - Euro (€)</option>
                                <option value="GBP">GBP - Libra Esterlina (£)</option>
                                <option value="CAD">CAD - Dólar Canadense (C$)</option>
                            </select>
                            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">Como seus totais serão exibidos.</p>
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

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <h2 className="font-editorial font-semibold text-zinc-900">Notificações Nativas</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Configure alertas do AI Coach</p>
                        </div>
                    </div>

                    <PushNotificationManager />
                </motion.div>

                {/* Open Finance Manager */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-zinc-900 border border-zinc-800 p-6"
                >
                    <OpenFinanceManager />
                </motion.div>

                {/* Referrals Manager */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <ReferralManager />
                </motion.div>

                {/* Preferences & Data */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <h2 className="font-editorial font-semibold text-zinc-900">Preferências e Dados</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Acessibilidade e Open Finance</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-900">Modo Escuro / Claro</h3>
                                <p className="text-xs text-zinc-500 mt-1">Altere a aparência do aplicativo</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-center w-10 h-10 border border-zinc-200 hover:bg-zinc-50 transition-colors"
                            >
                                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-900">Exportar Meus Dados</h3>
                                <p className="text-xs text-zinc-500 mt-1">Baixe um arquivo JSON com todo o seu histórico</p>
                            </div>
                            <button
                                onClick={handleDownloadData}
                                disabled={downloadLoading}
                                className="px-4 py-2 border border-zinc-200 text-xs font-medium uppercase tracking-wider hover:bg-zinc-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                {downloadLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                <span>Exportar</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* MFA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <h2 className="font-editorial font-semibold text-zinc-900">Autenticação em Duas Etapas (MFA)</h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Proteja sua conta com um segundo fator</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${mfaStatus ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            {mfaStatus ? 'Ativo' : 'Desativado'}
                        </div>
                    </div>

                    {!mfaStatus && !mfaQrCode && (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Adicione uma camada extra de segurança. Ao ativar o MFA, o WealthCash solicitará um código gerado no seu celular (Google Authenticator, Authy, etc) sempre que você fizer login.
                            </p>
                            <button
                                onClick={setupMfa}
                                disabled={mfaSetupLoading}
                                className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center space-x-2"
                            >
                                {mfaSetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                <span>Configurar MFA</span>
                            </button>
                        </div>
                    )}

                    {mfaQrCode && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-6 pt-4 border-t border-zinc-100"
                        >
                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                                    <Image src={mfaQrCode} alt="Scanner QR" width={160} height={160} className="rounded-lg" />
                                </div>
                                <div className="space-y-4 flex-1">
                                    <h3 className="text-sm font-bold text-zinc-900">1. Escaneie o QR Code</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        Use seu aplicativo de autenticação preferido para escanear o código QR ao lado.
                                    </p>
                                    <div className="h-px bg-zinc-100" />
                                    <h3 className="text-sm font-bold text-zinc-900">2. Confirme o código</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={mfaToken}
                                            onChange={(e) => setMfaToken(e.target.value)}
                                            placeholder="000000"
                                            className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900"
                                        />
                                        <button
                                            onClick={verifyAndEnableMfa}
                                            disabled={mfaToken.length !== 6 || mfaSetupLoading}
                                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {mfaSetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ativar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {mfaError && <p className="text-xs text-red-600 font-medium">{mfaError}</p>}
                        </motion.div>
                    )}

                    {mfaStatus && (
                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Sua conta está super protegida!</p>
                                    <p className="text-xs text-emerald-700">O segundo fator de autenticação está ativo.</p>
                                </div>
                            </div>
                            <button
                                onClick={disableMfa}
                                className="text-[10px] font-bold text-red-600 uppercase hover:underline"
                            >
                                Desativar
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Audit Logs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="bg-white border border-zinc-200 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                                <History className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <h2 className="font-editorial font-semibold text-zinc-900">Atividades de Segurança</h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Histórico recente da sua conta</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {logsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                            </div>
                        ) : auditLogs.length > 0 ? (
                            auditLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100 text-xs text-zinc-600">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${log.action.includes('FAILURE') ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                        <span className="font-medium text-zinc-900">{log.action.split('_').join(' ')}</span>
                                        <span className="text-[10px] opacity-50">{log.ip}</span>
                                    </div>
                                    <span className="text-[10px] opacity-50">
                                        {new Date(log.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-xs text-zinc-400 italic">Nenhuma atividade registrada ainda.</p>
                        )}
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-red-50 border border-red-100 p-6"
                >
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 border border-red-200 flex items-center justify-center bg-white">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="font-editorial font-semibold text-red-900">Zona de Perigo</h2>
                            <p className="text-[10px] text-red-700 uppercase tracking-wider">Ações irreversíveis</p>
                        </div>
                    </div>

                    {!showDeleteConfirm ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-red-900">Excluir Conta</h3>
                                <p className="text-xs text-red-700 mt-1">Apaga permanentemente todos os seus dados e histórico</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-medium uppercase tracking-wider hover:bg-red-50 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-4 border border-red-200">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-900">Tem certeza absoluta?</h3>
                                    <p className="text-xs text-red-700 mt-1 mb-4">Esta ação não pode ser desfeita. Todos os seus orçamentos, transações e metas serão apagados para sempre.</p>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleteLoading}
                                            className="px-4 py-2 bg-red-600 text-white text-xs font-medium uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            {deleteLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                            <span>Sim, excluir para sempre</span>
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleteLoading}
                                            className="px-4 py-2 border border-zinc-200 text-zinc-600 text-xs font-medium uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
