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

type ChartData = { name: string; receitas: number; despesas: number }[];

const CustomTooltip = ({ active, payload, label, preferredCurrency = 'BRL' }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string; preferredCurrency?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
      >
        <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center space-x-2 mb-1 last:mb-0">
            <div className="w-2 h-2" style={{ backgroundColor: item.dataKey === 'receitas' ? '#10b981' : '#f43f5e' }} />
            <span className="text-sm font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
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
      <div className="h-full flex items-end space-x-3 px-4 pb-6">
        {[65, 40, 80, 55, 70, 45].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center space-y-2">
            <div className="w-full bg-zinc-100" style={{ height: `${h}%` }} />
            <div className="h-3 w-6 bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Charts({ data, loading, onSelect, preferredCurrency = 'BRL' }: { data: ChartData; loading?: boolean; onSelect?: (monthName: string) => void; preferredCurrency?: string }) {
  const hasData = data.some(d => d.receitas > 0 || d.despesas > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="card-editorial p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
            Receitas vs Despesas
          </h2>
          <p className="text-[11px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
            Últimos 6 meses
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-[2px]" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Receitas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-[2px]" style={{ backgroundColor: '#f43f5e' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Despesas</span>
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
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-color)" strokeOpacity={0.5} />
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
                activeDot={{ r: 4, fill: '#10b981', stroke: 'var(--bg-card)', strokeWidth: 2 }}
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
                activeDot={{ r: 4, fill: '#f43f5e', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                cursor="pointer"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Adicione transações para ver o gráfico
          </div>
        )}
      </div>
    </motion.div>
  );
}
