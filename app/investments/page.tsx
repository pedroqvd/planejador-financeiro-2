'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { TrendingUp, Shield, Zap, PieChart, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

const portfolios = [
  {
    name: 'Conservador',
    description: 'Foco em preservação de capital com baixo risco.',
    icon: Shield,
    allocation: [
      { name: 'Tesouro Direto / CDBs', value: 80 },
      { name: 'Fundos Imobiliários', value: 15 },
      { name: 'Ações', value: 5 }
    ]
  },
  {
    name: 'Moderado',
    description: 'Equilíbrio entre segurança e rentabilidade.',
    icon: PieChart,
    allocation: [
      { name: 'Renda Fixa', value: 50 },
      { name: 'Fundos Imobiliários', value: 25 },
      { name: 'Ações Nacionais', value: 15 },
      { name: 'Ações Internacionais', value: 10 }
    ]
  },
  {
    name: 'Arrojado',
    description: 'Busca por alta rentabilidade, aceitando maior volatilidade.',
    icon: Zap,
    allocation: [
      { name: 'Ações Nacionais', value: 40 },
      { name: 'Ações Internacionais', value: 30 },
      { name: 'Fundos Imobiliários', value: 20 },
      { name: 'Renda Fixa', value: 10 }
    ]
  }
];

// Simulated market / performance data
const performanceData = [
  { month: 'Set', conservador: 0.8, moderado: 1.2, arrojado: 1.8 },
  { month: 'Out', conservador: 0.9, moderado: 0.5, arrojado: -0.3 },
  { month: 'Nov', conservador: 0.7, moderado: 1.5, arrojado: 2.4 },
  { month: 'Dez', conservador: 0.85, moderado: 1.1, arrojado: 1.6 },
  { month: 'Jan', conservador: 0.9, moderado: 1.3, arrojado: 2.1 },
  { month: 'Fev', conservador: 0.78, moderado: 0.9, arrojado: -0.8 },
];

const selicHistory = [
  { month: 'Set', value: 13.25 },
  { month: 'Out', value: 12.75 },
  { month: 'Nov', value: 12.25 },
  { month: 'Dez', value: 11.75 },
  { month: 'Jan', value: 11.25 },
  { month: 'Fev', value: 10.75 },
];

function MiniBarChart({ data, maxVal }: { data: number[]; maxVal: number }) {
  return (
    <div className="flex items-end space-x-1 h-16">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(4, (Math.abs(val) / maxVal) * 100)}%` }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
          className={clsx(
            'flex-1 min-w-[8px]',
            val >= 0 ? 'bg-zinc-700' : 'bg-zinc-300'
          )}
        />
      ))}
    </div>
  );
}

function DonutChart({ allocation }: { allocation: { name: string; value: number }[] }) {
  const total = allocation.reduce((s, a) => s + a.value, 0);
  const colors = ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8'];
  let cumOffset = 0;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {allocation.map((item, i) => {
          const pct = (item.value / total) * 100;
          const dashArray = `${pct} ${100 - pct}`;
          const offset = cumOffset;
          cumOffset += pct;
          return (
            <motion.circle
              key={i}
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="3"
              strokeDasharray={dashArray}
              strokeDashoffset={`${-offset}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-editorial font-bold text-zinc-900">{total}%</span>
      </div>
    </div>
  );
}

