'use client';

import { TrendingUp, TrendingDown, Scale, Award, Target, Zap } from 'lucide-react';
import { clsx } from 'clsx';
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

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 36;
  const width = 80;
  const gradientId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,${height} L${points.split(' ').map(p => p).join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function ScoreRing({ score, grade }: { score: number; grade: { label: string; strokeColor: string; status: string } }) {
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="44" strokeWidth="5" fill="transparent"
          style={{ stroke: 'var(--border-color)' }} />
        <motion.circle
          cx="48" cy="48" r="44" stroke={grade.strokeColor} strokeWidth="5" fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 1000) * circumference }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="text-xl font-editorial font-bold"
          style={{ color: grade.strokeColor }}
        >
          {grade.label}
        </motion.span>
        <span className="text-[8px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {score} pts
        </span>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, chartData, healthScore = 750, preferredCurrency = 'BRL' }: { stats: Stats; chartData?: ChartData; healthScore?: number; preferredCurrency?: string }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-editorial p-5 animate-pulse">
            <div className="h-3 bg-zinc-100 w-20 mb-4" />
            <div className="h-7 bg-zinc-100 w-32" />
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
      icon: TrendingUp,
      accentColor: '#10b981',
      trend: chartData?.map(d => d.receitas) || [0, 0, 0, 0, 0, 0],
    },
    {
      label: 'Despesas',
      value: formatCurrency(stats.expenses, preferredCurrency),
      icon: TrendingDown,
      accentColor: '#f43f5e',
      trend: chartData?.map(d => d.despesas) || [0, 0, 0, 0, 0, 0],
    },
    {
      label: 'Saldo Líquido',
      value: formatCurrency(balance, preferredCurrency),
      icon: Scale,
      accentColor: balance >= 0 ? '#0ea5e9' : '#f59e0b',
    },
    {
      label: 'Investimentos',
      value: formatCurrency(stats.investments, preferredCurrency),
      icon: Target,
      accentColor: '#6366f1',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="card-editorial p-5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-1.5 h-1.5"
                  style={{ backgroundColor: card.accentColor }}
                />
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {card.label}
                </p>
              </div>
              <card.icon className="w-4 h-4" style={{ color: card.accentColor }} />
            </div>
            <p
              className="text-xl sm:text-2xl font-editorial font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {card.value}
            </p>
            {card.trend && (
              <div className="mt-3 opacity-50 group-hover:opacity-100 transition-opacity">
                <Sparkline data={card.trend} color={card.accentColor} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Health Score + Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
      >
        {/* Health Score */}
        <div className="lg:col-span-7 card-editorial p-6">
          <div className="flex items-center space-x-5">
            <ScoreRing score={healthScore} grade={grade} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-base font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                  Saúde Financeira
                </h3>
                <span
                  className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${grade.strokeColor}15`, color: grade.strokeColor }}
                >
                  {grade.status}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Baseado em taxa de economia, cumprimento de orçamentos e consistência.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {healthScore >= 900 && <Badge label="Elite" icon={Award} color="#10b981" />}
                {healthScore >= 600 && <Badge label="Equilibrado" icon={Target} color="#0ea5e9" />}
                <Badge label={`Nível ${grade.label}`} icon={Zap} ghost />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <QuickStat
            label="Economia"
            value={`${savingsRate.toFixed(0)}%`}
            accentColor={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e'}
            delay={0.4}
          />
          <QuickStat
            label="Patrimônio"
            value={formatCurrency(stats.netWorth, preferredCurrency)}
            accentColor="#0ea5e9"
            delay={0.45}
          />
        </div>
      </motion.div>
    </div>
  );
}

function QuickStat({ label, value, accentColor, delay = 0 }: { label: string; value: string; accentColor: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-editorial p-4"
    >
      <div className="flex items-center space-x-1.5 mb-2">
        <div className="w-1.5 h-1.5" style={{ backgroundColor: accentColor }} />
        <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      </div>
      <p className="text-lg font-editorial font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </motion.div>
  );
}

function Badge({ label, icon: Icon, color, ghost = false }: { label: string; icon: any; color?: string; ghost?: boolean }) {
  return (
    <div
      className="inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
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
