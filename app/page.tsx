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
import { SpendingByCategory } from '@/components/SpendingByCategory';
import { SavingsStreak } from '@/components/SavingsStreak';
import {
  Plus,
  Upload,
  Sparkles,
  Bot,
  X,
  Scan,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

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
  const [showForecast, setShowForecast] = useState(false);
  const [dismissedInsight, setDismissedInsight] = useState(false);

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
      if (aiRes.ok) {
        const data = await aiRes.json();
        if (!data.error) setAiInsight(data);
      }
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

  const firstName = session?.user?.name?.split(' ')[0] || 'usuario';
  const hasData = dashboard && (dashboard.stats.income > 0 || dashboard.stats.expenses > 0 || dashboard.recentTransactions?.length > 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-40 rounded" style={{ backgroundColor: 'var(--border-color)', opacity: 0.5 }} />
            <div className="h-8 w-56 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <DashboardOverview stats={null} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-72 card-editorial" />
              <div className="h-48 card-editorial" />
            </div>
            <div className="space-y-4">
              <div className="h-64 card-editorial" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ===== HEADER: Greeting + Actions ===== */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {dateStr}
            </p>
            <h1
              className="text-2xl sm:text-3xl font-editorial font-bold tracking-tight mt-0.5"
              style={{ color: 'var(--text-primary)' }}
            >
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSmartBudgetModal(true)}
              className="button-editorial flex items-center gap-1.5 px-3 py-2 text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--accent-ink)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">IA</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="button-editorial p-2 hover:opacity-80 transition-opacity"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              title="Importar"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="button-editorial p-2 hover:opacity-80 transition-opacity"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              title="Escanear recibo"
            >
              <Scan className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="button-editorial flex items-center gap-1.5 px-3 py-2 font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </motion.div>

        <SyncStatus />

        {/* ===== AI INSIGHT BANNER (promoted to top) ===== */}
        <AnimatePresence>
          {aiInsight && !dismissedInsight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="card-editorial p-4 relative overflow-hidden"
              style={{ borderLeft: `3px solid ${aiInsight.type === 'warning' ? '#f59e0b' : aiInsight.type === 'success' ? '#10b981' : 'var(--accent-ink)'}` }}
            >
              <button
                onClick={() => setDismissedInsight(true)}
                className="absolute top-2.5 right-2.5 p-1 opacity-30 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3 pr-6">
                <div
                  className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent-ink)' }}>
                      {aiInsight.title || 'Cash IA'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {aiInsight.message}
                  </p>
                  {aiInsight.actionableAdvice && (
                    <p className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}>
                      {aiInsight.actionableAdvice}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ONBOARDING (new users only) ===== */}
        {!hasData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-editorial p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 flex items-center justify-center rounded-2xl shrink-0"
                style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
              >
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                  Comece aqui
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Adicione sua primeira transação, importe um extrato ou escaneie um recibo. Quanto mais dados, mais inteligente fica a IA.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="button-editorial flex items-center gap-1.5 px-3 py-2 font-bold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Transação
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="button-editorial flex items-center gap-1.5 px-3 py-2 hover:opacity-80 transition-opacity"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Importar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <OpenFinanceCTA />

        {/* ===== HERO BALANCE + KPIs ===== */}
        <DashboardOverview
          stats={dashboard?.stats || null}
          chartData={(dashboard as any)?.chartData}
          healthScore={dashboard?.healthScore}
          preferredCurrency={dashboard?.preferredCurrency}
        />

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left Column - Charts + Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <Charts
              data={(dashboard as any)?.chartData || []}
              loading={loading}
              onSelect={(month) => setSelectedMonth(month === selectedMonth ? null : month)}
              preferredCurrency={dashboard?.preferredCurrency}
            />

            <Transactions
              data={filteredTransactions}
              limit={selectedMonth ? undefined : 5}
              onDelete={fetchDashboard}
              onBulkDelete={fetchDashboard}
              preferredCurrency={dashboard?.preferredCurrency}
            />
          </div>

          {/* Right Column - Budget + Quick Links */}
          <div className="space-y-4">
            <BudgetProgress
              budgets={dashboard?.budgets || []}
              preferredCurrency={dashboard?.preferredCurrency}
            />

            {hasData && (
              <SpendingByCategory
                transactions={dashboard?.recentTransactions || []}
                preferredCurrency={dashboard?.preferredCurrency}
              />
            )}

            {hasData && dashboard?.stats && (
              <SavingsStreak
                stats={dashboard.stats}
                chartData={(dashboard as any)?.chartData}
              />
            )}

            {/* Quick Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card-editorial p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--accent-gold)', opacity: 0.3 }} />
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Acesso rápido
              </p>
              <div className="space-y-1">
                {[
                  { label: 'Relatórios', href: '/relatorios', color: '#0ea5e9' },
                  { label: 'Objetivos', href: '/goals', color: '#8b5cf6' },
                  { label: 'Investimentos', href: '/investments', color: '#10b981' },
                  { label: 'Assinaturas', href: '/recorrencias', color: '#f59e0b' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg transition-colors group"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-secondary)' }} />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== CASH FLOW FORECAST (collapsible) ===== */}
        {hasData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setShowForecast(!showForecast)}
              className="w-full flex items-center justify-between py-3 px-1 group"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-ink)' }} />
                <span className="text-sm font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                  Projeção de Fluxo de Caixa
                </span>
                <span
                  className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full"
                  style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)', opacity: 0.8 }}
                >
                  IA
                </span>
              </div>
              {showForecast
                ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              }
            </button>
            <AnimatePresence>
              {showForecast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <CashFlowForecast preferredCurrency={dashboard?.preferredCurrency} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ===== MODALS ===== */}
      <AnimatePresence>
        {showAddModal && (
          <AddTransactionModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { setShowAddModal(false); fetchDashboard(); }}
          />
        )}
        {showSmartBudgetModal && (
          <SmartBudgetModal
            onClose={() => setShowSmartBudgetModal(false)}
            onSuccess={() => { setShowSmartBudgetModal(false); fetchDashboard(); }}
          />
        )}
        {showScanModal && (
          <ReceiptScanner
            onClose={() => setShowScanModal(false)}
            onSuccess={() => { setShowScanModal(false); fetchDashboard(); }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
