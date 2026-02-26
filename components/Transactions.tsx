'use client';

import {
  Coffee,
  ShoppingCart,
  Car,
  Home,
  Briefcase,
  Wallet,
  CreditCard
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: string;
  date: string;
};

const categoryIcons: Record<string, { icon: React.ComponentType<{ className?: string }> }> = {
  'Alimentação': { icon: ShoppingCart },
  'Transporte': { icon: Car },
  'Moradia': { icon: Home },
  'Lazer': { icon: Coffee },
  'Receita': { icon: Briefcase },
  'Salário': { icon: Briefcase },
  'Outros': { icon: Wallet },
};

function getCategoryStyle(category: string) {
  return categoryIcons[category] || { icon: CreditCard };
}

export function Transactions({ data }: { data: Transaction[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white p-6 border border-zinc-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-editorial font-bold text-zinc-900">Transações Recentes</h2>
      </div>

      <div className="divide-y divide-zinc-100">
        {data.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-sm">
            Nenhuma transação registrada ainda.
          </div>
        ) : (
          data.slice(0, 8).map((transaction, index) => {
            const style = getCategoryStyle(transaction.category);
            const IconComponent = style.icon;
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.06, duration: 0.3 }}
                className="flex items-center justify-between py-3 hover:bg-zinc-50 transition-all duration-200 cursor-pointer group -mx-2 px-2"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-9 h-9 border border-zinc-200 flex items-center justify-center transition-colors duration-200 group-hover:border-zinc-300">
                    <IconComponent className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{transaction.name}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wider">
                      <span>{transaction.category}</span>
                      <span className="w-[3px] h-[3px] bg-zinc-300" />
                      <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={clsx(
                    'text-sm font-editorial font-bold',
                    transaction.type === 'income' ? 'text-zinc-900' : 'text-zinc-500'
                  )}>
                    {transaction.type === 'income' ? '+ ' : '- '}
                    R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
