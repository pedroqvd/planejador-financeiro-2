'use client';

import { Bell, Search, Menu, LogOut, X, AlertTriangle, CheckCircle, Info, Moon, Sun } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

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
    debounceRef.current = window.setTimeout(() => doSearch(val), 300) as any;
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 shadow-lg max-h-80 overflow-y-auto z-50">
              {results.pages.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium px-2 py-1">Páginas</p>
                  {results.pages.map((page) => (
                    <button key={page.path} onClick={() => navigateTo(page.path)} className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
              {results.transactions.length > 0 && (
                <div className="p-2 border-t border-zinc-100">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium px-2 py-1">Transações</p>
                  {results.transactions.map((tx) => (
                    <button key={tx.id} onClick={() => navigateTo('/transactions')} className="w-full text-left px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-800 font-medium">{tx.name}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{tx.category}</p>
                      </div>
                      <span className={`text-xs font-editorial font-bold ${tx.type === 'income' ? 'text-zinc-900' : 'text-zinc-500'}`}>
                        {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.transactions.length === 0 && results.pages.length === 0 && (
                <div className="p-4 text-sm text-zinc-400 text-center">
                  Nenhum resultado para &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors duration-200 hover:bg-zinc-100 rounded-full"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-zinc-500 hover:text-zinc-900 relative transition-colors duration-200 hover:bg-zinc-100 rounded-full"
          >
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-zinc-900 ring-2 ring-white" />
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
                className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 shadow-xl z-50"
              >
                <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xs font-medium text-zinc-900 uppercase tracking-wider">Notificações</h3>
                  {notifications.length > 0 && (
                    <button onClick={() => markAsRead('all')} className="text-[10px] text-zinc-500 hover:text-zinc-900 uppercase tracking-wider transition-colors">
                      Marcar lídas
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {!notifsLoaded ? (
                    <div className="p-4 text-center">
                      <div className="h-4 w-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-zinc-400">Nenhuma notificação</p>
                      <p className="text-[10px] text-zinc-300 uppercase tracking-wider mt-1">Tudo em dia!</p>
                    </div>
                  ) : (
                    notifications.map((n: any) => {
                      const IconComp = notifIcons[n.type] || Info;
                      return (
                        <div key={n.id} className="px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                          <div className="flex items-start space-x-3 relative group">
                            <div className="w-7 h-7 border border-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <IconComp className="w-3.5 h-3.5 text-zinc-500" />
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                              <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">{n.time}</p>
                            </div>
                            <button onClick={() => markAsRead(n.id)} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-900 transition-all">
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

        <div className="flex items-center space-x-2 sm:space-x-4 border-l border-zinc-200 pl-2 sm:pl-4">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-editorial font-bold text-zinc-900">{userName}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              {plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
            {session?.user?.image ? (
              <Image src={session.user.image} alt={userName} fill className="object-cover" />
            ) : (
              <span className="text-xs font-bold font-editorial text-zinc-900">{initials}</span>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-all duration-200 hidden sm:block"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
