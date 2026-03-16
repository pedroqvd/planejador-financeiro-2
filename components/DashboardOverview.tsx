'use client';

import { TrendingUp, TrendingDown, Scale, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, BarChart3 } from 'lucide-react';
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

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length <= 1) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 60, h = 24;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible opacity-50 group-hover:opacity-100 transition-opacity">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function ScoreIndicator({ score, grade }: { score: number; grade: { label: string; strokeColor: string; status: string } }) {
  const pct = Math.round((score / 1000) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" strokeWidth="3" fill="transparent" style={{ stroke: 'var(--border-color)', opacity: 0.4 }} />
          <motion.circle
            cx="18" cy="18" r="15.5" stroke={grade.strokeColor} strokeWidth="3" fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${pct}, 100`}
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${pct}, 100` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color: grade.strokeColor }}>{grade.label}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--text-secondary)' }}>Saude</p>
        <p className="text-xs font-semibold" style={{ color: grade.strokeColor }}>{grade.status}</p>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, chartData, healthScore = 750, preferredCurrency = 'BRL' }: { stats: Stats; chartData?: ChartData; healthScore?: number; preferredCurrency?: string }) {
  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="card-editorial p-6 animate-pulse">
          <div className="h-4 w-24 rounded mb-3" style={{ backgroundColor: 'var(--border-color)' }} />
          <div className="h-10 w-48 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-editorial p-4 animate-pulse">
              <div className="h-3 w-14 rounded mb-2" style={{ backgroundColor: 'var(--border-color)' }} />
              <div className="h-6 w-24 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const balance = stats.income - stats.expenses;
  const savingsRate = stats.income > 0 ? ((balance / stats.income) * 100) : 0;

  const getGrade = (s: number) => {
    if (s >= 900) return { label: 'A+', strokeColor: '#10b981', status: 'Excelente' };
    if (s >= 750) return { label: 'A', strokeColor: '#10b981', status: 'Muito Bom' };
    if (s >= 600) return { label: 'B', strokeColor: '#0ea5e9', status: 'Bom' };
    if (s >= 450) return { label: 'C', strokeColor: '#f59e0b', status: 'Atencao' };
    return { label: 'D', strokeColor: '#f43f5e', status: 'Critico' };
  };

  const grade = getGrade(healthScore);

  return (
    <div className="space-y-3">
      {/* Hero Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-editorial p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--accent-ink)', opacity: 0.5 }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Saldo do mes
            </p>
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight"
              style={{ color: balance >= 0 ? '#10b981' : '#f43f5e' }}
            >
              {formatCurrency(balance, preferredCurrency)}
            </motion.p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Patrimonio: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats.netWorth, preferredCurrency)}</strong>
              </span>
              {savingsRate > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e' }}>
                  <PiggyBank className="w-3 h-3" />
                  {savingsRate.toFixed(0)}% economizado
                </span>
              )}
            </div>
          </div>
          <ScoreIndicator score={healthScore} grade={grade} />
        </div>
      </motion.div>

      {/* Compact KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCell
          label="Receitas"
          value={formatCurrency(stats.income, preferredCurrency)}
          color="#10b981"
          icon={ArrowUpRight}
          trend={chartData?.map(d => d.receitas)}
          delay={0.1}
        />
        <KpiCell
          label="Despesas"
          value={formatCurrency(stats.expenses, preferredCurrency)}
          color="#f43f5e"
          icon={ArrowDownRight}
          trend={chartData?.map(d => d.despesas)}
          delay={0.15}
        />
        <KpiCell
          label="Investimentos"
          value={formatCurrency(stats.investments, preferredCurrency)}
          color="#8b5cf6"
          icon={BarChart3}
          delay={0.2}
        />
        <KpiCell
          label="Economia"
          value={`${savingsRate.toFixed(0)}%`}
          color={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e'}
          icon={PiggyBank}
          delay={0.25}
        />
      </div>
    </div>
  );
}

function KpiCell({ label, value, color, icon: Icon, trend, delay = 0 }: {
  label: string; value: string; color: string; icon: any; trend?: number[]; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-editorial p-4 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color, opacity: 0.4 }} />
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <Icon className="w-3.5 h-3.5" style={{ color, opacity: 0.6 }} />
      </div>
      <p className="text-lg font-editorial font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {trend && trend.length > 1 && (
        <div className="mt-1.5">
          <MiniTrend data={trend} color={color} />
        </div>
      )}
    </motion.div>
  );
}
