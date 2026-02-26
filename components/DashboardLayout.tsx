'use client';

import { Sidebar, MobileSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
