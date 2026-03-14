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
      const dashRes = await fetch('/api/dashboard');
      if (dashRes.ok) setDashboard(await dashRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsight = async () => {
    try {
      const aiRes = await fetch('/api/ai/coach');
      if (aiRes.ok) setAiInsight(await aiRes.json());
    } catch (error) {
      console.error('Error fetching AI insight:', error);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchAiInsight();

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
              <div className="h-8 bg-zinc-100 w-48" />
              <div className="h-3 bg-zinc-50 w-64" />
            </div>
          </div>
          <DashboardOverview stats={null} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-80 card-editorial" />
              <div className="h-64 card-editorial" />
            </div>
            <div className="space-y-6">
              <div className="h-64 card-editorial" />
              <div className="h-48 card-editorial" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-editorial font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {getGreeting()}, {firstName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs mt-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Resumo do seu planejamento financeiro
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center space-x-2"
          >
            <button
              onClick={() => setShowSmartBudgetModal(true)}
              className="button-editorial group relative flex items-center space-x-2 px-3 sm:px-4 py-2.5 text-white overflow-hidden"
              style={{ backgroundColor: 'var(--accent-ink)' }}
            >
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Sugerir com IA</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="button-editorial flex items-center space-x-2 px-2.5 sm:px-4 py-2.5"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="button-editorial flex items-center space-x-2 px-2.5 sm:px-4 py-2.5"
              style={{ border: '1px solid var(--border-color)', color: 'var(--accent-ink)' }}
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="button-editorial flex items-center space-x-2 px-2.5 sm:px-4 py-2.5 font-bold"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          </motion.div>
        </motion.div>

        <SyncStatus />
        <OpenFinanceCTA />

        {/* KPI Cards */}
        <DashboardOverview
          stats={dashboard?.stats || null}
          chartData={(dashboard as any)?.chartData}
          healthScore={dashboard?.healthScore}
          preferredCurrency={dashboard?.preferredCurrency}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <BudgetProgress
              budgets={dashboard?.budgets || []}
              preferredCurrency={dashboard?.preferredCurrency}
            />

            {/* AI Coach */}
            <AnimatePresence>
              {showAiCoach && aiInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="card-editorial p-6 relative overflow-hidden"
                >
                  <button
                    onClick={() => setShowAiCoach(false)}
                    className="absolute top-3 right-3 p-1 opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-2.5 mb-4">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-[0.2em] font-bold"
                      style={{ color: 'var(--accent-ink)' }}
                    >
                      {aiInsight?.title || 'Cash IA Coach'}
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    &quot;{aiInsight?.message}&quot;
                  </p>

                  {aiInsight?.actionableAdvice && (
                    <p className="text-[11px] mt-2 italic font-serif" style={{ color: 'var(--text-secondary)' }}>
                      {aiInsight.actionableAdvice}
                    </p>
                  )}

                  <button
                    onClick={() => (window as any).openChat?.()}
                    className="button-editorial mt-4 w-full py-2.5"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--accent-ink)' }}
                  >
                    Consultar IA
                  </button>
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
