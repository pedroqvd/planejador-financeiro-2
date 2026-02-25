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
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    allocation: [
      { name: 'Tesouro Direto / CDBs', value: 80, from: 'from-emerald-400', to: 'to-emerald-600' },
      { name: 'Fundos Imobiliários', value: 15, from: 'from-emerald-300', to: 'to-emerald-500' },
      { name: 'Ações', value: 5, from: 'from-emerald-200', to: 'to-emerald-400' }
    ]
  },
  {
    name: 'Moderado',
    description: 'Equilíbrio entre segurança e rentabilidade.',
    icon: PieChart,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    allocation: [
      { name: 'Renda Fixa', value: 50, from: 'from-indigo-400', to: 'to-indigo-600' },
      { name: 'Fundos Imobiliários', value: 25, from: 'from-indigo-300', to: 'to-indigo-500' },
      { name: 'Ações Nacionais', value: 15, from: 'from-indigo-200', to: 'to-indigo-400' },
      { name: 'Ações Internacionais', value: 10, from: 'from-violet-300', to: 'to-violet-500' }
    ]
  },
  {
    name: 'Arrojado',
    description: 'Busca por alta rentabilidade, aceitando maior volatilidade.',
    icon: Zap,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    allocation: [
      { name: 'Ações Nacionais', value: 40, from: 'from-rose-400', to: 'to-rose-600' },
      { name: 'Ações Internacionais', value: 30, from: 'from-rose-300', to: 'to-rose-500' },
      { name: 'Fundos Imobiliários', value: 20, from: 'from-pink-300', to: 'to-pink-500' },
      { name: 'Renda Fixa', value: 10, from: 'from-pink-200', to: 'to-pink-400' }
    ]
  }
];

export default function InvestmentsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Investimentos & Educação</h1>
          <p className="text-sm text-zinc-500 mt-1">Aprenda conceitos básicos e descubra o portfólio ideal para seu perfil.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm card-hover"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Renda Fixa</h2>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Investimentos onde a regra de remuneração é definida no momento da aplicação. Você sabe exatamente como seu dinheiro vai render. Exemplos: Tesouro Direto, CDBs, LCI/LCA.
            </p>
            <ul className="text-sm text-zinc-500 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Baixo risco e alta previsibilidade</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Ideal para reserva de emergência</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm card-hover"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Renda Variável</h2>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Investimentos cuja rentabilidade não pode ser prevista no momento da aplicação, pois varia conforme as condições do mercado. Exemplos: Ações, Fundos Imobiliários (FIIs), Criptomoedas.
            </p>
            <ul className="text-sm text-zinc-500 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Maior potencial de retorno a longo prazo</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Requer maior tolerância à volatilidade</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-8 text-white shadow-xl shadow-slate-900/10"
        >
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>A Importância da Diversificação</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                &quot;Não coloque todos os ovos na mesma cesta.&quot; Diversificar significa distribuir seus investimentos em diferentes classes de ativos para reduzir riscos e otimizar retornos.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-white text-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-all duration-200 whitespace-nowrap hover:shadow-lg hover:-translate-y-0.5">
              Fazer Teste de Perfil
            </button>
          </div>
        </motion.div>

        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Portfólios de Exemplo por Perfil</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio, portfolioIndex) => (
              <motion.div
                key={portfolio.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + portfolioIndex * 0.1, duration: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-sm flex flex-col card-hover"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', portfolio.bg)}>
                    <portfolio.icon className={clsx('w-5 h-5', portfolio.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{portfolio.name}</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-6">{portfolio.description}</p>

                <div className="space-y-4 mt-auto">
                  {portfolio.allocation.map((item, itemIndex) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700">{item.name}</span>
                        <span className="font-bold text-zinc-900">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ delay: 0.6 + portfolioIndex * 0.1 + itemIndex * 0.05, duration: 0.8, ease: 'easeOut' }}
                          className={clsx('h-full rounded-full bg-gradient-to-r', item.from, item.to)}
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
