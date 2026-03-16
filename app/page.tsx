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
  Scan,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Wallet,
  Target,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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

function QuickActionCard({ icon: Icon, label, description, onClick, accent }: {
  icon: any; label: string; description: string; onClick: () => void; accent: string;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card-editorial p-4 text-left group relative overflow-hidden w-full"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accent }} />
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
          style={{ backgroundColor: `${accent}12` }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Skeleton hero */}
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-4 w-64 rounded" style={{ backgroundColor: 'var(--border-color)', opacity: 0.5 }} />
          </div>
          <DashboardOverview stats={null} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-80 card-editorial" />
              <div className="h-64 card-editorial" />
            </div>
            <div className="space-y-4">
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
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] uppercase tracking-[0.2em] font-medium mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {dateStr}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl sm:text-3xl font-editorial font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {getGreeting()}, {firstName}
            </motion.h1>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => setShowSmartBudgetModal(true)}
              className="button-editorial flex items-center gap-2 px-3 py-2.5 text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-ink)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">IA</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="button-editorial flex items-center gap-2 px-3 py-2.5 transition-all hover:opacity-80"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="button-editorial flex items-center gap-2 px-3 py-2.5 transition-all hover:opacity-80"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <Scan className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="button-editorial flex items-center gap-2 px-4 py-2.5 font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Transacao</span>
            </button>
          </motion.div>
        </motion.div>

        <SyncStatus />
        <OpenFinanceCTA />

        {/* Onboarding Cards for new users */}
        {!hasData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Welcome Card */}
            <div
              className="card-editorial p-6 mb-4 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-2xl shrink-0"
                  style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                >
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                    Bem-vindo ao WealthCash!
                  </h2>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Comece adicionando sua primeira transacao para ver seus dados financeiros ganharem vida.
                    Quanto mais dados, mais inteligente ficam as sugestoes da IA.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickActionCard
                icon={Plus}
                label="Nova Transacao"
                description="Registre receitas e despesas"
                onClick={() => setShowAddModal(true)}
                accent="#10b981"
              />
              <QuickActionCard
                icon={Upload}
                label="Importar Dados"
                description="Importe extratos CSV"
                onClick={() => setShowImportModal(true)}
                accent="#0ea5e9"
              />
              <QuickActionCard
                icon={Scan}
                label="Escanear Recibo"
                description="Use a camera para registrar"
                onClick={() => setShowScanModal(true)}
                accent="#8b5cf6"
              />
              <QuickActionCard
                icon={Sparkles}
                label="Sugestao IA"
                description="Orcamento inteligente"
                onClick={() => setShowSmartBudgetModal(true)}
                accent="var(--accent-ink)"
              />
            </div>
          </motion.div>
        )}

        {/* KPI Cards */}
        <DashboardOverview
          stats={dashboard?.stats || null}
          chartData={(dashboard as any)?.chartData}
          healthScore={dashboard?.healthScore}
          preferredCurrency={dashboard?.preferredCurrency}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left Column */}
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
          </div>

          {/* Right Column */}
          <div className="space-y-4">
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
                  className="card-editorial p-5 relative overflow-hidden"
                >
                  {/* Accent top */}
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--accent-ink)', opacity: 0.6 }} />

                  <button
                    onClick={() => setShowAiCoach(false)}
                    className="absolute top-3 right-3 p-1 opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-lg"
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

                  <p className="text-[10px] mt-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Use o chat no canto inferior direito para consultar
                  </p>
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
              fetchDashboard();
            }}
          />
        )}
        {showSmartBudgetModal && (
          <SmartBudgetModal
            onClose={() => setShowSmartBudgetModal(false)}
            onSuccess={() => {
              setShowSmartBudgetModal(false);
              fetchDashboard();
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
