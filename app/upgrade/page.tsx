'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'motion/react';
import { Check, Sparkles, Loader2, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { isPaidPlan, BILLING_CYCLES, type BillingCycleKey } from '@/lib/plans';

const features = [
    'Transações, metas e orçamentos ilimitados',
    'Acesso completo ao Cash IA (Consultor)',
    'Comandos de voz para registrar transações',
    'Importação automática OFX/CSV/PDF',
    'OCR de recibos e notas fiscais',
    'Conexão bancária Open Finance',
    'Notificações preditivas e inteligentes',
    'Suporte prioritário 24/7',
];

const cycles: { key: BillingCycleKey; popular?: boolean }[] = [
    { key: 'monthly' },
    { key: 'annual', popular: true },
    { key: 'semiannual' },
];

export default function UpgradePage() {
    const [loading, setLoading] = useState('');
    const [selectedCycle, setSelectedCycle] = useState<BillingCycleKey>('annual');
    const { data: session } = useSession();

    const isAlreadyPaid = isPaidPlan(session?.user?.plan || 'free');

    const handleUpgrade = async (cycle: BillingCycleKey) => {
        if (isAlreadyPaid) return;
        setLoading(cycle);
        try {
            const res = await fetch('/api/checkout/mercado-pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billingCycle: cycle })
            });
            const data = await res.json();

            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao gerar checkout');
                setLoading('');
            }
        } catch (err) {
            console.error(err);
            setLoading('');
            alert('Falha na comunicação com o banco.');
        }
    };

    const cycle = BILLING_CYCLES[selectedCycle];

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
                        <span>WealthCash</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-editorial font-bold tracking-tight text-zinc-900 mb-4"
                    >
                        A inteligencia financeira que voce merece.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-lg text-zinc-500 max-w-xl mx-auto"
                    >
                        Desbloqueie o poder do seu dinheiro com IA, Open Finance e analises profundas do seu patrimonio.
                    </motion.p>
                </div>

                {/* Billing cycle selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="flex justify-center gap-3 mb-8"
                >
                    {cycles.map(({ key, popular }) => {
                        const c = BILLING_CYCLES[key];
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedCycle(key)}
                                className={`relative px-5 py-3 text-sm font-medium rounded-xl transition-all border-2 ${selectedCycle === key
                                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                    }`}
                            >
                                {popular && (
                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-zinc-900">
                                        Melhor Valor
                                    </span>
                                )}
                                <div className="font-bold">{c.label}</div>
                                <div className="text-xs opacity-70">R$ {c.price.toFixed(2).replace('.', ',')}/mes</div>
                                {c.discount && (
                                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5">{c.discount}</div>
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-2xl overflow-hidden max-w-lg mx-auto"
                >
                    <div className="p-8 pb-0">
                        <h3 className="text-2xl font-editorial font-bold flex items-center mb-2">
                            WealthCash {cycle.label} <Star className="w-5 h-5 ml-2 fill-yellow-400 text-yellow-500" />
                        </h3>
                        <div className="flex items-baseline mb-1">
                            <span className="text-4xl font-black text-zinc-900 tracking-tight">
                                R$ {cycle.price.toFixed(0).replace('.', ',')}
                            </span>
                            <span className="text-zinc-500 ml-1 font-medium">/mes</span>
                        </div>
                        {(cycle as any).totalPrice && (
                            <p className="text-xs text-zinc-400 mb-4">
                                Cobrado R$ {(cycle as any).totalPrice.toFixed(2).replace('.', ',')} a cada {cycle.frequency} meses
                            </p>
                        )}
                    </div>

                    <div className="p-8 pt-4 space-y-6">
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
                            onClick={() => handleUpgrade(selectedCycle)}
                            disabled={!!loading || isAlreadyPaid}
                            className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${isAlreadyPaid
                                ? 'bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-not-allowed'
                                : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : isAlreadyPaid ? (
                                <>Voce ja e assinante</>
                            ) : (
                                <>
                                    Assinar Agora <Zap className="w-5 h-5 ml-2 fill-current" />
                                </>
                            )}
                        </button>
                        {!isAlreadyPaid && (
                            <p className="text-center text-xs text-zinc-400 mt-4">
                                Voce sera redirecionado para o ambiente seguro do Mercado Pago.
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
