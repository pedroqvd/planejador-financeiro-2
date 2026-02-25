'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, Target, Plane, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

const goals = [
  {
    id: 1,
    name: 'Viagem para Europa',
    icon: Plane,
    target: 20000,
    current: 8500,
    deadline: 'Dez 2026',
    monthlySuggestion: 850,
    color: 'bg-sky-500',
    gradientFrom: 'from-sky-400',
    gradientTo: 'to-sky-600',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600'
  },
  {
    id: 2,
    name: 'Reserva de Emergência',
    icon: Target,
    target: 50000,
    current: 32000,
    deadline: 'Jun 2027',
    monthlySuggestion: 1200,
    color: 'bg-emerald-500',
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-emerald-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    id: 3,
    name: 'Troca de Carro',
    icon: Car,
    target: 80000,
    current: 15000,
    deadline: 'Dez 2028',
    monthlySuggestion: 1500,
    color: 'bg-indigo-500',
    gradientFrom: 'from-indigo-400',
    gradientTo: 'to-indigo-600',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  }
];

export default function GoalsPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Metas de Economia</h1>
            <p className="text-sm text-zinc-500">Acompanhe seus objetivos financeiros e saiba quanto poupar.</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const percentage = (goal.current / goal.target) * 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm flex flex-col card-hover"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', goal.iconBg)}>
                    <goal.icon className={clsx('w-6 h-6', goal.iconColor)} />
                  </div>
                  <div className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-semibold text-zinc-600">
                    Até {goal.deadline}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-1">{goal.name}</h3>

                <div className="mt-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-zinc-900">
                      R$ {goal.current.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-zinc-500">
                      de R$ {goal.target.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 1, ease: 'easeOut' }}
                      className={clsx('h-full rounded-full bg-gradient-to-r', goal.gradientFrom, goal.gradientTo)}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 text-right font-medium">
                    {percentage.toFixed(1)}% concluído
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Sugestão mensal:</span>
                    <span className="text-sm font-bold text-zinc-900">
                      R$ {goal.monthlySuggestion.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
