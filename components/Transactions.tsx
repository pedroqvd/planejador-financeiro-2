'use client';

import {
  Coffee,
  ShoppingCart,
  Car,
  Home,
  Briefcase,
  Wallet,
  CreditCard,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';

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

export function Transactions({
  data,
  limit,
  onEdit,
  onDelete,
}: {
  data: Transaction[];
  limit?: number;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}) {
  const [filter, setFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!filter) return data;
    const lower = filter.toLowerCase();
    return data.filter(t =>
      t.name.toLowerCase().includes(lower) ||
      t.category.toLowerCase().includes(lower)
    );
  }, [data, filter]);

  const displayData = limit ? filteredData.slice(0, limit) : filteredData;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        onDelete?.(id);
      }
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-editorial font-bold text-zinc-900 dark:text-zinc-100">Transações Recentes</h2>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar..."
              className="pl-8 pr-8 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-0 border-b border-zinc-200 dark:border-zinc-700 rounded-none text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all w-32 sm:w-40"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {limit && data.length > limit && (
            <a
              href="/transactions"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Ver todas →
            </a>
          )}
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <AnimatePresence mode='popLayout'>
          {displayData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm"
            >
              {filter ? 'Nenhum resultado para este filtro.' : 'Nenhuma transação registrada ainda.'}
            </motion.div>
          ) : (
            displayData.map((transaction, index) => {
              const style = getCategoryStyle(transaction.category);
              const IconComponent = style.icon;
              const isConfirming = confirmId === transaction.id;
              const isDeleting = deletingId === transaction.id;

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all duration-200 group -mx-2 px-2"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-9 h-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
                      <IconComponent className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{transaction.name}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                        <span>{transaction.category}</span>
                        <span className="w-[3px] h-[3px] bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Amount */}
                    <p className={clsx(
                      'text-sm font-editorial font-bold whitespace-nowrap',
                      transaction.type === 'income' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
                    )}>
                      {transaction.type === 'income' ? '+ ' : '- '}
                      R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    {/* Action buttons (visible on hover) */}
                    {(onEdit || onDelete) && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(transaction)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200" />
                          </button>
                        )}
                        {onDelete && !isConfirming && (
                          <button
                            onClick={() => setConfirmId(transaction.id)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Delete confirmation */}
                    {isConfirming && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          disabled={isDeleting}
                          className="px-2 py-1 bg-rose-600 text-white text-[10px] uppercase tracking-wider font-medium hover:bg-rose-700 transition-all disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sim'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 border border-zinc-200 dark:border-zinc-700 text-[10px] uppercase tracking-wider font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                        >
                          Não
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
