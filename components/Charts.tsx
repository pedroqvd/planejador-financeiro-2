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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 px-4 py-3 shadow-md">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center space-x-2 mb-1 last:mb-0">
            <div className={`w-2 h-2 ${item.dataKey === 'receitas' ? 'bg-zinc-900' : 'bg-zinc-400'}`} />
            <span className="text-sm font-editorial font-bold text-zinc-800">
              R$ {item.value.toLocaleString('pt-BR')}
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
    <div className="h-[300px] w-full animate-pulse">
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

export function Charts({ data, loading }: { data: ChartData; loading?: boolean }) {
  const hasData = data.some(d => d.receitas > 0 || d.despesas > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white p-6 border border-zinc-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-editorial font-bold text-zinc-900">Receitas vs Despesas</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Últimos 6 meses</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-[2px] bg-zinc-900" />
            <span className="text-zinc-600 text-xs font-medium">Receitas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-[2px] bg-zinc-400" />
            <span className="text-zinc-600 text-xs font-medium">Despesas</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {loading ? (
          <ChartSkeleton />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receitas" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitas)" dot={false} activeDot={{ r: 4, fill: '#18181b', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="despesas" stroke="#a1a1aa" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" dot={false} activeDot={{ r: 4, fill: '#a1a1aa', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
            Adicione transações para ver o gráfico
          </div>
        )}
      </div>
    </motion.div>
  );
}
