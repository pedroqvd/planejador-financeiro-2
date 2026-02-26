'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Charts } from '@/components/Charts';
import { Transactions } from '@/components/Transactions';
import { AIAdvisor } from '@/components/AIAdvisor';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ImportModal } from '@/components/ImportModal';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Upload } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

type DashboardData = {
  stats: { netWorth: number; income: number; expenses: number; investments: number };
  chartData: { name: string; receitas: number; despesas: number }[];
};

type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: string;
  date: string;
};

export default function Home() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] || 'Usuário';
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadData = useCallback(async () => {
    const [dashRes, transRes] = await Promise.all([
      fetch('/api/dashboard'),
      fetch('/api/transactions'),
    ]);
    if (dashRes.ok) setDashboard(await dashRes.json());
    if (transRes.ok) {
      const transData = await transRes.json();
      setTransactions(Array.isArray(transData) ? transData : transData.transactions || []);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
              Resumo do seu planejamento financeiro
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-4 py-2.5 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          </div>
        </motion.div>

        <DashboardOverview stats={dashboard?.stats || null} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Charts data={dashboard?.chartData || []} loading={!dashboard} />
            <Transactions data={transactions} />
          </div>
          <div className="space-y-6">
            <AIAdvisor />
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadData(); }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { setShowImportModal(false); loadData(); }}
        />
      )}
    </DashboardLayout>
  );
}
