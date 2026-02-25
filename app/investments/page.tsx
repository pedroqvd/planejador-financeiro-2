import { DashboardLayout } from '@/components/DashboardLayout';
import { TrendingUp, Shield, Zap, PieChart, BookOpen, ArrowRight } from 'lucide-react';

const portfolios = [
  {
    name: 'Conservador',
    description: 'Foco em preservação de capital com baixo risco.',
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    allocation: [
      { name: 'Tesouro Direto / CDBs', value: 80, color: 'bg-emerald-500' },
      { name: 'Fundos Imobiliários', value: 15, color: 'bg-emerald-400' },
      { name: 'Ações', value: 5, color: 'bg-emerald-300' }
    ]
  },
  {
    name: 'Moderado',
    description: 'Equilíbrio entre segurança e rentabilidade.',
    icon: PieChart,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    allocation: [
      { name: 'Renda Fixa', value: 50, color: 'bg-indigo-500' },
      { name: 'Fundos Imobiliários', value: 25, color: 'bg-indigo-400' },
      { name: 'Ações Nacionais', value: 15, color: 'bg-indigo-300' },
      { name: 'Ações Internacionais', value: 10, color: 'bg-indigo-200' }
    ]
  },
  {
    name: 'Arrojado',
    description: 'Busca por alta rentabilidade, aceitando maior volatilidade.',
    icon: Zap,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    allocation: [
      { name: 'Ações Nacionais', value: 40, color: 'bg-rose-500' },
      { name: 'Ações Internacionais', value: 30, color: 'bg-rose-400' },
      { name: 'Fundos Imobiliários', value: 20, color: 'bg-rose-300' },
      { name: 'Renda Fixa', value: 10, color: 'bg-rose-200' }
    ]
  }
];

export default function InvestmentsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Investimentos & Educação</h1>
          <p className="text-sm text-zinc-500 mt-1">Aprenda conceitos básicos e descubra o portfólio ideal para seu perfil.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">Renda Fixa</h2>
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
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">Renda Variável</h2>
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
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-8 text-white">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>A Importância da Diversificação</span>
              </h2>
              <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                "Não coloque todos os ovos na mesma cesta." Diversificar significa distribuir seus investimentos em diferentes classes de ativos para reduzir riscos e otimizar retornos.
              </p>
            </div>
            <button className="px-4 py-2 bg-white text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors whitespace-nowrap">
              Fazer Teste de Perfil
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Portfólios de Exemplo por Perfil</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div key={portfolio.name} className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${portfolio.bg}`}>
                    <portfolio.icon className={`w-5 h-5 ${portfolio.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900">{portfolio.name}</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-6">{portfolio.description}</p>
                
                <div className="space-y-4 mt-auto">
                  {portfolio.allocation.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700">{item.name}</span>
                        <span className="font-medium text-zinc-900">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
