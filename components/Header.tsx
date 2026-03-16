'use client';

import { Bell, Search, Menu, LogOut, X, AlertTriangle, CheckCircle, Info, Moon, Sun, Star, Sparkles } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import { clsx } from 'clsx';

type SearchResult = {
  transactions: { id: string; name: string; category: string; amount: number; type: string; date: string }[];
  pages: { name: string; path: string }[];
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
};

const notifIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name || 'Usuário';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const plan = session?.user?.plan || 'free';
  const { theme, toggleTheme } = useTheme();

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifsLoaded, setNotifsLoaded] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch { /* ignore */ }
    finally { setNotifsLoaded(true); }
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (id === 'all') {
        setNotifications([]);
      } else {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch { /* ignore */ }
  };

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // Search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setShowResults(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      }
    } catch { /* ignore */ }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setShowResults(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigateTo = (path: string) => {
    clearSearch();
    router.push(path);
  };

  return (
    <header className="h-14 sm:h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 mr-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => results && setShowResults(true)}
            className="block w-full pl-10 pr-8 py-2 border-0 border-b border-zinc-200 bg-transparent rounded-none leading-5 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 sm:text-sm transition-all duration-300"
            placeholder="Buscar transações, categorias..."
          />
          {query && (
            <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <X className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-700" />
            </button>
          )}

          {showResults && results && (
            <div className="dropdown-panel absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto z-50">
              {results.pages.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-wider font-medium px-2 py-1" style={{ color: 'var(--text-secondary)' }}>Páginas</p>
                  {results.pages.map((page) => (
                    <button key={page.path} onClick={() => navigateTo(page.path)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
              {results.transactions.length > 0 && (
                <div className="p-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <p className="text-[10px] uppercase tracking-wider font-medium px-2 py-1" style={{ color: 'var(--text-secondary)' }}>Transações</p>
                  {results.transactions.map((tx) => (
                    <button key={tx.id} onClick={() => navigateTo('/transactions')} className="w-full text-left px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.name}</p>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{tx.category}</p>
                      </div>
                      <span className="text-xs font-editorial font-bold" style={{ color: tx.type === 'income' ? '#10b981' : '#f43f5e' }}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.transactions.length === 0 && results.pages.length === 0 && (
                <div className="p-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                  Nenhum resultado para &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Dark mode toggle */}
        <motion.button
          onClick={toggleTheme}
          className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors duration-200 hover:bg-zinc-100 rounded-full"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-zinc-500 hover:text-zinc-900 relative transition-colors duration-200 hover:bg-zinc-100 rounded-full"
          >
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2" style={{ backgroundColor: 'var(--accent-ink)', ringColor: 'var(--bg-card)' }} />
            )}
            <Bell className="w-[18px] h-[18px]" />
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="dropdown-panel absolute right-0 top-full mt-2 w-80 z-50"
              >
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Notificações</h3>
                  {notifications.length > 0 && (
                    <button onClick={() => markAsRead('all')} className="text-[10px] uppercase tracking-wider transition-colors hover:opacity-70" style={{ color: 'var(--accent-ink)' }}>
                      Marcar lidas
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {!notifsLoaded ? (
                    <div className="p-4 text-center">
                      <div className="h-4 w-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-ink)' }} />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma notificação</p>
                      <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>Tudo em dia!</p>
                    </div>
                  ) : (
                    notifications.map((n: Notification) => {
                      const IconComp = notifIcons[n.type] || Info;
                      return (
                        <div key={n.id} className="px-4 py-3 hover:bg-zinc-50 transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <div className="flex items-start space-x-3 relative group">
                            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{n.time}</p>
                            </div>
                            <button onClick={() => markAsRead(n.id)} className="btn-close absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 transition-all">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5 border-l border-zinc-200 dark:border-zinc-800 pl-3 sm:pl-5">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-editorial font-bold text-zinc-900 dark:text-zinc-100">{userName}</span>
            <div className="flex justify-end mt-0.5">
              {plan === 'premium' ? (
                <span className="relative inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-sm overflow-hidden group/badge">
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 1 }}
                    className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -skew-x-12"
                  />
                  <Star className="w-2 h-2 mr-1 fill-current relative z-10" />
                  <span className="relative z-10">Premium</span>
                </span>
              ) : plan === 'pro' ? (
                <span className="relative inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
                    className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12"
                  />
                  <Sparkles className="w-2 h-2 mr-1 fill-current relative z-10" />
                  <span className="relative z-10">Pro</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Free
                </span>
              )}
            </div>
          </div>

          <div className={clsx(
            "relative p-0.5 rounded-full",
            plan === 'premium' ? "bg-gradient-to-tr from-amber-400 to-amber-200 shadow-sm" :
              plan === 'pro' ? "bg-gradient-to-tr from-indigo-400 to-indigo-200 shadow-sm" :
                "bg-zinc-200 dark:bg-zinc-700"
          )}>
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
              {session?.user?.image ? (
                <Image src={session.user.image} alt={userName} fill className="object-cover" />
              ) : (
                <span className="text-sm font-bold font-editorial text-zinc-900 dark:text-zinc-100">{initials}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all duration-200 hidden sm:block"
            title="Sair"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
