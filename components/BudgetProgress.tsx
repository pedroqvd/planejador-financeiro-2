'use client';

import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

type Budget = {
    id: string;
    category: string;
    limit: number;
    spent: number;
    month: string;
};

function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function BudgetProgress({ budgets }: { budgets: Budget[] }) {
    if (!budgets || budgets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="bg-white border border-zinc-200 p-6 h-full"
            >
                <h2 className="text-lg font-editorial font-bold text-zinc-900">Orçamentos</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1 mb-6">Controle mensal</p>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-zinc-400">Nenhum orçamento definido.</p>
                    <p className="text-xs text-zinc-400 mt-1">
                        Vá em <span className="font-medium text-zinc-600">Orçamento</span> para configurar.
                    </p>
                </div>
            </motion.div>
        );
    }

    // Sort: over-budget first, then by percentage used descending
    const sorted = [...budgets]
        .filter(b => b.limit > 0)
        .sort((a, b) => {
            const pctA = a.spent / a.limit;
            const pctB = b.spent / b.limit;
            return pctB - pctA;
        });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white border border-zinc-200 p-6 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-editorial font-bold text-zinc-900">Orçamentos</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Controle mensal</p>
                </div>
                {sorted.some(b => b.spent / b.limit >= 1) && (
                    <div className="flex items-center space-x-1.5 text-rose-500">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Estourado</span>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {sorted.map((budget, index) => {
                    const percent = Math.round((budget.spent / budget.limit) * 100);
                    const isOver = percent >= 100;
                    const isWarning = percent >= 80 && !isOver;
                    const barWidth = Math.min(percent, 100);

                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.05, duration: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-zinc-700">{budget.category}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[11px] text-zinc-400">
                                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                    </span>
                                    <span className={clsx(
                                        'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5',
                                        isOver ? 'bg-rose-50 text-rose-600' :
                                            isWarning ? 'bg-amber-50 text-amber-600' :
                                                'bg-emerald-50 text-emerald-600'
                                    )}>
                                        {percent}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 0.6, ease: 'easeOut' }}
                                    className={clsx(
                                        'h-full',
                                        isOver ? 'bg-rose-500' :
                                            isWarning ? 'bg-amber-500' :
                                                'bg-emerald-500'
                                    )}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