export default function InvestmentsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Investimentos & Educação</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Aprenda conceitos básicos e descubra o portfólio ideal para seu perfil</p>
        </motion.div>

        {/* Market Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-zinc-200 p-5"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Taxa Selic</p>
            <p className="text-2xl font-editorial font-bold text-zinc-900">{selicHistory[selicHistory.length - 1].value}%</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">a.a. • Tendência de queda</p>
            <div className="mt-3 flex items-end space-x-1 h-10">
              {selicHistory.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${((s.value - 10) / 4) * 100}%` }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  className="flex-1 bg-zinc-200"
                />
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-zinc-200 p-5"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">IPCA Acumulado</p>
            <p className="text-2xl font-editorial font-bold text-zinc-900">4.56%</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">12 meses • Meta BC: 3.0%</p>
            <div className="mt-3 h-2 bg-zinc-100 w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '76%' }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="h-full bg-zinc-400"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-zinc-400">0%</span>
              <span className="text-[9px] text-zinc-400">6%</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-zinc-200 p-5"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">CDI Mensal</p>
            <p className="text-2xl font-editorial font-bold text-zinc-900">0.89%</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Referência para renda fixa</p>
            <MiniBarChart
              data={performanceData.map(d => d.conservador)}
              maxVal={2}
            />
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-zinc-200 p-6"
        >
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">Desempenho por Perfil — Últimos 6 Meses (%)</h2>
          <div className="space-y-1">
            <div className="grid grid-cols-[80px_1fr] gap-4 items-center text-[10px] text-zinc-400 uppercase tracking-wider">
              <span>Mês</span>
              <div className="grid grid-cols-6 gap-2 text-center">
                {performanceData.map(d => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>
            </div>
            {(['conservador', 'moderado', 'arrojado'] as const).map((profile, pi) => (
              <div key={profile} className="grid grid-cols-[80px_1fr] gap-4 items-center">
                <span className="text-xs text-zinc-600 capitalize">{profile}</span>
                <div className="grid grid-cols-6 gap-2">
                  {performanceData.map((d, i) => {
                    const val = d[profile];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + pi * 0.1 + i * 0.03, duration: 0.3 }}
                        className={clsx(
                          'text-center py-2 text-xs font-medium font-editorial',
                          val >= 0 ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-100 text-zinc-500'
                        )}
                      >
                        {val >= 0 ? '+' : ''}{val.toFixed(1)}%
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-4 text-[10px] text-zinc-400 uppercase tracking-wider">
            <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-zinc-50 border border-zinc-200" /><span>Positivo</span></div>
            <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-zinc-100" /><span>Negativo</span></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white border border-zinc-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                <Shield className="w-5 h-5 text-zinc-600" />
              </div>
              <h2 className="text-lg font-editorial font-bold text-zinc-900">Renda Fixa</h2>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Investimentos onde a regra de remuneração é definida no momento da aplicação. Você sabe exatamente como seu dinheiro vai render. Exemplos: Tesouro Direto, CDBs, LCI/LCA.
            </p>
            <ul className="text-sm text-zinc-500 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-zinc-400" />
                <span>Baixo risco e alta previsibilidade</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-zinc-400" />
                <span>Ideal para reserva de emergência</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-white border border-zinc-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-zinc-600" />
              </div>
              <h2 className="text-lg font-editorial font-bold text-zinc-900">Renda Variável</h2>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Investimentos cuja rentabilidade não pode ser prevista no momento da aplicação, pois varia conforme as condições do mercado. Exemplos: Ações, Fundos Imobiliários (FIIs), Criptomoedas.
            </p>
            <ul className="text-sm text-zinc-500 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-zinc-400" />
                <span>Maior potencial de retorno a longo prazo</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-zinc-400" />
                <span>Requer maior tolerância à volatilidade</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-zinc-900 p-8 text-white"
        >
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-xl font-editorial font-bold mb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-zinc-400" />
                <span>A Importância da Diversificação</span>
              </h2>
              <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                &quot;Não coloque todos os ovos na mesma cesta.&quot; Diversificar significa distribuir seus investimentos em diferentes classes de ativos para reduzir riscos e otimizar retornos.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-white text-zinc-900 text-xs font-medium uppercase tracking-wider hover:bg-zinc-100 transition-all whitespace-nowrap">
              Fazer Teste de Perfil
            </button>
          </div>
        </motion.div>

        <div>
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">Portfólios de Exemplo por Perfil</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio, portfolioIndex) => (
              <motion.div
                key={portfolio.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + portfolioIndex * 0.1, duration: 0.4 }}
                className="bg-white border border-zinc-200 p-6 flex flex-col"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center">
                    <portfolio.icon className="w-5 h-5 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-editorial font-bold text-zinc-900">{portfolio.name}</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-4">{portfolio.description}</p>

                {/* Donut chart */}
                <DonutChart allocation={portfolio.allocation} />

                <div className="space-y-4 mt-6">
                  {portfolio.allocation.map((item, itemIndex) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2" style={{ backgroundColor: ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8'][itemIndex % 4] }} />
                          <span className="text-zinc-700">{item.name}</span>
                        </div>
                        <span className="font-editorial font-bold text-zinc-900">{item.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ delay: 0.6 + portfolioIndex * 0.1 + itemIndex * 0.05, duration: 0.8, ease: 'easeOut' }}
                          className={clsx(
                            'h-full',
                            portfolioIndex === 0 ? 'bg-zinc-400' : portfolioIndex === 1 ? 'bg-zinc-600' : 'bg-zinc-900'
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
