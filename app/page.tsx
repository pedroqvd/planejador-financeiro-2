'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Charts } from '@/components/Charts';
import { Transactions } from '@/components/Transactions';
import { AIAdvisor } from '@/components/AIAdvisor';
import { motion } from 'motion/react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {getGreeting()}, João 👋
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">Aqui está o resumo do seu planejamento financeiro.</p>
          </div>
          <div className="text-sm text-zinc-400 bg-white/60 px-3 py-1.5 rounded-lg border border-zinc-200/50">
            Atualizado agora
          </div>
        </motion.div>
        <DashboardOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Charts />
            <Transactions />
          </div>
          <div className="space-y-6">
            <AIAdvisor />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
