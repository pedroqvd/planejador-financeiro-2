'use client';

import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

type Stats = {
  netWorth: number;
  income: number;
  expenses: number;
  investments: number;
} | null;

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCompact(value: number) {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

export function DashboardOverview({ stats }: { stats: Stats }) {
  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 p-6 animate-pulse">
              <div className="w-8 h-8 bg-zinc-100" />
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-zinc-100 w-20" />
                <div className="h-8 bg-zinc-100 w-36" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-zinc-200 p-4 animate-pulse">
          <div className="h-2 bg-zinc-100 w-full" />
        </div>
      </div>
    );
  }

  const balance = stats.income - stats.expenses;
  const healthPercent = stats.income > 0
    ? Math.min(Math.round((stats.expenses / stats.income) * 100), 100)
    : 0;
  const savingsPercent = stats.income > 0
    ? Math.round(((stats.income - stats.expenses) / stats.income) * 100)
    : 0;

  const heroCards = [
    {
      name: 'Receitas do mês',
      value: formatCurrency(stats.income),
      icon: TrendingUp,
      accent: 'emerald',
      bgClass: 'bg-white hover:bg-emerald-50/50',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      labelColor: 'text-zinc-500',
    },
    {
      name: 'Despesas do mês',
      value: formatCurrency(stats.expenses),
      icon: TrendingDown,
      accent: 'rose',
      bgClass: 'bg-white hover:bg-rose-50/50',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-600',
      labelColor: 'text-zinc-500',
    },
    {
      name: 'Saldo do mês',
      value: formatCurrency(balance),
      icon: Scale,
      accent: 'dark',
      bgClass: 'bg-zinc-900 hover:bg-zinc-800',
      iconBg: 'bg-white/10',
      iconColor: 'text-white/80',
      valueColor: 'text-white',
      labelColor: 'text-zinc-400',
      extra: savingsPercent > 0
        ? `Economia de ${savingsPercent}%`
        : savingsPercent === 0 ? 'Equilíbrio' : `Déficit de ${Math.abs(savingsPercent)}%`,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {heroCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className={clsx(
              'p-5 border border-zinc-200 transition-all duration-300 cursor-default group',
              card.bgClass,
              card.accent === 'dark' && 'border-zinc-800'
            )}
          >
            <div className="flex items-center justify-between">
              <div className={clsx('w-9 h-9 flex items-center justify-center', card.iconBg)}>
                <card.icon className={clsx('w-[18px] h-[18px]', card.iconColor)} />
              </div>
              {card.extra && (
                <span className={clsx(
                  'text-[10px] font-semibold uppercase tracking-widest px-2 py-1',
                  balance >= 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                )}>
                  {card.extra}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className={clsx('text-[11px] uppercase tracking-wider font-medium', card.labelColor)}>
                {card.name}
              </p>
              <motion.p
                className={clsx('text-2xl sm:text-3xl font-editorial font-bold tracking-tight mt-1', card.valueColor)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
              >
                {card.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Financial Health Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-white border border-zinc-200 px-5 py-4"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Saúde Financeira
          </span>
          <span className={clsx(
            'text-[11px] font-bold uppercase tracking-wider',
            healthPercent <= 60 ? 'text-emerald-600' :
              healthPercent <= 80 ? 'text-amber-600' :
                'text-rose-600'
          )}>
            {healthPercent}% utilizado
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthPercent}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            className={clsx(
              'h-full transition-colors',
              healthPercent <= 60 ? 'bg-emerald-500' :
                healthPercent <= 80 ? 'bg-amber-500' :
                  'bg-rose-500'
            )}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-zinc-400 tracking-wider">
            Receita: {formatCompact(stats.income)}
          </span>
          <span className="text-[10px] text-zinc-400 tracking-wider">
            Restante: {formatCompact(Math.max(0, balance))}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
