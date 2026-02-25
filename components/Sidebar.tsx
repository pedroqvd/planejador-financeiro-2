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
import { motion } from 'motion/react';

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
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="hidden md:flex flex-col w-64 h-full"
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      <div className="p-6 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
          <PieChart className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">WealthCash</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={clsx(
                  'relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                    : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={clsx(
                  'w-5 h-5 transition-colors duration-200',
                  isActive ? 'text-indigo-400' : 'text-slate-500'
                )} />
                <span>{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-all duration-200"
        >
          <Settings className="w-5 h-5 text-slate-500" />
          <span>Configurações</span>
        </Link>
        <button
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-slate-500" />
          <span>Sair</span>
        </button>
      </div>
    </motion.div>
  );
}
