'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { requestForToken } from '@/lib/firebase';
import { Bell, BellOff, Loader2, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export function PushNotificationManager() {
    const { data: session } = useSession();
    const [isSupported, setIsSupported] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'subscribed' | 'unsubscribed' | 'denied'>('loading');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSupported(true);
            const perm = Notification.permission;
            if (perm === 'granted') {
                setSubscriptionStatus('subscribed');
            } else if (perm === 'denied') {
                setSubscriptionStatus('denied');
            } else {
                setSubscriptionStatus('unsubscribed');
            }
        } else {
            setSubscriptionStatus('unsubscribed');
        }
    }, []);

    const subscribeToPush = async () => {
        if (!session?.user?.id) return;
        setSubscriptionStatus('loading');

        try {
            // Requer VAPID Key Pública configurada no .env
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                toast.error('VAPID Key não configurada no ambiente.');
                setSubscriptionStatus('unsubscribed');
                return;
            }

            const token = await requestForToken(vapidKey);

            if (token) {
                // Enviar Token para o backend e salvar no Prisma
                const res = await fetch('/api/user/fcm-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                if (res.ok) {
                    setSubscriptionStatus('subscribed');
                    toast.success('Notificações nativas ativadas!');
                } else {
                    throw new Error('Falha ao salvar token no servidor.');
                }
            } else {
                setSubscriptionStatus('denied');
                toast.error('Permissão negada pelo navegador.');
            }
        } catch (error) {
            console.error('Falha na assinatura FCM:', error);
            setSubscriptionStatus('unsubscribed');
            toast.error('Houve um erro ao tentar habilitar as notificações.');
        }
    };

    const [sendingTest, setSendingTest] = useState(false);
    const [generatingSummary, setGeneratingSummary] = useState(false);

    const sendTestNotification = async () => {
        setSendingTest(true);
        try {
            const res = await fetch('/api/notifications', {
                method: 'GET', // Budget alerts are generated on GET currently
            });
            if (res.ok) {
                toast.success('Teste enviado! Verifique sua central de notificações ou celular.');
            }
        } catch (error) {
            toast.error('Erro ao enviar teste.');
        } finally {
            setSendingTest(false);
        }
    };

    const triggerDailySummary = async () => {
        setGeneratingSummary(true);
        try {
            const res = await fetch('/api/analytics/insights/daily', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                toast.success('Resumo gerado com sucesso!');
            }
        } catch (error) {
            toast.error('Erro ao gerar resumo.');
        } finally {
            setGeneratingSummary(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="flex items-center gap-3 text-sm text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <BellOff className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Push Não Suportado</p>
                    <p className="text-xs">Seu navegador atual não possui suporte para notificações nativas.</p>
                </div>
            </div>
        );
    }

    if (subscriptionStatus === 'denied') {
        return (
            <div className="flex items-center gap-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">Permissão Bloqueada</p>
                    <p className="text-xs text-amber-700/70">Ative as notificações nas configurações do seu navegador para receber alertas do AI Coach.</p>
                </div>
            </div>
        );
    }

    if (subscriptionStatus === 'subscribed') {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100">Alertas Ativos</p>
                        <p className="text-xs text-emerald-700/70">Seu WealthCash está configurado para te notificar sobre orçamentos e metas.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={sendTestNotification}
                        disabled={sendingTest}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Enviar Alerta de Teste
                    </button>
                    <button
                        onClick={triggerDailySummary}
                        disabled={generatingSummary}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                    >
                        {generatingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        Gerar Resumo Diário
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-5 bg-white dark:bg-zinc-900 border border-emerald-200/50 dark:border-emerald-900/20 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />

            <div className="relative z-10">
                <h4 className="font-editorial font-bold text-lg flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Bell className="w-4 h-4" />
                    </div>
                    Notificações Inteligentes
                </h4>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Receba dicas instantâneas, alertas de orçamento e resumos diários diretamente na sua tela bloqueada. Fique no controle sem precisar abrir o app.
                </p>
            </div>

            <button
                onClick={subscribeToPush}
                disabled={subscriptionStatus === 'loading'}
                className="relative z-10 w-full px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
                {subscriptionStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Configurando...</>
                ) : (
                    <>
                        Ativar Alertas Push
                        <Sparkles className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
}
