'use client';

import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';
import { clsx } from 'clsx';

const stats = [
  {
    name: 'Patrimônio Líquido',
    value: 'R$ 142.500,00',
    change: '+2.5%',
    trend: 'up',
    icon: Wallet,
    color: 'bg-zinc-900',
    iconColor: 'text-white'
  },
  {
    name: 'Receitas (Mês)',
    value: 'R$ 12.450,00',
    change: '+12.5%',
    trend: 'up',
    icon: TrendingUp,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    name: 'Despesas (Mês)',
    value: 'R$ 4.230,00',
    change: '-4.1%',
    trend: 'down', // down is good for expenses, but let's just use the arrow
    icon: CreditCard,
    color: 'bg-rose-100',
    iconColor: 'text-rose-600'
  },
  {
    name: 'Investimentos',
    value: 'R$ 85.200,00',
    change: '+5.2%',
    trend: 'up',
    icon: PiggyBank,
    color: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  }
];

export function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
              <stat.icon className={clsx('w-5 h-5', stat.iconColor)} />
            </div>
            <div className={clsx(
              'flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full',
              stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
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
            <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
            <p className="text-2xl font-semibold text-zinc-900 mt-1 tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
