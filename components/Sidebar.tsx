'use client';

import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Target, 
  ArrowLeftRight, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Orçamento', href: '/budget', icon: Wallet },
  { name: 'Investimentos', href: '/investments', icon: PieChart },
  { name: 'Objetivos', href: '/goals', icon: Target },
  { name: 'IA Advisor', href: '/advisor', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 h-full">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
          <PieChart className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-zinc-900">Fin360</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-zinc-100 text-zinc-900' 
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <item.icon className={clsx('w-5 h-5', isActive ? 'text-zinc-900' : 'text-zinc-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 space-y-1">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <Settings className="w-5 h-5 text-zinc-400" />
          <span>Configurações</span>
        </Link>
        <button
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="w-5 h-5 text-zinc-400" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
