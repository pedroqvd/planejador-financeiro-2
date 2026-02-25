import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, Upload, Home, ShoppingCart, Car, Coffee, Wallet } from 'lucide-react';

const categories = [
  { name: 'Moradia', icon: Home, spent: 2500, limit: 3000, color: 'bg-purple-500' },
  { name: 'Alimentação', icon: ShoppingCart, spent: 1200, limit: 1500, color: 'bg-orange-500' },
  { name: 'Transporte', icon: Car, spent: 400, limit: 600, color: 'bg-blue-500' },
  { name: 'Lazer', icon: Coffee, spent: 800, limit: 500, color: 'bg-amber-500' },
  { name: 'Outros', icon: Wallet, spent: 200, limit: 400, color: 'bg-zinc-500' },
];

export default function BudgetPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Orçamento</h1>
            <p className="text-sm text-zinc-500">Gerencie seus limites de gastos por categoria.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Importar Extrato</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 mb-6">Progresso por Categoria</h2>
              <div className="space-y-6">
                {categories.map((cat) => {
                  const percentage = Math.min((cat.spent / cat.limit) * 100, 100);
                  const isOverBudget = cat.spent > cat.limit;
                  
                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100`}>
                            <cat.icon className="w-5 h-5 text-zinc-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{cat.name}</p>
                            <p className="text-xs text-zinc-500">
                              {percentage.toFixed(0)}% do limite utilizado
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isOverBudget ? 'text-rose-600' : 'text-zinc-900'}`}>
                            R$ {cat.spent.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-zinc-500">
                            de R$ {cat.limit.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500' : cat.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Resumo do Mês</h2>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-sm text-zinc-500 mb-1">Total Gasto</p>
                  <p className="text-2xl font-semibold text-zinc-900">R$ 5.100,00</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-sm text-zinc-500 mb-1">Orçamento Total</p>
                  <p className="text-2xl font-semibold text-zinc-900">R$ 6.000,00</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-sm text-emerald-600 mb-1">Disponível</p>
                  <p className="text-2xl font-semibold text-emerald-700">R$ 900,00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
