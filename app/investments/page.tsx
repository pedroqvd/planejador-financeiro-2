'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { TrendingUp, Shield, PieChart, DollarSign, Calculator, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';

const evolutionData = [
  { month: 'Jan', patrimônio: 100000 },
  { month: 'Fev', patrimônio: 105000 },
  { month: 'Mar', patrimônio: 108000 },
  { month: 'Abr', patrimônio: 112000 },
  { month: 'Mai', patrimônio: 120000 },
  { month: 'Jun', patrimônio: 125000 },
  { month: 'Jul', patrimônio: 132000 },
  { month: 'Ago', patrimônio: 136000 },
  { month: 'Set', patrimônio: 142500 }
];

const allocationData = [
  { name: 'Renda Fixa', value: 60, color: '#18181b' },
  { name: 'Ações', value: 20, color: '#52525b' },
  { name: 'FIIs', value: 15, color: '#a1a1aa' },
  { name: 'Cripto', value: 5, color: '#e4e4e7' }
];

export default function InvestmentsPage() {
  const [simInitial, setSimInitial] = useState<number | ''>(10000);
  const [simMonthly, setSimMonthly] = useState<number | ''>(1000);
  const [simYears, setSimYears] = useState<number | ''>(10);
  const [simRate, setSimRate] = useState<number | ''>(12);

  // Calculate compound interest
  const calcFutureValue = () => {
    const p = Number(simInitial) || 0;
    const pmt = Number(simMonthly) || 0;
    const n = (Number(simYears) || 0) * 12;
    const i = (Number(simRate) || 0) / 100 / 12;

    if (i === 0) return p + (pmt * n);
    return p * Math.pow(1 + i, n) + (pmt * (Math.pow(1 + i, n) - 1)) / i;
  };

  const calcTotalInvested = () => {
    const p = Number(simInitial) || 0;
    const pmt = Number(simMonthly) || 0;
    const n = (Number(simYears) || 0) * 12;
    return p + (pmt * n);
  };

  const finalValue = calcFutureValue();
  const totalInvested = calcTotalInvested();
  const totalInterest = finalValue - totalInvested;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Dashboard de Investimentos</h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Acompanhe sua carteira e simule seu futuro</p>
          </div>
          <button className="bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Novo Aporte
          </button>
        </motion.div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-zinc-200 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center bg-zinc-50">
                <PieChart className="w-5 h-5 text-zinc-700" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 14.5% a.a.
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Patrimônio Investido</p>
            <p className="text-3xl font-editorial font-bold text-zinc-900 mt-1">R$ 142.500,00</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-zinc-200 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center bg-zinc-50">
                <TrendingUp className="w-5 h-5 text-zinc-700" />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Rentabilidade (Mês)</p>
            <p className="text-3xl font-editorial font-bold text-zinc-900 mt-1">+ R$ 1.850,00</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-zinc-900 text-white p-5 flex flex-col justify-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-2">Perfil do Investidor</p>
            <h3 className="text-2xl font-editorial font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-zinc-300" />
              Moderado
            </h3>
            <p className="text-xs text-zinc-400 mt-2">Sua carteira está balanceada de acordo com seu perfil de risco atual.</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white border border-zinc-200 p-6">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">Evolução do Patrimônio</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '0px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Patrimônio']}
                  />
                  <Area type="monotone" dataKey="patrimônio" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorPatrimonio)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white border border-zinc-200 p-6">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">Alocação Atual</h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '0px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value}%`, 'Alocação']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-6">
              {allocationData.map((item, i) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-600">{item.name}</span>
                  </div>
                  <span className="font-editorial font-bold text-zinc-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Compound Interest Simulator */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-zinc-200 overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <h2 className="text-sm font-editorial font-bold text-zinc-900">Simulador de Juros Compostos</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Projete seu futuro financeiro</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Valor Inicial (R$)</label>
                <input
                  type="number"
                  value={simInitial}
                  onChange={(e) => setSimInitial(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Aporte Mensal (R$)</label>
                <input
                  type="number"
                  value={simMonthly}
                  onChange={(e) => setSimMonthly(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Prazo (Anos)</label>
                  <input
                    type="number"
                    value={simYears}
                    onChange={(e) => setSimYears(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Taxa Ano (%)</label>
                  <input
                    type="number"
                    value={simRate}
                    onChange={(e) => setSimRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 text-white p-6 md:p-8 flex flex-col justify-center border-l-4 border-emerald-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
                <TrendingUp className="w-64 h-64" />
              </div>

              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1 relative z-10">Valor Final Estimado</p>
              <p className="text-4xl md:text-5xl font-editorial font-bold text-emerald-400 mb-6 relative z-10">
                R$ {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800 relative z-10">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Investido</p>
                  <p className="text-lg font-editorial font-bold">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total em Juros</p>
                  <p className="text-lg font-editorial font-bold text-emerald-400">+ R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
