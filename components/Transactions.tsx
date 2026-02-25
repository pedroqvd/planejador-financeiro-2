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

const transactions = [
  {
    id: 1,
    name: 'Supermercado Extra',
    category: 'Alimentação',
    date: 'Hoje, 14:30',
    amount: '- R$ 450,00',
    type: 'expense',
    icon: ShoppingCart,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 2,
    name: 'Salário Mensal',
    category: 'Receita',
    date: 'Hoje, 09:00',
    amount: '+ R$ 12.450,00',
    type: 'income',
    icon: Briefcase,
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    id: 3,
    name: 'Uber',
    category: 'Transporte',
    date: 'Ontem, 19:45',
    amount: '- R$ 35,90',
    type: 'expense',
    icon: Car,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 4,
    name: 'Conta de Luz',
    category: 'Moradia',
    date: 'Ontem, 10:15',
    amount: '- R$ 280,00',
    type: 'expense',
    icon: Home,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 5,
    name: 'Starbucks',
    category: 'Alimentação',
    date: '12 de Jun, 15:20',
    amount: '- R$ 28,50',
    type: 'expense',
    icon: Coffee,
    color: 'bg-amber-100 text-amber-600'
  }
];

export function Transactions() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Transações Recentes</h2>
        <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
          Ver todas
        </button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', transaction.color)}>
                <transaction.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-900 transition-colors">
                  {transaction.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-zinc-500 mt-0.5">
                  <span>{transaction.category}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>{transaction.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={clsx(
                'text-sm font-semibold',
                transaction.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'
              )}>
                {transaction.amount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
