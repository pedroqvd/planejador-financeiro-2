'use client';

import { TrendingUp, TrendingDown, Scale, Award, Target, Zap, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/currency';

type Stats = {
  netWorth: number;
  income: number;
  expenses: number;
  investments: number;
} | null;

type ChartData = {
  name: string;
  receitas: number;
  despesas: number;
}[];

function MiniBar({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-[3px] h-8">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max((v / max) * 100, 8)}%` }}
          transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
          className="flex-1 min-w-[4px] rounded-sm"
          style={{ backgroundColor: color, opacity: 0.2 + (i / data.length) * 0.8 }}
        />
      ))}
    </div>
  );
}

function ScoreRing({ score, grade }: { score: number; grade: { label: string; strokeColor: string; status: string } }) {
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="44" strokeWidth="4" fill="transparent"
          style={{ stroke: 'var(--border-color)', opacity: 0.4 }} />
        <motion.circle
          cx="48" cy="48" r="44" stroke={grade.strokeColor} strokeWidth="4" fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 1000) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="text-2xl font-editorial font-bold"
          style={{ color: grade.strokeColor }}
        >
          {grade.label}
        </motion.span>
        <span className="text-[9px] uppercase font-bold tracking-widest mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {score} pts
        </span>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, chartData, healthScore = 750, preferredCurrency = 'BRL' }: { stats: Stats; chartData?: ChartData; healthScore?: number; preferredCurrency?: string }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-editorial p-5 animate-pulse">
            <div className="h-3 rounded w-16 mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-7 rounded w-28" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
        ))}
      </div>
    );
  }

  const balance = stats.income - stats.expenses;
  const savingsRate = stats.income > 0 ? ((balance / stats.income) * 100) : 0;

  const getGrade = (s: number) => {
    if (s >= 900) return { label: 'A+', strokeColor: '#10b981', status: 'Excelente' };
    if (s >= 750) return { label: 'A', strokeColor: '#10b981', status: 'Muito Bom' };
    if (s >= 600) return { label: 'B', strokeColor: '#0ea5e9', status: 'Bom' };
    if (s >= 450) return { label: 'C', strokeColor: '#f59e0b', status: 'Atenção' };
    return { label: 'D', strokeColor: '#f43f5e', status: 'Crítico' };
  };

  const grade = getGrade(healthScore);

  const kpiCards = [
    {
      label: 'Receitas',
      value: formatCurrency(stats.income, preferredCurrency),
      icon: ArrowUpRight,
      accentColor: '#10b981',
      bgTint: 'rgba(16, 185, 129, 0.08)',
      trend: chartData?.map(d => d.receitas) || [],
    },
    {
      label: 'Despesas',
      value: formatCurrency(stats.expenses, preferredCurrency),
      icon: ArrowDownRight,
      accentColor: '#f43f5e',
      bgTint: 'rgba(244, 63, 94, 0.08)',
      trend: chartData?.map(d => d.despesas) || [],
    },
    {
      label: 'Saldo Líquido',
      value: formatCurrency(balance, preferredCurrency),
      icon: Scale,
      accentColor: balance >= 0 ? '#0ea5e9' : '#f59e0b',
      bgTint: balance >= 0 ? 'rgba(14, 165, 233, 0.08)' : 'rgba(245, 158, 11, 0.08)',
    },
    {
      label: 'Investimentos',
      value: formatCurrency(stats.investments, preferredCurrency),
      icon: TrendingUp,
      accentColor: '#8b5cf6',
      bgTint: 'rgba(139, 92, 246, 0.08)',
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="card-editorial p-5 group relative overflow-hidden"
          >
            {/* Subtle accent border top */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: card.accentColor, opacity: 0.6 }} />

            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </p>
              <div
                className="w-7 h-7 flex items-center justify-center rounded-full"
                style={{ backgroundColor: card.bgTint }}
              >
                <card.icon className="w-3.5 h-3.5" style={{ color: card.accentColor }} />
              </div>
            </div>

            <p
              className="text-xl sm:text-2xl font-editorial font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {card.value}
            </p>

            {card.trend && card.trend.length > 0 && (
              <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <MiniBar data={card.trend} color={card.accentColor} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Health Score + Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="lg:col-span-7 card-editorial p-6"
        >
          <div className="flex items-center gap-5">
            <ScoreRing score={healthScore} grade={grade} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                  Saude Financeira
                </h3>
                <span
                  className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] rounded-full"
                  style={{ backgroundColor: `${grade.strokeColor}15`, color: grade.strokeColor }}
                >
                  {grade.status}
                </span>
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Baseado em taxa de economia, cumprimento de orcamentos e consistencia.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {healthScore >= 900 && <Badge label="Elite" icon={Award} color="#10b981" />}
                {healthScore >= 600 && <Badge label="Equilibrado" icon={Target} color="#0ea5e9" />}
                <Badge label={`Nivel ${grade.label}`} icon={Zap} ghost />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="card-editorial p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e', opacity: 0.6 }} />
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Economia</p>
            <p className="text-2xl font-editorial font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {savingsRate.toFixed(0)}%
            </p>
            <p className="text-[10px] mt-1" style={{ color: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e' }}>
              {savingsRate >= 20 ? 'Otimo ritmo' : savingsRate >= 10 ? 'Pode melhorar' : 'Atencao'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="card-editorial p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#0ea5e9', opacity: 0.6 }} />
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Patrimonio</p>
            <p className="text-lg font-editorial font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(stats.netWorth, preferredCurrency)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Wallet className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Total acumulado</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Badge({ label, icon: Icon, color, ghost = false }: { label: string; icon: any; color?: string; ghost?: boolean }) {
  return (
    <div
      className="inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full"
      style={ghost
        ? { border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }
        : { backgroundColor: `${color}15`, color: color, border: `1px solid ${color}25` }
      }
    >
      <Icon className="w-2.5 h-2.5" />
      <span>{label}</span>
    </div>
  );
}
