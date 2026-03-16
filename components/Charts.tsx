'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

type ChartData = { name: string; receitas: number; despesas: number }[];

const CustomTooltip = ({ active, payload, label, preferredCurrency = 'BRL' }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string; preferredCurrency?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-lg"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dataKey === 'receitas' ? '#10b981' : '#f43f5e' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {item.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}
            </span>
            <span className="text-sm font-editorial font-bold ml-auto" style={{ color: 'var(--text-primary)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, maximumFractionDigits: 0 }).format(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function ChartSkeleton() {
  return (
    <div className="h-[280px] w-full animate-pulse">
      <div className="h-full flex items-end gap-3 px-4 pb-6">
        {[65, 40, 80, 55, 70, 45].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full rounded-sm" style={{ height: `${h}%`, backgroundColor: 'var(--border-color)', opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[280px] w-full flex flex-col items-center justify-center gap-3">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px dashed var(--border-color)' }}
      >
        <BarChart3 className="w-6 h-6" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-editorial font-semibold" style={{ color: 'var(--text-primary)' }}>
          Sem dados ainda
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Adicione transacoes para visualizar o grafico
        </p>
      </div>
    </div>
  );
}

export function Charts({ data, loading, onSelect, preferredCurrency = 'BRL' }: { data: ChartData; loading?: boolean; onSelect?: (monthName: string) => void; preferredCurrency?: string }) {
  const hasData = data.some(d => d.receitas > 0 || d.despesas > 0);

  // Calculate totals for the legend
  const totalReceitas = data.reduce((sum, d) => sum + d.receitas, 0);
  const totalDespesas = data.reduce((sum, d) => sum + d.despesas, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="card-editorial p-6 relative overflow-hidden"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--accent-ink)', opacity: 0.3 }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
            Receitas vs Despesas
          </h2>
          <p className="text-[11px] uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Ultimos 6 meses
          </p>
        </div>

        {/* Legend with totals */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Receitas</span>
            </div>
            {hasData && (
              <span className="text-xs font-editorial font-bold" style={{ color: '#10b981' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, maximumFractionDigits: 0 }).format(totalReceitas)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f43f5e' }} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Despesas</span>
            </div>
            {hasData && (
              <span className="text-xs font-editorial font-bold" style={{ color: '#f43f5e' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, maximumFractionDigits: 0 }).format(totalDespesas)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {loading ? (
          <ChartSkeleton />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activeLabel) onSelect?.(String(e.activeLabel));
              }}
            >
              <defs>
                <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-color)" strokeOpacity={0.3} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip preferredCurrency={preferredCurrency} />} />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradReceitas)"
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                cursor="pointer"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradDespesas)"
                dot={false}
                activeDot={{ r: 5, fill: '#f43f5e', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                cursor="pointer"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>
    </motion.div>
  );
}
