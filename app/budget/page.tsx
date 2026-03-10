'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { EditBudgetModal } from '@/components/EditBudgetModal';
import { SmartBudgetModal } from '@/components/SmartBudgetModal';
import { Plus, Home, ShoppingCart, Car, Coffee, Wallet, Pencil, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useState, useEffect, useCallback } from 'react';

type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
};

const categoryMeta: Record<string, { icon: React.ComponentType<{ className?: string }> }> = {
  'Moradia': { icon: Home },
  'Alimentação': { icon: ShoppingCart },
  'Transporte': { icon: Car },
  'Lazer': { icon: Coffee },
  'Outros': { icon: Wallet },
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      const res = await fetch('/api/budget');
      if (res.ok) setBudgets(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const available = totalLimit - totalSpent;

  const handleEditClick = (budget: Budget) => {
    setEditBudget(budget);
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Orçamento</h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Gerencie seus limites de gastos por categoria</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSmartModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-all rounded-md"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Sugerir com IA</span>
            </button>
            <button
              onClick={() => { setEditBudget(null); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 border border-transparent text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white border border-zinc-200 p-6">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">Progresso por Categoria</h2>
              {loading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-zinc-100" />
                          <div className="space-y-1.5">
                            <div className="h-4 bg-zinc-100 w-24" />
                            <div className="h-3 bg-zinc-50 w-32" />
                          </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <div className="h-4 bg-zinc-100 w-20 ml-auto" />
                          <div className="h-3 bg-zinc-50 w-28 ml-auto" />
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 w-full" />
                    </div>
                  ))}
                </div>
              ) : budgets.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  Nenhum orçamento configurado. Clique em &quot;Nova Categoria&quot; para começar.
                </div>
              ) : (
                <div className="space-y-6">
                  {budgets.map((budget, index) => {
                    const meta = categoryMeta[budget.category] || categoryMeta['Outros'];
                    const percentage = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
                    const realPercentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                    const isOverBudget = budget.spent > budget.limit;
                    const IconComp = meta.icon;

                    return (
                      <motion.div
                        key={budget.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
                        className="space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                              <IconComp className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{budget.category}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                {realPercentage.toFixed(0)}% do limite utilizado
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={clsx('text-sm font-editorial font-bold', isOverBudget ? 'text-zinc-900' : 'text-zinc-900')}>
                                R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                de R$ {budget.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleEditClick(budget)}
                              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all"
                              title="Editar limite"
                            >
                              <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                            </button>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.4 + index * 0.08, duration: 0.8, ease: 'easeOut' }}
                            className={clsx(
                              'h-full',
                              isOverBudget ? 'bg-zinc-900' : 'bg-zinc-400'
                            )}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white border border-zinc-200 p-6">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Resumo do Mês</h2>
              <div className="space-y-3">
                <div className="p-4 border border-zinc-200">
                  <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">Total Gasto</p>
                  <p className="text-2xl font-editorial font-bold text-zinc-900">
                    R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 border border-zinc-200">
                  <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">Orçamento Total</p>
                  <p className="text-2xl font-editorial font-bold text-zinc-900">
                    R$ {totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={clsx('p-4 border', available >= 0 ? 'border-zinc-200' : 'border-zinc-200 bg-zinc-50')}>
                  <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                    {available >= 0 ? 'Disponível' : 'Acima do Limite'}
                  </p>
                  <p className="text-2xl font-editorial font-bold text-zinc-900">
                    R$ {Math.abs(available).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {showModal && (
        <EditBudgetModal
          onClose={() => { setShowModal(false); setEditBudget(null); }}
          onSuccess={() => { setShowModal(false); setEditBudget(null); loadBudgets(); }}
          budget={editBudget}
        />
      )}

      {showSmartModal && (
        <SmartBudgetModal
          onClose={() => setShowSmartModal(false)}
          onSuccess={() => { setShowSmartModal(false); loadBudgets(); }}
        />
      )}
    </DashboardLayout>
  );
}
