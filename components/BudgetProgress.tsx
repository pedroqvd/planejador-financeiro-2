'use client';

import { motion } from 'motion/react';
import { AlertTriangle, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

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
                className="card-editorial p-6 h-full"
            >
                <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                    Orçamentos
                </h2>
                <p className="text-xs uppercase tracking-wider mt-1 mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Controle mensal
                </p>
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Wallet className="w-full h-full" />
                    </div>
                    <p className="empty-state-title">Nenhum orçamento</p>
                    <p className="empty-state-text">
                        Configure limites em <span className="font-medium" style={{ color: 'var(--accent-ink)' }}>Orçamento</span> para acompanhar seus gastos.
                    </p>
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="card-editorial p-6 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                        Orçamentos
                    </h2>
                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Controle mensal
                    </p>
                </div>
                {sorted.some(b => b.spent / b.limit >= 1) && (
                    <div className="flex items-center space-x-1.5" style={{ color: '#f43f5e' }}>
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
                    const barColor = isOver ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';
                    const badgeBg = isOver ? '#f43f5e15' : isWarning ? '#f59e0b15' : '#10b98115';

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
                                <div className="flex items-center space-x-2">
                                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                        {formatCurrency(budget.spent, preferredCurrency)} / {formatCurrency(budget.limit, preferredCurrency)}
                                    </span>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                                        style={{ backgroundColor: badgeBg, color: barColor }}
                                    >
                                        {percent}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)', opacity: 0.5 }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 0.6, ease: 'easeOut' }}
                                    className="h-full"
                                    style={{ backgroundColor: barColor }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
