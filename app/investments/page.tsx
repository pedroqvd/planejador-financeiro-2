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
                <p className="text-sm text-zinc-500 mb-6">{portfolio.description}</p>

                <div className="space-y-4 mt-auto">
                  {portfolio.allocation.map((item, itemIndex) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700">{item.name}</span>
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
