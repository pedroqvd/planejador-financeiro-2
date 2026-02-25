'use client';

import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

const stats = [
  {
    name: 'Patrimônio Líquido',
    value: 'R$ 142.500,00',
    change: '+2.5%',
    trend: 'up',
    icon: Wallet,
    gradient: 'from-slate-800 to-slate-900',
    iconColor: 'text-white',
    textColor: 'text-white',
    subtextColor: 'text-slate-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    special: true
  },
  {
    name: 'Receitas (Mês)',
    value: 'R$ 12.450,00',
    change: '+12.5%',
    trend: 'up',
    icon: TrendingUp,
    gradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-zinc-900',
    subtextColor: 'text-zinc-500',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'Despesas (Mês)',
    value: 'R$ 4.230,00',
    change: '-4.1%',
    trend: 'down',
    icon: CreditCard,
    gradient: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    textColor: 'text-zinc-900',
    subtextColor: 'text-zinc-500',
    badgeBg: 'bg-rose-50 text-rose-700',
  },
  {
    name: 'Investimentos',
    value: 'R$ 85.200,00',
    change: '+5.2%',
    trend: 'up',
    icon: PiggyBank,
    gradient: 'from-indigo-50 to-violet-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    textColor: 'text-zinc-900',
    subtextColor: 'text-zinc-500',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  }
];

export function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
          className={clsx(
            'rounded-2xl p-6 flex flex-col justify-between card-hover cursor-default',
            stat.special
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-slate-900/10'
              : 'bg-gradient-to-br border border-zinc-100/80 shadow-sm bg-white'
          )}
          style={!stat.special ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : undefined}
        >
          <div className="flex items-center justify-between">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              stat.special ? 'bg-white/10' : stat.iconBg
            )}>
              <stat.icon className={clsx('w-5 h-5', stat.iconColor)} />
            </div>
            <div className={clsx(
              'flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full',
              stat.badgeBg
            )}>
              {stat.trend === 'up' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{stat.change}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className={clsx('text-sm font-medium', stat.subtextColor)}>{stat.name}</p>
            <motion.p
              className={clsx('text-2xl font-bold tracking-tight mt-1', stat.textColor)}
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
