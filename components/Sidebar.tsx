'use client';

import {
  LayoutDashboard,
  Wallet,
  PieChart,
  Target,
  ArrowLeftRight,
  Settings,
  LogOut,
  Sparkles,
  X,
  CreditCard,
  BarChart3,
  RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Faturas', href: '/faturas', icon: CreditCard },
  { name: 'Orçamento', href: '/budget', icon: Wallet },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Assinaturas', href: '/recorrencias', icon: RefreshCcw },
  { name: 'Investimentos', href: '/investments', icon: PieChart },
  { name: 'Objetivos', href: '/goals', icon: Target },
  { name: 'Plano Pro ✨', href: '/upgrade', icon: Sparkles },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="p-6 pt-8 pb-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/icon.png" alt="WealthCash Logo" className="w-8 h-8 rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-color)' }} />
          <span className="text-xl font-editorial font-bold tracking-tight text-zinc-900">WealthCash</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
                onClick={onClose}
                className={clsx(
                  'relative flex items-center space-x-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-zinc-900 bg-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-900"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={clsx(
                  'w-[18px] h-[18px] transition-colors duration-200',
                  isActive ? 'text-zinc-900' : 'text-zinc-400'
                )} />
                <span>{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 space-y-1">
        <Link
          href="/settings"
          onClick={onClose}
          className={clsx(
            'flex items-center space-x-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200',
            pathname === '/settings'
              ? 'text-zinc-900 bg-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
          )}
        >
          <Settings className={clsx('w-[18px] h-[18px]', pathname === '/settings' ? 'text-zinc-900' : 'text-zinc-400')} />
          <span>Configurações</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-none text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] text-zinc-400" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );
}

// Desktop sidebar
export function Sidebar() {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="hidden md:flex flex-col w-64 h-full border-r border-zinc-200"
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      <SidebarContent />
    </motion.div>
  );
}

// Mobile sidebar overlay
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden border-r border-zinc-200"
            style={{ backgroundColor: 'var(--bg-sidebar)' }}
          >
            <SidebarContent onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
