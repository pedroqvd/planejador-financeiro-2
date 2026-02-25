'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, Upload, Home, ShoppingCart, Car, Coffee, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

const categories = [
  { name: 'Moradia', icon: Home, spent: 2500, limit: 3000, color: 'bg-purple-500', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { name: 'Alimentação', icon: ShoppingCart, spent: 1200, limit: 1500, color: 'bg-orange-500', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { name: 'Transporte', icon: Car, spent: 400, limit: 600, color: 'bg-blue-500', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { name: 'Lazer', icon: Coffee, spent: 800, limit: 500, color: 'bg-amber-500', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { name: 'Outros', icon: Wallet, spent: 200, limit: 400, color: 'bg-zinc-500', iconBg: 'bg-zinc-100', iconColor: 'text-zinc-600' },
];

export default function BudgetPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Orçamento</h1>
            <p className="text-sm text-zinc-500">Gerencie seus limites de gastos por categoria.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-200/70 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:shadow-sm transition-all duration-200">
              <Upload className="w-4 h-4" />
              <span>Importar Extrato</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5">
              <Plus className="w-4 h-4" />
              <span>Nova Transação</span>
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
            <div className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-6">Progresso por Categoria</h2>
              <div className="space-y-6">
                {categories.map((cat, index) => {
                  const percentage = Math.min((cat.spent / cat.limit) * 100, 100);
                  const isOverBudget = cat.spent > cat.limit;

                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', cat.iconBg)}>
                            <cat.icon className={clsx('w-5 h-5', cat.iconColor)} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{cat.name}</p>
                            <p className="text-xs text-zinc-500">
                              {percentage.toFixed(0)}% do limite utilizado
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={clsx('text-sm font-bold', isOverBudget ? 'text-rose-600' : 'text-zinc-900')}>
                            R$ {cat.spent.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-zinc-500">
                            de R$ {cat.limit.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.4 + index * 0.08, duration: 0.8, ease: 'easeOut' }}
                          className={clsx('h-full rounded-full', isOverBudget ? 'bg-gradient-to-r from-rose-400 to-rose-600' : `bg-gradient-to-r from-${cat.color.replace('bg-', '')}/70 ${cat.color}`)}
                          style={!isOverBudget ? undefined : undefined}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Resumo do Mês</h2>
              <div className="space-y-3">
                <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-100">
                  <p className="text-sm text-zinc-500 mb-1">Total Gasto</p>
                  <p className="text-2xl font-bold text-zinc-900">R$ 5.100,00</p>
                </div>
                <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-100">
                  <p className="text-sm text-zinc-500 mb-1">Orçamento Total</p>
                  <p className="text-2xl font-bold text-zinc-900">R$ 6.000,00</p>
                </div>
                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-100">
                  <p className="text-sm text-emerald-600 mb-1">Disponível</p>
                  <p className="text-2xl font-bold text-emerald-700">R$ 900,00</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
