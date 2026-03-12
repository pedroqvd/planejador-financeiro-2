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
  RefreshCcw,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

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

function SidebarContent({ onClose, collapsed, onToggleCollapse }: { onClose?: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Header / Logo */}
      <div className={clsx("flex items-center justify-between", collapsed ? "p-3 pt-8 pb-6" : "p-6 pt-10 pb-8")}>
        <Link href="/" className={clsx("flex items-center group cursor-pointer transition-all hover:opacity-80 focus:outline-none", collapsed ? "justify-center w-full" : "space-x-4")}>
          <div className={clsx(
            "p-2.5 rounded-2xl transition-all duration-500 shadow-xl group-hover:shadow-indigo-500/40",
            "bg-gradient-to-br from-indigo-600 to-violet-700"
          )}>
            <Logo className="w-6 h-6 text-white transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-xl font-editorial font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                WealthCash
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                Premium
              </span>
            </motion.div>
          )}
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={clsx("flex-1 space-y-1.5 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              className="relative"
            >
              <Link
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={clsx(
                  'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300',
                  collapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3',
                  isActive
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-400/10'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="pill-indicator"
                    className="absolute inset-0 bg-zinc-900/5 dark:bg-white/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {isActive && (
                  <motion.div
                    layoutId="sidebar-line-indicator"
                    className="absolute left-0 top-3 bottom-3 w-[3px] bg-zinc-900 dark:bg-indigo-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <item.icon className={clsx(
                  'w-[18px] h-[18px] transition-all duration-300 group-hover:scale-110 relative z-10 flex-shrink-0',
                  isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                )} />
                {!collapsed && <span className="relative z-10 whitespace-nowrap">{item.name}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={clsx("border-t border-zinc-200 dark:border-zinc-800 space-y-2", collapsed ? "p-2" : "p-4")}>
        {/* Collapse toggle (desktop only) */}
        {onToggleCollapse && (
          <div className={clsx("flex", collapsed ? "justify-center" : "justify-end mb-2")}>
            <button
              onClick={onToggleCollapse}
              className={clsx(
                'group p-2.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700',
                !collapsed && 'mr-2'
              )}
              title={collapsed ? 'Expandir menu' : 'Minimizar menu'}
            >
              {collapsed ? (
                <ChevronsRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              ) : (
                <ChevronsLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              )}
            </button>
          </div>
        )}
        <Link
          href="/settings"
          onClick={onClose}
          title={collapsed ? 'Configurações' : undefined}
          className={clsx(
            'flex items-center rounded-xl text-sm font-medium transition-all duration-200',
            collapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3',
            pathname === '/settings'
              ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-900/5 dark:bg-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-400/10'
          )}
        >
          <Settings className={clsx('w-[18px] h-[18px] flex-shrink-0', pathname === '/settings' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400')} />
          {!collapsed && <span>Configurações</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title={collapsed ? 'Sair' : undefined}
          className={clsx(
            'w-full flex items-center rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-400/10 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200',
            collapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'
          )}
        >
          <LogOut className="w-[18px] h-[18px] text-zinc-400 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </>
  );
}

// Desktop sidebar with collapse
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wc-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('wc-sidebar-collapsed', String(next));
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="hidden md:flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl bg-white/80 dark:bg-black/80"
      style={{ width: collapsed ? 72 : 256 }}
    >
      <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} />
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
            className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-md md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden border-r border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl bg-white/90 dark:bg-zinc-950/90 shadow-2xl"
          >
            <SidebarContent onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
