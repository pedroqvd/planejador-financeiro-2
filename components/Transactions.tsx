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

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays <= 6) return `${diffDays} dias atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

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
      className="card-editorial p-6 relative overflow-hidden"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--accent-gold)', opacity: 0.4 }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSelectAll}
            className="w-4 h-4 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              border: `1px solid ${selectedIds.size > 0 ? 'var(--text-primary)' : 'var(--border-color)'}`,
              backgroundColor: selectedIds.size === displayData.length && displayData.length > 0 ? 'var(--text-primary)' : 'transparent'
            }}
          >
            {selectedIds.size === displayData.length && displayData.length > 0 && (
              <Check className="w-3 h-3" style={{ color: 'var(--bg-cream)' }} />
            )}
            {selectedIds.size > 0 && selectedIds.size < displayData.length && (
              <div className="w-2 h-0.5" style={{ backgroundColor: 'var(--text-secondary)' }} />
            )}
          </button>
          <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
            Transações Recentes
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar..."
              className="pl-8 pr-8 py-1.5 border-0 border-b text-xs focus:outline-none transition-all w-32 sm:w-40"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {limit && data.length > limit && (
            <a
              href="/transactions"
              className="text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ color: 'var(--accent-ink)' }}
            >
              Ver todas →
            </a>
          )}
        </div>
      </div>

      <div>
        <AnimatePresence mode='popLayout'>
          {displayData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <div
                className="w-14 h-14 flex items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px dashed var(--border-color)' }}
              >
                <Wallet className="w-6 h-6" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-editorial font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {filter ? 'Nenhum resultado' : 'Nenhuma transação'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {filter ? 'Tente outro termo de busca.' : 'Adicione sua primeira transação para começar.'}
                </p>
              </div>
            </motion.div>
          ) : (
            displayData.map((transaction) => {
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
                  className="flex items-center justify-between py-3 transition-all duration-200 group -mx-2 px-4 border-l-2"
                  style={{
                    borderLeftColor: isSelected ? 'var(--accent-ink)' : 'transparent',
                    backgroundColor: isSelected ? 'var(--bg-input)' : 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    borderBottomWidth: '0.5px',
                  }}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(transaction.id); }}
                      className="w-4 h-4 flex items-center justify-center flex-shrink-0 sm:opacity-0 group-hover:opacity-100 transition-all"
                      style={{
                        border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent',
                        opacity: isSelected ? 1 : undefined,
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3" style={{ color: 'var(--bg-cream)' }} />}
                    </button>

                    <div
                      className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border-color)' }}
                    >
                      <IconComponent className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {transaction.name}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        <span>{transaction.category}</span>
                        <span className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: 'var(--border-color)' }} />
                        <span>{relativeDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <p
                      className="text-sm font-editorial font-bold whitespace-nowrap"
                      style={{ color: transaction.type === 'income' ? '#10b981' : '#f43f5e' }}
                    >
                      {transaction.type === 'income' ? '+ ' : '- '}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency }).format(Math.abs(transaction.amount))}
                    </p>

                    {!isConfirming && selectedIds.size === 0 && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(transaction)}
                            className="p-1.5 transition-colors"
                            title="Editar"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => setConfirmId(transaction.id)}
                            className="p-1.5 transition-colors hover:text-rose-500"
                            title="Excluir"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {isConfirming && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          disabled={isDeleting}
                          className="button-editorial px-2 py-1 text-[10px] text-white disabled:opacity-50"
                          style={{ backgroundColor: '#f43f5e' }}
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sim'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="button-editorial px-2 py-1 text-[10px]"
                          style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
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

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 80, x: '-50%', opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center px-6 py-4 space-x-6 min-w-[320px]"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Selecionados</span>
              <span className="text-sm font-editorial font-bold">{selectedIds.size} itens</span>
            </div>

            <div className="h-8 w-px opacity-20" style={{ backgroundColor: 'var(--bg-cream)' }} />

            <div className="flex items-center space-x-3">
              {showBulkConfirm ? (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold" style={{ color: '#f43f5e' }}>Excluir todos?</span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="button-editorial px-3 py-1 text-[10px] disabled:opacity-50"
                    style={{ backgroundColor: '#f43f5e', color: 'white' }}
                  >
                    {isBulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setShowBulkConfirm(false)}
                    className="button-editorial px-3 py-1 text-[10px] opacity-60 hover:opacity-100 transition-all"
                  >
                    Mudei de ideia
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowBulkConfirm(true)}
                    className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-colors"
                    style={{ color: '#f43f5e' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
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

function Check({ className, style }: { className: string; style?: React.CSSProperties }) {
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
      style={style}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
