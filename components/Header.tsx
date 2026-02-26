'use client';

import { Bell, Search, Menu, LogOut, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type SearchResult = {
  transactions: { id: string; name: string; category: string; amount: number; type: string; date: string }[];
  pages: { name: string; path: string }[];
};

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name || 'Usuário';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const plan = session?.user?.plan || 'free';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
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
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-700" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && results && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 shadow-lg max-h-80 overflow-y-auto z-50">
              {results.pages.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium px-2 py-1">Páginas</p>
                  {results.pages.map((page) => (
                    <button
                      key={page.path}
                      onClick={() => navigateTo(page.path)}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
              {results.transactions.length > 0 && (
                <div className="p-2 border-t border-zinc-100">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium px-2 py-1">Transações</p>
                  {results.transactions.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => navigateTo('/transactions')}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between"
                    >
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
        <button className="p-2 text-zinc-500 hover:text-zinc-900 relative transition-colors duration-200 hover:bg-zinc-100 rounded-full">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-zinc-900 ring-2 ring-white" />
          <Bell className="w-[18px] h-[18px]" />
        </button>

        <div className="flex items-center space-x-2 sm:space-x-4 border-l border-zinc-200 pl-2 sm:pl-4">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-editorial font-bold text-zinc-900">{userName}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              {plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
            <span className="text-xs font-bold font-editorial text-zinc-900">{initials}</span>
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
