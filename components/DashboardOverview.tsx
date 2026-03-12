'use client';

import { TrendingUp, TrendingDown, Scale, Award, Flame, Target, Zap } from 'lucide-react';
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

function Sparkline({ data, color, gradient }: { data: number[]; color: string; gradient: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 40;
  const width = 100;
  const gradientId = `spark-${color.replace('#', '')}`;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  // Area fill path
  const areaPath = `M0,${height} L${points.split(' ').map(p => p).join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function ScoreRing({ score, grade }: { score: number; grade: { label: string; color: string; status: string } }) {
  const circumference = 2 * Math.PI * 44;
  const strokeColor = grade.color.includes('emerald') ? '#10b981'
    : grade.color.includes('sky') ? '#0ea5e9'
      : grade.color.includes('amber') ? '#f59e0b'
        : '#f43f5e';

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent"
          className="text-zinc-100 dark:text-zinc-800" />
        <motion.circle
          cx="48" cy="48" r="44" stroke={strokeColor} strokeWidth="6" fill="transparent"
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
          className={clsx("text-2xl font-editorial font-bold", grade.color)}
        >
          {score}
        </motion.span>
        <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest">pontos</span>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, chartData, healthScore = 750, preferredCurrency = 'BRL' }: { stats: Stats; chartData?: ChartData; healthScore?: number; preferredCurrency?: string }) {
  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-5 space-y-2">
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 w-20 rounded" />
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 w-36 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const balance = stats.income - stats.expenses;
  const savingsRate = stats.income > 0 ? ((balance / stats.income) * 100) : 0;

  const getGrade = (s: number) => {
    if (s >= 900) return { label: 'A+', color: 'text-emerald-500', status: 'Excelente' };
    if (s >= 750) return { label: 'A', color: 'text-emerald-400', status: 'Muito Bom' };
    if (s >= 600) return { label: 'B', color: 'text-sky-400', status: 'Bom' };
    if (s >= 450) return { label: 'C', color: 'text-amber-400', status: 'Atenção' };
    return { label: 'D', color: 'text-rose-500', status: 'Crítico' };
  };

  const grade = getGrade(healthScore);

  const heroCards = [
    {
      name: 'Receitas do mês',
      value: formatCurrency(stats.income, preferredCurrency),
      icon: TrendingUp,
      gradient: 'from-emerald-500/10 to-emerald-500/0',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
      borderAccent: 'hover:border-emerald-300 dark:hover:border-emerald-800',
      trend: chartData?.map(d => d.receitas) || [0, 0, 0, 0, 0, 0],
      trendColor: '#10b981',
    },
    {
      name: 'Despesas do mês',
      value: formatCurrency(stats.expenses, preferredCurrency),
      icon: TrendingDown,
      gradient: 'from-rose-500/10 to-rose-500/0',
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconColor: 'text-rose-500 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
      borderAccent: 'hover:border-rose-300 dark:hover:border-rose-800',
      trend: chartData?.map(d => d.despesas) || [0, 0, 0, 0, 0, 0],
      trendColor: '#f43f5e',
    },
    {
      name: 'Saldo Líquido',
      value: formatCurrency(balance, preferredCurrency),
      icon: Scale,
      gradient: balance >= 0 ? 'from-sky-500/10 to-sky-500/0' : 'from-amber-500/10 to-amber-500/0',
      iconBg: balance >= 0 ? 'bg-sky-500/10 dark:bg-sky-500/20' : 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: balance >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400',
      valueColor: balance >= 0 ? 'text-sky-700 dark:text-sky-400' : 'text-amber-700 dark:text-amber-400',
      borderAccent: balance >= 0 ? 'hover:border-sky-300 dark:hover:border-sky-800' : 'hover:border-amber-300 dark:hover:border-amber-800',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {heroCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
            className={clsx(
              'relative overflow-hidden rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 backdrop-blur-sm transition-all duration-300 cursor-default group hover:shadow-lg dark:hover:shadow-none',
              card.borderAccent
            )}
          >
            {/* Gradient background accent */}
            <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none', card.gradient)} />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', card.iconBg)}>
                  <card.icon className={clsx('w-5 h-5', card.iconColor)} />
                </div>
                {card.trend && (
                  <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkline data={card.trend} color={card.trendColor} gradient={card.gradient} />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 dark:text-zinc-500">
                  {card.name}
                </p>
                <p className={clsx('text-2xl sm:text-3xl font-editorial font-bold tracking-tight mt-1', card.valueColor)}>
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Health Score + Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
      >
        {/* Health Score Card */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 p-6">
          <div className="flex items-center space-x-5">
            <ScoreRing score={healthScore} grade={grade} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-base font-editorial font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Saúde Financeira
                </h3>
                <span className={clsx(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                  grade.color,
                  grade.color.replace('text-', 'bg-') + '/10'
                )}>
                  {grade.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Baseado em taxa de economia, cumprimento de orçamentos e consistência.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {healthScore >= 900 && <Badge label="Elite" icon={Award} color="emerald" />}
                {healthScore >= 750 && <Badge label="Disciplinado" icon={Flame} color="sky" />}
                {healthScore >= 600 && <Badge label="Equilibrado" icon={Target} color="violet" />}
                <Badge label="Nível {grade.label}" icon={Zap} color="zinc" ghost />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Mini Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <MiniStat
            label="Taxa de Economia"
            value={`${savingsRate.toFixed(0)}%`}
            color={savingsRate >= 20 ? 'emerald' : savingsRate >= 10 ? 'amber' : 'rose'}
            delay={0.4}
          />
          <MiniStat
            label="Investimentos"
            value={formatCurrency(stats.investments, preferredCurrency)}
            color="indigo"
            delay={0.45}
          />
          <MiniStat
            label="Patrimônio"
            value={formatCurrency(stats.netWorth, preferredCurrency)}
            color="sky"
            delay={0.5}
            span2
          />
        </div>

        {/* Next Level CTA */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 flex flex-col justify-between text-white shadow-xl shadow-indigo-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-60">Próximo Nível</p>
            <h4 className="text-lg font-editorial font-bold mt-1">
              {healthScore >= 900 ? 'Diamante' : healthScore >= 750 ? 'Platinum' : healthScore >= 600 ? 'Ouro' : 'Prata'}
            </h4>
          </div>
          <div className="relative z-10 mt-4">
            <div className="flex justify-between text-[9px] font-bold mb-1.5 opacity-70">
              <span>{healthScore} pts</span>
              <span>{1000 - healthScore} para o topo</span>
            </div>
            <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(healthScore / 1000) * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                className="h-full bg-white/90 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MiniStat({ label, value, color, delay = 0, span2 = false }: { label: string; value: string; color: string; delay?: number; span2?: boolean }) {
  const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    emerald: { bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-500/5 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    rose: { bg: 'bg-rose-500/5 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    indigo: { bg: 'bg-indigo-500/5 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
    sky: { bg: 'bg-sky-500/5 dark:bg-sky-500/10', text: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  };

  const c = colorMap[color] || colorMap.sky;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={clsx(
        'rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900/80 hover:shadow-sm transition-all',
        span2 && 'col-span-2'
      )}
    >
      <div className="flex items-center space-x-1.5 mb-2">
        <div className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
        <p className="text-[10px] uppercase tracking-wider font-medium text-zinc-400 dark:text-zinc-500">{label}</p>
      </div>
      <p className={clsx('text-lg font-editorial font-bold tracking-tight', c.text)}>{value}</p>
    </motion.div>
  );
}

function Badge({ label, icon: Icon, color, ghost = false }: { label: string; icon: any; color: string; ghost?: boolean }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  };

  return (
    <div className={clsx(
      "inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
      ghost ? "bg-transparent border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400" : colors[color]
    )}>
      <Icon className="w-2.5 h-2.5" />
      <span>{label}</span>
    </div>
  );
}
