'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { AIAdvisor } from '@/components/AIAdvisor';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Shield, Lightbulb } from 'lucide-react';

const suggestions = [
    { icon: TrendingUp, label: 'Como estão meus gastos este mês?' },
    { icon: Shield, label: 'Estou dentro do orçamento?' },
    { icon: Lightbulb, label: 'Dicas para economizar mais' },
    { icon: Sparkles, label: 'Análise completa das minhas finanças' },
];

export default function AIPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">IA Advisor</h1>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                        Converse com o Cash, seu consultor financeiro inteligente
                    </p>
                </motion.div>

                {/* Suggestion chips - clickable */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="flex items-center space-x-3 bg-white border border-zinc-200 p-3.5 hover:bg-zinc-50 hover:border-zinc-300 transition-all text-left group"
                        >
                            <div className="w-9 h-9 border border-zinc-200 flex items-center justify-center flex-shrink-0 group-hover:border-zinc-300 transition-colors">
                                <s.icon className="w-4 h-4 text-zinc-600" />
                            </div>
                            <span className="text-sm text-zinc-700 font-medium">{s.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Tips banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-zinc-900 text-white p-5 sm:p-6"
                >
                    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
                        <div>
                            <h3 className="font-editorial font-bold text-sm sm:text-base">Dica financeira do dia</h3>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                                A regra 50/30/20: destine 50% para necessidades, 30% para desejos e 20% para poupança e investimentos.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Chat - full height on dedicated page */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="[&>div]:h-[500px] sm:[&>div]:h-[600px]"
                >
                    <AIAdvisor />
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
