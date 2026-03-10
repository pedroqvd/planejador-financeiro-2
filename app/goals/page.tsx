'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, Plane, Shield, Car, Target, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useState, useEffect, useCallback } from 'react';
// Dynamic import to avoid SSR crash during build
const confetti = typeof window !== 'undefined' ? require('canvas-confetti') : null;

type Goal = {
  id: string;
  name: string;
  icon: string;
  target: number;
  current: number;
  deadline: string;
  monthlySuggestion: number;
  color: string;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Plane': Plane,
  'Shield': Shield,
  'Car': Car,
  'Target': Target,
};

function AddGoalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, target, deadline, icon: 'Target', color: 'indigo' }),
    });
    if (res.ok) onSuccess();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white border border-zinc-200 p-6 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-lg font-editorial font-bold text-zinc-900 mb-4">Nova Meta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 bg-transparent"
              placeholder="Ex: Viagem para Europa" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Valor alvo (R$)</label>
            <input type="number" step="0.01" value={target} onChange={e => setTarget(e.target.value)}
              className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 bg-transparent"
              placeholder="20000" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Prazo</label>
            <input type="text" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 bg-transparent"
              placeholder="Até Dez 2026" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-60">
            {loading ? 'Salvando...' : 'Criar Meta'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) setGoals(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const getMotivationalText = (pct: number) => {
    if (pct >= 100) return 'Objetivo alcançado! Parabéns pela conquista! 🎉';
    if (pct >= 80) return 'Reta final! Falta muito pouco para conquistar.';
    if (pct >= 50) return 'Passou da metade! Mantendo o foco.';
    if (pct >= 25) return 'Base sólida formada. Continue!';
    return 'O começo é a parte mais importante.';
  };

  const handleCelebrate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

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
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Metas de Economia</h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Acompanhe seus objetivos financeiros e saiba quanto poupar</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-zinc-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-zinc-100" />
                  <div className="h-5 w-20 bg-zinc-100" />
                </div>
                <div className="h-5 bg-zinc-100 w-40 mb-3" />
                <div className="flex items-baseline justify-between mb-2">
                  <div className="h-5 bg-zinc-100 w-24" />
                  <div className="h-4 bg-zinc-50 w-20" />
                </div>
                <div className="h-1.5 bg-zinc-100 w-full mb-2" />
                <div className="h-3 bg-zinc-50 w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            Nenhuma meta criada. Clique em &quot;Nova Meta&quot; para começar!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, index) => {
              const IconComp = iconMap[goal.icon] || Target;
              const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white border border-zinc-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center">
                      <IconComp className="w-6 h-6 text-zinc-600" />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500 border border-zinc-200 px-3 py-1 uppercase tracking-wider">{goal.deadline}</span>
                  </div>
                  <h3 className="text-lg font-editorial font-bold text-zinc-900 mb-3">{goal.name}</h3>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-lg font-editorial font-bold text-zinc-900">
                      R$ {goal.current.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-zinc-500">
                      de R$ {goal.target.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-zinc-900"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider">{percentage.toFixed(1)}% concluído</p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                    <p className="text-xs text-zinc-600 font-medium">
                      {getMotivationalText(percentage)}
                    </p>
                    {percentage >= 100 && (
                      <button
                        onClick={handleCelebrate}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Celebrar
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AddGoalModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadGoals(); }}
        />
      )}
    </DashboardLayout>
  );
}
