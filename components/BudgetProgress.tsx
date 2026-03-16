'use client';

import { motion } from 'motion/react';
import { AlertTriangle, Wallet, PieChart, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

type Budget = {
    id: string;
    category: string;
    limit: number;
    spent: number;
    month: string;
};

export function BudgetProgress({ budgets, preferredCurrency = 'BRL' }: { budgets: Budget[], preferredCurrency?: string }) {
    if (!budgets || budgets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="card-editorial p-6 h-full relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#f59e0b', opacity: 0.4 }} />
                <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                    Orçamentos
                </h2>
                <p className="text-[10px] uppercase tracking-[0.15em] mt-1 mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Controle mensal
                </p>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div
                        className="w-14 h-14 flex items-center justify-center rounded-2xl"
                        style={{ backgroundColor: 'var(--bg-input)', border: '1px dashed var(--border-color)' }}
                    >
                        <PieChart className="w-6 h-6" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-editorial font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Nenhum orçamento
                        </p>
                        <p className="text-xs mt-1 max-w-[220px]" style={{ color: 'var(--text-secondary)' }}>
                            Configure limites para acompanhar seus gastos mensais.
                        </p>
                    </div>
                    <Link
                        href="/budgets"
                        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] mt-2 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--accent-ink)' }}
                    >
                        <span>Configurar</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </motion.div>
        );
    }

    const sorted = [...budgets]
        .filter(b => b.limit > 0)
        .sort((a, b) => {
            const pctA = a.spent / a.limit;
            const pctB = b.spent / b.limit;
            return pctB - pctA;
        });

    const overBudgetCount = sorted.filter(b => b.spent / b.limit >= 1).length;
    const totalSpent = sorted.reduce((sum, b) => sum + b.spent, 0);
    const totalLimit = sorted.reduce((sum, b) => sum + b.limit, 0);
    const overallPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="card-editorial p-6 h-full flex flex-col relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: overBudgetCount > 0 ? '#f43f5e' : '#10b981', opacity: 0.6 }} />

            <div className="flex items-start justify-between mb-5">
                <div>
                    <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                        Orçamentos
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {overallPercent}% utilizado este mês
                    </p>
                </div>
                {overBudgetCount > 0 && (
                    <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#f43f5e12', color: '#f43f5e' }}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{overBudgetCount} estourado{overBudgetCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {sorted.map((budget, index) => {
                    const percent = Math.round((budget.spent / budget.limit) * 100);
                    const isOver = percent >= 100;
                    const isWarning = percent >= 80 && !isOver;
                    const barWidth = Math.min(percent, 100);
                    const barColor = isOver ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';

                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.05, duration: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {budget.category}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                        {formatCurrency(budget.spent, preferredCurrency)}
                                    </span>
                                    <span
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ backgroundColor: `${barColor}15`, color: barColor }}
                                    >
                                        {percent}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)', opacity: 0.4 }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 0.6, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: barColor }}
                                />
                            </div>
                            <div className="flex justify-end mt-0.5">
                                <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                                    de {formatCurrency(budget.limit, preferredCurrency)}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
