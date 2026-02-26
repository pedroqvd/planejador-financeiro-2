'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Transactions } from '@/components/Transactions';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ImportModal } from '@/components/ImportModal';
import { Plus, Upload, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { generatePDF } from '@/lib/pdf-report';

type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: string;
  date: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [exporting, setExporting] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

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
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Transações</h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Todas as suas movimentações financeiras</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  const res = await fetch('/api/report');
                  if (res.ok) {
                    const data = await res.json();
                    generatePDF(data);
                  }
                } catch { /* ignore */ }
                finally { setExporting(false); }
              }}
              disabled={exporting}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          </div>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-zinc-200 divide-x divide-zinc-200">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5"
          >
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Total Receitas</p>
            <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5"
          >
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Total Despesas</p>
            <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5"
          >
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Saldo</p>
            <p className={`text-xl font-editorial font-bold mt-1 text-zinc-900`}>
              R$ {(totalIncome - totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center border-b border-zinc-200">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all border-b-2 -mb-px ${filter === f
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              {f === 'all' ? 'Todas' : f === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {loading ? (
          <TransactionsSkeleton />
        ) : (
          <Transactions data={filtered} />
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadTransactions(); }}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => { setShowImport(false); loadTransactions(); }}
        />
      )}
    </DashboardLayout>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="border border-zinc-200 p-5 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-10 h-10 bg-zinc-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-100 w-1/3" />
            <div className="h-3 bg-zinc-50 w-1/5" />
          </div>
          <div className="h-5 bg-zinc-100 w-20" />
        </div>
      ))}
    </div>
  );
}
