'use client';

import {
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  ShoppingCart,
  Car,
  Home,
  Briefcase
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

const transactions = [
  {
    id: 1,
    name: 'Supermercado Extra',
    category: 'Alimentação',
    date: 'Hoje, 14:30',
    amount: '- R$ 450,00',
    type: 'expense',
    icon: ShoppingCart,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    id: 2,
    name: 'Salário Mensal',
    category: 'Receita',
    date: 'Hoje, 09:00',
    amount: '+ R$ 12.450,00',
    type: 'income',
    icon: Briefcase,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    id: 3,
    name: 'Uber',
    category: 'Transporte',
    date: 'Ontem, 19:45',
    amount: '- R$ 35,90',
    type: 'expense',
    icon: Car,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 4,
    name: 'Conta de Luz',
    category: 'Moradia',
    date: 'Ontem, 10:15',
    amount: '- R$ 280,00',
    type: 'expense',
    icon: Home,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 5,
    name: 'Starbucks',
    category: 'Alimentação',
    date: '12 de Jun, 15:20',
    amount: '- R$ 28,50',
    type: 'expense',
    icon: Coffee,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  }
];

export function Transactions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Transações Recentes</h2>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
          Ver todas →
        </button>
      </div>

      <div className="space-y-2">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + index * 0.06, duration: 0.3 }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50/80 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
                transaction.iconBg
              )}>
                <transaction.icon className={clsx('w-5 h-5', transaction.iconColor)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 group-hover:text-zinc-900 transition-colors duration-200">
                  {transaction.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-0.5">
                  <span>{transaction.category}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>{transaction.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={clsx(
                'text-sm font-bold',
                transaction.type === 'income' ? 'text-emerald-600' : 'text-zinc-700'
              )}>
                {transaction.amount}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
