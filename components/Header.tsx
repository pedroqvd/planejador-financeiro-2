'use client';

import { Bell, Search, Menu } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="h-16 glass border-b border-zinc-200/60 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 -ml-2 mr-2 text-zinc-500 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-all duration-200">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block gradient-border rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200/70 rounded-xl leading-5 bg-white/60 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-indigo-300 sm:text-sm transition-all duration-300"
            placeholder="Buscar transações, categorias..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-600 relative transition-colors duration-200 hover:bg-zinc-100 rounded-xl">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-l border-zinc-200/60 pl-4">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-semibold text-zinc-800">João Silva</span>
            <span className="text-xs text-indigo-500 font-medium">Premium</span>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-indigo-100 ring-offset-1">
            <Image
              src="https://picsum.photos/100/100"
              alt="Avatar"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
