'use client';

import { Wallet, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';
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

export function DashboardOverview({ stats }: { stats: Stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 animate-pulse">
            <div className="w-5 h-5 bg-zinc-100" />
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-zinc-100 w-20" />
              <div className="h-7 bg-zinc-100 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      name: 'Patrimônio Líquido',
      value: stats ? formatCurrency(stats.netWorth) : 'R$ 0,00',
      icon: Wallet,
      special: true,
    },
    {
      name: 'Receitas (Mês)',
      value: stats ? formatCurrency(stats.income) : 'R$ 0,00',
      icon: TrendingUp,
    },
    {
      name: 'Despesas (Mês)',
      value: stats ? formatCurrency(stats.expenses) : 'R$ 0,00',
      icon: CreditCard,
    },
    {
      name: 'Investimentos',
      value: stats ? formatCurrency(stats.investments) : 'R$ 0,00',
      icon: PiggyBank,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
      {cards.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
          className={clsx(
            'p-6 flex flex-col justify-between transition-colors duration-300 cursor-default',
            stat.special
              ? 'bg-zinc-900 text-white'
              : 'bg-white hover:bg-zinc-50'
          )}
        >
          <stat.icon className={clsx(
            'w-[18px] h-[18px]',
            stat.special ? 'text-zinc-500' : 'text-zinc-400'
          )} />
          <div className="mt-4">
            <p className={clsx(
              'text-xs uppercase tracking-wider font-medium',
              stat.special ? 'text-zinc-400' : 'text-zinc-500'
            )}>{stat.name}</p>
            <motion.p
              className={clsx(
                'text-2xl font-editorial font-bold tracking-tight mt-1',
                stat.special ? 'text-white' : 'text-zinc-900'
              )}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
            >
              {stat.value}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
