import { DashboardLayout } from '@/components/DashboardLayout';
import { Transactions } from '@/components/Transactions';
import { Plus, Filter, Download } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Transações</h1>
            <p className="text-sm text-zinc-500">Histórico completo de receitas e despesas.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Nova</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <Transactions />
        </div>
      </div>
    </DashboardLayout>
  );
}
