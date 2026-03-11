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
  onBulkDelete,
  preferredCurrency = 'BRL',
}: {
  data: Transaction[];
  limit?: number;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  preferredCurrency?: string;
}) {
  const [filter, setFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const filteredData = useMemo(() => {
    if (!filter) return data;
    const lower = filter.toLowerCase();
    return data.filter(t =>
      t.name.toLowerCase().includes(lower) ||
      t.category.toLowerCase().includes(lower)
    );
  }, [data, filter]);

  const displayData = limit ? filteredData.slice(0, limit) : filteredData;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayData.map(t => t.id)));
    }
  };

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
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      }
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        onBulkDelete?.(ids);
        setSelectedIds(new Set());
        setShowBulkConfirm(false);
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSelectAll}
            className={clsx(
              "w-4 h-4 border transition-all flex items-center justify-center",
              selectedIds.size > 0 && selectedIds.size < displayData.length ? "border-zinc-400 bg-zinc-100" :
                selectedIds.size === displayData.length && displayData.length > 0 ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100" :
                  "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
            )}
          >
            {selectedIds.size === displayData.length && displayData.length > 0 && (
              <Check className="w-3 h-3 text-white dark:text-zinc-900" />
            )}
            {selectedIds.size > 0 && selectedIds.size < displayData.length && (
              <div className="w-2 h-0.5 bg-zinc-500" />
            )}
          </button>
          <h2 className="text-lg font-editorial font-bold text-zinc-900 dark:text-zinc-100">Transações Recentes</h2>
        </div>

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
              const isSelected = selectedIds.has(transaction.id);

              return (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={clsx(
                    "flex items-center justify-between py-3 transition-all duration-200 group -mx-2 px-4 border-l-2",
                    isSelected ? "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-900 dark:border-zinc-100" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/20 border-transparent"
                  )}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(transaction.id); }}
                      className={clsx(
                        "w-4 h-4 border transition-all flex items-center justify-center flex-shrink-0 sm:opacity-0 group-hover:opacity-100",
                        isSelected ? "opacity-100 border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100" : "border-zinc-300 dark:border-zinc-700"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                    </button>

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
                    <p className={clsx(
                      'text-sm font-editorial font-bold whitespace-nowrap',
                      transaction.type === 'income' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
                    )}>
                      {transaction.type === 'income' ? '+ ' : '- '}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency }).format(Math.abs(transaction.amount))}
                    </p>

                    {/* Action buttons (visible on hover) */}
                    {!isConfirming && selectedIds.size === 0 && (
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
                        {onDelete && (
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

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 80, x: '-50%', opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-4 shadow-2xl space-x-6 min-w-[320px]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Selecionados</span>
              <span className="text-sm font-editorial font-bold">{selectedIds.size} itens</span>
            </div>

            <div className="h-8 w-px bg-white/10 dark:bg-zinc-200" />

            <div className="flex items-center space-x-3">
              {showBulkConfirm ? (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold text-rose-400">Excluir todos?</span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="px-3 py-1 bg-rose-600 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500 transition-all disabled:opacity-50"
                  >
                    {isBulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setShowBulkConfirm(false)}
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 dark:hover:bg-zinc-200 transition-all"
                  >
                    Mudei de ideia
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowBulkConfirm(true)}
                    className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Seleção</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
