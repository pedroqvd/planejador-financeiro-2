import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Charts } from '@/components/Charts';
import { Transactions } from '@/components/Transactions';
import { AIAdvisor } from '@/components/AIAdvisor';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Visão Geral</h1>
          <div className="text-sm text-zinc-500">
            Atualizado hoje às 09:41
          </div>
        </div>
        <DashboardOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Charts />
            <Transactions />
          </div>
          <div className="space-y-6">
            <AIAdvisor />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
