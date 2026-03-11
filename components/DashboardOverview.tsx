'use client';

import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

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

function formatCurrency(value: number, currencyCode: string = 'BRL') {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: currencyCode });
}

function formatCompact(value: number, currencyCode: string = 'BRL') {
  if (Math.abs(value) >= 1000) {
    const symbol = formatCurrency(0, currencyCode).replace(/[\d,.\s]/g, '');
    return `${symbol} ${(value / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value, currencyCode);
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
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

export function DashboardOverview({ stats, chartData, healthScore = 750, preferredCurrency = 'BRL' }: { stats: Stats; chartData?: ChartData; healthScore?: number; preferredCurrency?: string }) {
  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 w-20" />
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const balance = stats.income - stats.expenses;

  // Grade calculation
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
      accent: 'emerald',
      bgClass: 'bg-white dark:bg-zinc-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
      labelColor: 'text-zinc-500 dark:text-zinc-400',
      trend: chartData?.map(d => d.receitas) || [0, 0, 0, 0, 0, 0],
      trendColor: '#10b981',
    },
    {
      name: 'Despesas do mês',
      value: formatCurrency(stats.expenses, preferredCurrency),
      icon: TrendingDown,
      accent: 'rose',
      bgClass: 'bg-white dark:bg-zinc-900 hover:bg-rose-50/50 dark:hover:bg-rose-500/5',
      iconBg: 'bg-rose-50 dark:bg-rose-500/20',
      iconColor: 'text-rose-500 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
      labelColor: 'text-zinc-500 dark:text-zinc-400',
      trend: chartData?.map(d => d.despesas) || [0, 0, 0, 0, 0, 0],
      trendColor: '#f43f5e',
    },
    {
      name: 'Saldo Líquido',
      value: formatCurrency(balance, preferredCurrency),
      icon: Scale,
      accent: 'dark',
      bgClass: 'bg-zinc-900 dark:bg-black hover:bg-zinc-800 dark:hover:bg-zinc-950',
      iconBg: 'bg-white/10 dark:bg-zinc-800',
      iconColor: 'text-white/80 dark:text-zinc-400',
      valueColor: 'text-white',
      labelColor: 'text-zinc-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {heroCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className={clsx(
              'p-5 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-default group',
              card.bgClass,
              card.accent === 'dark' && 'dark:border-zinc-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div className={clsx('w-9 h-9 flex items-center justify-center', card.iconBg)}>
                <card.icon className={clsx('w-[18px] h-[18px]', card.iconColor)} />
              </div>
              {card.trend && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-1">
                  <Sparkline data={card.trend} color={card.trendColor} />
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className={clsx('text-[11px] uppercase tracking-wider font-medium', card.labelColor)}>
                {card.name}
              </p>
              <p className={clsx('text-2xl sm:text-3xl font-editorial font-bold tracking-tight mt-1', card.valueColor)}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gamified Health Score & Badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-3"
      >
        {/* Score Card */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 overflow-hidden relative">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
              <motion.circle
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={364}
                initial={{ strokeDashoffset: 364 }}
                animate={{ strokeDashoffset: 364 - (healthScore / 1000) * 364 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                className={clsx("transition-colors duration-500", grade.color.replace('text-', 'stroke-'))}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={clsx("text-3xl font-editorial font-bold", grade.color)}>{healthScore}</span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Score FHS</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-editorial font-bold text-zinc-900 dark:text-zinc-100">
                  Saúde Financeira: <span className={grade.color}>{grade.status}</span>
                </h3>
                <div className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", grade.color.replace('text-', 'bg-') + '/10', grade.color)}>
                  Nota {grade.label}
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Seu score baseia-se na sua taxa de economia e cumprimento de orçamentos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {healthScore >= 900 && <Badge label="Poupador de Elite" color="emerald" />}
              {healthScore >= 750 && <Badge label="Mestre do Orçamento" color="sky" />}
              {healthScore >= 600 && <Badge label="Em Equilíbrio" color="violet" />}
              <Badge label="Investidor Iniciante" color="zinc" ghost />
            </div>
          </div>

          <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <Scale size={160} />
          </div>
        </div>

        {/* Mini CTA / Next Level */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 flex flex-col justify-between text-white shadow-xl shadow-indigo-500/20">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Próximo Nível</p>
            <h4 className="text-lg font-editorial font-bold mt-1">Nível Platinum</h4>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold mb-1 opacity-80">
              <span>{healthScore}/1000</span>
              <span>{1000 - healthScore} pts para A+</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(healthScore / 1000) * 100}%` }}
                className="h-full bg-white transition-all duration-1000"
              />
            </div>
          </div>
          <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold uppercase tracking-widest transition-all">
            Ver Conquistas
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Badge({ label, color, ghost = false }: { label: string; color: string; ghost?: boolean }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    sky: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    zinc: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  };

  return (
    <div className={clsx(
      "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
      ghost ? "bg-transparent border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400" : colors[color]
    )}>
      {label}
    </div>
  );
}
