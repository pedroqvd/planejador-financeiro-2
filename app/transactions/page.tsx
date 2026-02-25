'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Transactions } from '@/components/Transactions';
import { Plus, Filter, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function TransactionsPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Transações</h1>
            <p className="text-sm text-zinc-500">Histórico completo de receitas e despesas.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-200/70 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:shadow-sm transition-all duration-200">
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-200/70 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:shadow-sm transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5">
              <Plus className="w-4 h-4" />
              <span>Nova</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl border border-zinc-100/80 shadow-sm overflow-hidden"
        >
          <Transactions />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
