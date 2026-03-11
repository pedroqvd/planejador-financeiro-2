'use client';

import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Transactions } from '@/components/Transactions';
import { Charts } from '@/components/Charts';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { SyncStatus } from '@/components/SyncStatus';
import { OpenFinanceCTA } from '@/components/OpenFinanceCTA';
import { CashFlowForecast } from '@/components/CashFlowForecast';
import { BudgetProgress } from '@/components/BudgetProgress';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { SmartBudgetModal } from '@/components/SmartBudgetModal';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Upload,
  Sparkles,
  Bot,
  X,
  Scan
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

type DashboardData = {
  stats: {
    netWorth: number;
    income: number;
    expenses: number;
    investments: number;
  };
  recentTransactions: any[];
  budgets: any[];
  healthScore?: number;
  preferredCurrency?: string;
};

function formatCurrency(value: number, currencyCode: string = 'BRL') {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: currencyCode });
}

const monthNames: Record<string, number> = {
  'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
  'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showSmartBudgetModal, setShowSmartBudgetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashRes, aiRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/ai/coach')
      ]);

      if (dashRes.ok) setDashboard(await dashRes.json());
      if (aiRes.ok) setAiInsight(await aiRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Listen for sync completions to refresh data
    window.addEventListener('sync-complete', fetchDashboard);
    return () => window.removeEventListener('sync-complete', fetchDashboard);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!dashboard?.recentTransactions) return [];
    if (!selectedMonth) return dashboard.recentTransactions;

    return dashboard.recentTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return monthNames[selectedMonth] === txDate.getMonth();
    });
  }, [dashboard, selectedMonth]);

  useEffect(() => {
    // Only show coach if we have an insight and plan is not free
    if (aiInsight && !aiInsight.error) {
      const timer = setTimeout(() => setShowAiCoach(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [aiInsight]);

  const firstName = session?.user?.name?.split(' ')[0] || 'usuário';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="h-8 bg-zinc-100 dark:bg-zinc-800 w-48 rounded-lg" />
              <div className="h-3 bg-zinc-50 dark:bg-zinc-900 w-64 rounded-lg" />
            </div>
            <div className="flex space-x-2">
              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 w-32 rounded-lg" />
              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 w-32 rounded-lg hidden sm:block" />
            </div>
          </div>
          <DashboardOverview stats={null} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl" />
                <div className="h-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl" />
              <div className="h-48 bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
              Resumo do seu planejamento financeiro
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowSmartBudgetModal(true)}
              className="group relative flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute inset-0 w-12 bg-white/20 -skew-x-12"
              />
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Sugerir com IA</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200 rounded-none"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 rounded-none"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear IA</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          </div>
        </motion.div>

        <SyncStatus />
        <OpenFinanceCTA />

        {/* Top Overview Cards */}
        <DashboardOverview
          stats={dashboard?.stats || null}
          chartData={(dashboard as any)?.chartData}
          healthScore={dashboard?.healthScore}
          preferredCurrency={dashboard?.preferredCurrency}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content (Transactions) */}
          <div className="lg:col-span-2 space-y-4">
            <Charts
              data={(dashboard as any)?.chartData || []}
              loading={loading}
              onSelect={(month) => setSelectedMonth(month === selectedMonth ? null : month)}
              preferredCurrency={dashboard?.preferredCurrency}
            />
            <CashFlowForecast preferredCurrency={dashboard?.preferredCurrency} />
            <Transactions
              data={filteredTransactions}
              limit={selectedMonth ? undefined : 6}
              onDelete={fetchDashboard}
              onBulkDelete={fetchDashboard}
              preferredCurrency={dashboard?.preferredCurrency}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patrimônio Líquido */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:shadow-md dark:hover:border-zinc-700 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-lg flex items-center justify-center group-hover:from-sky-50 group-hover:to-sky-100 dark:group-hover:from-sky-900/30 dark:group-hover:to-sky-800/30 transition-all duration-300">
                    <Wallet className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 dark:text-zinc-500">
                      Patrimônio Líquido
                    </p>
                    <p className="text-xl font-editorial font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {dashboard?.stats ? formatCurrency(dashboard.stats.netWorth, dashboard.preferredCurrency) : '—'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Investimentos */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:shadow-md dark:hover:border-zinc-700 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-lg flex items-center justify-center group-hover:from-emerald-50 group-hover:to-emerald-100 dark:group-hover:from-emerald-900/30 dark:group-hover:to-emerald-800/30 transition-all duration-300">
                    <PiggyBank className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 dark:text-zinc-500">
                      Investimentos
                    </p>
                    <p className="text-xl font-editorial font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {dashboard?.stats ? formatCurrency(dashboard.stats.investments, dashboard.preferredCurrency) : '—'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sidebar Area (Budgets) */}
          <div className="space-y-4">
            <BudgetProgress
              budgets={dashboard?.budgets || []}
              preferredCurrency={dashboard?.preferredCurrency}
            />

            {/* AI Coach Card */}
            <AnimatePresence>
              {showAiCoach && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={clsx(
                    "p-6 rounded-xl relative overflow-hidden shadow-xl border",
                    aiInsight?.type === 'warning'
                      ? "bg-gradient-to-br from-amber-900 via-zinc-900 to-black border-amber-500/20"
                      : aiInsight?.type === 'success'
                        ? "bg-gradient-to-br from-emerald-900 via-zinc-900 to-black border-emerald-500/20"
                        : "bg-gradient-to-br from-indigo-900 via-zinc-900 to-black border-indigo-500/20"
                  )}
                >
                  <div className="absolute top-0 right-0 p-1">
                    <button onClick={() => setShowAiCoach(false)} className="text-white/30 hover:text-white/60 p-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                        aiInsight?.type === 'warning' ? "bg-amber-500 shadow-amber-500/30" :
                          aiInsight?.type === 'success' ? "bg-emerald-500 shadow-emerald-500/30" :
                            "bg-indigo-500 shadow-indigo-500/30"
                      )}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className={clsx(
                        "text-[10px] uppercase tracking-[0.2em] font-bold",
                        aiInsight?.type === 'warning' ? "text-amber-400" :
                          aiInsight?.type === 'success' ? "text-emerald-400" :
                            "text-indigo-400"
                      )}>
                        {aiInsight?.title || "Cash IA Coach"}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-zinc-100">
                      &quot;{aiInsight?.message}&quot;
                    </p>
                    {aiInsight?.actionableAdvice && (
                      <p className="text-[11px] text-zinc-400 mt-2 italic font-serif">
                        {aiInsight.actionableAdvice}
                      </p>
                    )}
                    <button
                      onClick={() => (window as any).openChat?.()}
                      className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Consultar IA
                    </button>
                  </div>
                  <div className={clsx(
                    "absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-20",
                    aiInsight?.type === 'warning' ? "bg-amber-500" :
                      aiInsight?.type === 'success' ? "bg-emerald-500" :
                        "bg-indigo-500"
                  )} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddTransactionModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              window.location.reload();
            }}
          />
        )}
        {showSmartBudgetModal && (
          <SmartBudgetModal
            onClose={() => setShowSmartBudgetModal(false)}
            onSuccess={() => {
              setShowSmartBudgetModal(false);
              window.location.reload();
            }}
          />
        )}
        {showScanModal && (
          <ReceiptScanner
            onClose={() => setShowScanModal(false)}
            onSuccess={() => {
              setShowScanModal(false);
              fetchDashboard();
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
