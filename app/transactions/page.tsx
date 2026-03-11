'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Transactions } from '@/components/Transactions';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ImportModal } from '@/components/ImportModal';
import { Plus, Upload, Download, Loader2, FileSpreadsheet, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { generatePDF } from '@/lib/pdf-report';
import { useToast } from '@/components/Toast';
import { useSession } from 'next-auth/react';

type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: string;
  date: string;
};

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    });
  }
  return months;
}

export default function TransactionsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const preferredCurrency = (session?.user as any)?.preferredCurrency || 'BRL';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [exporting, setExporting] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions?limit=500');
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  // Apply filters
  let filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  if (dateFilter !== 'all') {
    filtered = filtered.filter(t => t.date.slice(0, 7) === dateFilter);
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filter, dateFilter]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleEdit = (tx: Transaction) => {
    setEditTransaction(tx);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast('Transação excluída', 'success');
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast('Nenhuma transação para exportar', 'warning');
      return;
    }
    const headers = 'Data,Descrição,Categoria,Tipo,Valor\n';
    const rows = filtered.map(t =>
      `${new Date(t.date).toLocaleDateString('pt-BR')},"${t.name}","${t.category}",${t.type === 'income' ? 'Receita' : 'Despesa'},${t.amount.toFixed(2)}`
    ).join('\n');
    const csv = '\uFEFF' + headers + rows; // BOM for Excel UTF-8
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthcash-transacoes-${dateFilter === 'all' ? 'todas' : dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exportado!', 'success');
  };

  const monthOptions = getMonthOptions();

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
                    toast('PDF exportado!', 'success');
                  }
                } catch { toast('Erro ao exportar PDF', 'error'); }
                finally { setExporting(false); }
              }}
              disabled={exporting}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => { setEditTransaction(null); setShowModal(true); }}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova</span>
            </button>
          </div>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-zinc-200 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5">
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Total Receitas</p>
            <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(totalIncome)}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5">
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Total Despesas</p>
            <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(totalExpense)}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5">
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Saldo</p>
            <p className="text-xl font-editorial font-bold mt-1 text-zinc-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(totalIncome - totalExpense)}
            </p>
          </motion.div>
        </div>

        {/* Filter bar: type tabs + date picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs text-zinc-700 border-0 border-b border-zinc-200 bg-transparent py-2 pr-6 focus:outline-none focus:border-zinc-900 transition-all uppercase tracking-wider cursor-pointer"
            >
              <option value="all">Todos os meses</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <TransactionsSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {filtered.length} transação{filtered.length !== 1 ? 'ões' : ''} • Página {page} de {totalPages}
              </p>
            </div>
            <Transactions data={paginated} onEdit={handleEdit} onDelete={handleDelete} preferredCurrency={preferredCurrency} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-zinc-200 text-xs font-medium uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 transition-all disabled:opacity-30"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 text-xs font-medium transition-all ${p === page
                        ? 'bg-zinc-900 text-white'
                        : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-zinc-200 text-xs font-medium uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 transition-all disabled:opacity-30"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => { setShowModal(false); setEditTransaction(null); }}
          onSuccess={() => {
            setShowModal(false);
            setEditTransaction(null);
            loadTransactions();
            toast(editTransaction ? 'Transação atualizada!' : 'Transação criada!', 'success');
          }}
          editTransaction={editTransaction}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            loadTransactions();
            toast('Transações importadas!', 'success');
          }}
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
