'use client';

import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Usuário';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const plan = session?.user?.plan || 'free';

  return (
    <header className="h-14 sm:h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 mr-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-0 border-b border-zinc-200 bg-transparent rounded-none leading-5 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 sm:text-sm transition-all duration-300"
            placeholder="Buscar transações, categorias..."
          />
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
