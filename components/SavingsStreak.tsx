'use client';

import { motion } from 'motion/react';
import { Flame, TrendingUp, Trophy, Target } from 'lucide-react';

type Stats = {
  income: number;
  expenses: number;
};

type ChartData = {
  name: string;
  receitas: number;
  despesas: number;
}[];

export function SavingsStreak({ stats, chartData }: { stats: Stats; chartData?: ChartData }) {
  if (!stats || stats.income <= 0) return null;

  // Calculate streak: how many consecutive months user saved (income > expenses)
  const streak = (chartData || [])
    .slice()
    .reverse()
    .reduce((count, month) => {
      if (count === -1) return -1;
      if (month.receitas > month.despesas) return count + 1;
      return -1;
    }, 0);

  const currentSavingsRate = ((stats.income - stats.expenses) / stats.income) * 100;
  const isSaving = currentSavingsRate > 0;

  // Determine motivational message
  let message: string;
  let icon: any;
  let accent: string;

  if (streak >= 6) {
    message = 'Incrivel! Voce economiza ha 6+ meses seguidos';
    icon = Trophy;
    accent = '#f59e0b';
  } else if (streak >= 3) {
    message = `${streak} meses economizando! Continue assim`;
    icon = Flame;
    accent = '#f97316';
  } else if (isSaving) {
    message = 'Voce esta economizando este mes. Otimo!';
    icon = TrendingUp;
    accent = '#10b981';
  } else {
    message = 'Despesas acima da receita este mes';
    icon = Target;
    accent = '#f43f5e';
  }

  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="card-editorial p-3 flex items-center gap-3 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accent, opacity: 0.4 }} />
      <div
        className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
          {message}
        </p>
        {streak >= 1 && (
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: Math.min(streak, 6) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 300 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: accent }}
              />
            ))}
            {streak > 6 && (
              <span className="text-[9px] font-bold ml-0.5" style={{ color: accent }}>+{streak - 6}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
