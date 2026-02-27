'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { requestForToken } from '@/lib/firebase';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    if (!isSupported) {
        return (
            <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-100 p-3 rounded-md">
                <BellOff className="w-4 h-4" />
                Seu navegador não suporta Push Notifications Nativas.
            </div>
        );
    }

    if (subscriptionStatus === 'denied') {
        return (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                <BellOff className="w-4 h-4" />
                Permissão de notificação bloqueada. Ative nas configurações do navegador/celular.
            </div>
        );
    }

    if (subscriptionStatus === 'subscribed') {
        return (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-200">
                <Bell className="w-4 h-4" />
                Alertas ativos. Seu AI Coach irá notificar na sua tela bloqueada.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div>
                <h4 className="font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    Notificações do AI Coach
                </h4>
                <p className="text-sm text-zinc-600 mt-1">
                    Receba dicas instantâneas e avisos de limite orçamentário direto na tela bloqueada do seu celular.
                </p>
            </div>
            <Button
                onClick={subscribeToPush}
                disabled={subscriptionStatus === 'loading'}
                variant="outline"
                className="w-full sm:w-auto self-start"
            >
                {subscriptionStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Conectando...</>
                ) : (
                    "Habilitar Notificações"
                )}
            </Button>
        </div>
    );
}
