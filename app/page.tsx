'use client';

import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { RecentTransactions } from '@/components/RecentTransactions';
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
  Bot
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSmartBudgetModal, setShowSmartBudgetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setDashboard(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowAiCoach(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'usuário';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

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
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
              Resumo do seu planejamento financeiro
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowSmartBudgetModal(true)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sugerir com IA</span>
            </button>
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

        {/* Top Overview Cards */}
        <DashboardOverview stats={dashboard?.stats || null} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content (Transactions) */}
          <div className="lg:col-span-2 space-y-4">
            <RecentTransactions transactions={dashboard?.recentTransactions || []} loading={loading} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patrimônio Líquido */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-lg flex items-center justify-center group-hover:from-sky-50 group-hover:to-sky-100 transition-all duration-300">
                    <Wallet className="w-[18px] h-[18px] text-zinc-500 group-hover:text-sky-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">
                      Patrimônio Líquido
                    </p>
                    <p className="text-xl font-editorial font-bold tracking-tight text-zinc-900 mt-0.5">
                      {dashboard?.stats ? formatCurrency(dashboard.stats.netWorth) : '—'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Investimentos */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-lg flex items-center justify-center group-hover:from-emerald-50 group-hover:to-emerald-100 transition-all duration-300">
                    <PiggyBank className="w-[18px] h-[18px] text-zinc-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">
                      Investimentos
                    </p>
                    <p className="text-xl font-editorial font-bold tracking-tight text-zinc-900 mt-0.5">
                      {dashboard?.stats ? formatCurrency(dashboard.stats.investments) : '—'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sidebar Area (Budgets) */}
          <div className="space-y-4">
            <BudgetProgress budgets={dashboard?.budgets || []} loading={loading} />

            {/* AI Coach Card */}
            <AnimatePresence>
              {showAiCoach && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white p-6 rounded-xl relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-1">
                    <button onClick={() => setShowAiCoach(false)} className="text-white/30 hover:text-white/60">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400">Cash IA Coach</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      "Você gastou 15% menos em lazer esta semana. Que tal direcionar esse valor para sua reserva de emergência?"
                    </p>
                    <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                      Consultar IA
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
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
      </AnimatePresence>
    </DashboardLayout>
  );
}

function X({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
