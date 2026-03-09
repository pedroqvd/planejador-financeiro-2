'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Charts } from '@/components/Charts';
import { Transactions } from '@/components/Transactions';
import { BudgetProgress } from '@/components/BudgetProgress';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ImportModal } from '@/components/ImportModal';
import { ReferralCard } from '@/components/ReferralCard';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Upload, Sparkles, X, Wallet, PiggyBank } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type DashboardData = {
  stats: { netWorth: number; income: number; expenses: number; investments: number };
  chartData: { name: string; receitas: number; despesas: number }[];
  budgets?: { id: string; category: string; limit: number; spent: number; month: string }[];
  referral?: { referralCode: string; referralsCount: number };
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
  const [coachInsight, setCoachInsight] = useState<{ title: string; message: string; type: string; } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [dashRes, transRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/transactions'),
        ]);

        let dashData = null;
        let transData: Transaction[] = [];

        if (dashRes.ok) dashData = await dashRes.json();
        if (transRes.ok) {
          const res = await transRes.json();
          transData = Array.isArray(res) ? res : res.transactions || [];
        }

        if (mounted) {
          setDashboard(dashData);
          setTransactions(transData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }

    fetchData();

    // AI Coach Background Trigger (debounced 36h)
    const lastCoachCall = localStorage.getItem('wealthcash_last_coach');
    const now = Date.now();
    const thirtySixHours = 36 * 60 * 60 * 1000;

    if (!lastCoachCall || now - parseInt(lastCoachCall) > thirtySixHours) {
      if (session?.user?.plan === 'pro' || session?.user?.plan === 'premium') {
        const triggerCoach = async () => {
          try {
            const aiRes = await fetch('/api/ai/coach');
            if (aiRes.ok) {
              const insight = await aiRes.json();
              if (insight?.title && insight?.message) {
                setCoachInsight(insight);
                localStorage.setItem('wealthcash_last_coach', now.toString());
                await fetch('/api/notifications/ai', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(insight)
                });
                setTimeout(() => setCoachInsight(null), 8000);
              }
            }
          } catch (e) {
            console.error('Coach silent trigger failed:', e);
          }
        };
        const coachTimeout = setTimeout(triggerCoach, 3000);
        return () => { clearTimeout(coachTimeout); mounted = false; };
      }
    }

    return () => { mounted = false; };
  }, [session?.user?.plan]);

  const refreshData = () => {
    Promise.all([
      fetch('/api/dashboard'),
      fetch('/api/transactions'),
    ]).then(async ([dashRes, transRes]) => {
      if (dashRes.ok) setDashboard(await dashRes.json());
      if (transRes.ok) {
        const res = await transRes.json();
        setTransactions(Array.isArray(res) ? res : res.transactions || []);
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ─── Header: Greeting + Actions ─── */}
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

        {/* ─── Zone 1: Hero KPIs (Receitas, Despesas, Saldo + Health Bar) ─── */}
        <DashboardOverview stats={dashboard?.stats || null} />

        {/* ─── Zone 2: Chart + Budgets (side by side) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <Charts data={dashboard?.chartData || []} loading={!dashboard} />
          </div>
          <div className="lg:col-span-2">
            <BudgetProgress budgets={dashboard?.budgets || []} />
          </div>
        </div>

        {/* ─── Zone 3: Transactions + Secondary Cards ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Recent Transactions (primary) */}
          <div className="lg:col-span-3">
            <Transactions data={transactions} limit={5} />
          </div>

          {/* Secondary Cards: Patrimônio + Investimentos + Referral */}
          <div className="lg:col-span-2 space-y-3">
            {/* Patrimônio Líquido */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-white border border-zinc-200 p-5 hover:bg-zinc-50/80 transition-colors duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-zinc-100 flex items-center justify-center">
                  <Wallet className="w-[18px] h-[18px] text-zinc-500" />
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
              className="bg-white border border-zinc-200 p-5 hover:bg-zinc-50/80 transition-colors duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-zinc-100 flex items-center justify-center">
                  <PiggyBank className="w-[18px] h-[18px] text-zinc-500" />
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

            {/* Referral Card */}
            {dashboard?.referral && (
              <ReferralCard code={dashboard.referral.referralCode} count={dashboard.referral.referralsCount} />
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); refreshData(); }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { setShowImportModal(false); refreshData(); }}
        />
      )}

      {/* ─── AI Coach Toast ─── */}
      <AnimatePresence>
        {coachInsight && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '0%' }}
            exit={{ opacity: 0, scale: 0.9, x: '10%' }}
            className="fixed bottom-24 right-6 w-80 bg-zinc-900 border border-zinc-800 text-white shadow-2xl z-50 overflow-hidden"
          >
            <div className={`h-1 w-full absolute top-0 left-0 ${coachInsight.type === 'warning' ? 'bg-rose-500' :
                coachInsight.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
              }`} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100">{coachInsight.title}</h4>
                </div>
                <button onClick={() => setCoachInsight(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mt-3">
                {coachInsight.message}
              </p>
            </div>
            <div className="px-5 py-3 bg-white/5 border-t border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Coach Ativo</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
