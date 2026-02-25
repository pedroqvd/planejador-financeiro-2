'use client';

import { Bell, Search, Menu } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 -ml-2 mr-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-xl leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-colors"
            placeholder="Buscar transações, categorias..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-500 relative">
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3 border-l border-zinc-200 pl-4">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-medium text-zinc-900">João Silva</span>
            <span className="text-xs text-zinc-500">Premium</span>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200">
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
