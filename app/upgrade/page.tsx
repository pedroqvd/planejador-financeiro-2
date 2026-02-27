'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'motion/react';
import { Check, Sparkles, Loader2, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';

const features = [
    'Acesso ilimitado ao Cash IA (Consultor)',
    'Comandos de voz para registrar transações',
    'Dashboard avançado de Investimentos',
    'Notificações preditivas e inteligentes',
    'Sem anúncios, experiência 100% clean',
    'Suporte prioritário 24/7'
];

export default function UpgradePage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { data: session, update } = useSession();

    const isAlreadyPro = session?.user?.plan === 'pro' || session?.user?.plan === 'premium';

    const handleUpgrade = async () => {
        if (isAlreadyPro) return;
        setLoading(true);
        try {
            const res = await fetch('/api/upgrade', { method: 'POST' });
            if (res.ok) {
                // Trigger rich confetti
                const duration = 3000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                setSuccess(true);
                // Force session update so UI reflects 'pro' status immediately
                await update();
                setTimeout(() => router.push('/'), 3500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>WealthCash PRO</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-editorial font-bold tracking-tight text-zinc-900 mb-4"
                    >
                        A inteligência financeira que você merece.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-lg text-zinc-500 max-w-xl mx-auto"
                    >
                        Desbloqueie o poder do seu dinheiro com a ajuda da IA, integrações premium e análises profundas do seu patrimônio.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-2xl overflow-hidden max-w-lg mx-auto"
                >
                    <div className="p-8 pb-0">
                        <h3 className="text-2xl font-editorial font-bold flex items-center mb-2">
                            Plano Pro <Star className="w-5 h-5 ml-2 fill-yellow-400 text-yellow-500" />
                        </h3>
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-black text-zinc-900 tracking-tight">R$ 29</span>
                            <span className="text-zinc-500 ml-1 font-medium">/mês</span>
                        </div>
                    </div>

                    <div className="p-8 pt-0 space-y-6">
                        <ul className="space-y-4 mb-8">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-start text-zinc-700">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center mr-3 mt-0.5">
                                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={handleUpgrade}
                            disabled={loading || isAlreadyPro || success}
                            className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${success
                                    ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                    : isAlreadyPro
                                        ? 'bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-not-allowed'
                                        : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : success ? (
                                <>Assinatura Ativada! 🎉</>
                            ) : isAlreadyPro ? (
                                <>Você já é PRO ✨</>
                            ) : (
                                <>
                                    Assinar Agora <Zap className="w-5 h-5 ml-2 fill-current" />
                                </>
                            )}
                        </button>
                        {!success && !isAlreadyPro && (
                            <p className="text-center text-xs text-zinc-400 mt-4">
                                *Simulador. Nenhuma cobrança real será feita.
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
